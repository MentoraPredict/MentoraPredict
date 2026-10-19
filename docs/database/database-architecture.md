# Database Architecture

> Verified directly against each service's `app.module.ts` TypeORM registrations and the seed SQL files — **not** against `data-models/data-models.yaml` or `docs/adr/0001-database-strategy.md`, both of which are stale design-phase artifacts (see §5). If those two documents and this one disagree, trust this one; it was cross-checked against running code.
>
> For the visual entity-relationship diagram, the proposed physical-FK/`onDelete` layer, and the cross-service reference table, see [entity-relationship-diagram.md](./entity-relationship-diagram.md).

## 1. Technology split

| Database | Purpose | Shared or per-service? |
|---|---|---|
| **PostgreSQL** (single instance, DB `mentorapredict`) | Relational, canonical academic/identity data, plus append-mostly / schema-loose data (teacher observations, AI audit logs, dataset versions) stored in `jsonb` columns | One physical database, one `public` schema, shared by **all 5 services** — logical separation only (see §6) |
| **Redis** | Ephemeral state: refresh tokens, login throttling, one narrow metrics cache | Shared instance, 2 of 5 services have real wired usage |

> **MongoDB was removed.** The three collections it used to hold (`teacher_observations`, `dataset_versions`, `prediction_logs`) are now regular PostgreSQL tables owned by `academic-service`, `analytics-service` and `prediction-service` respectively. The audit-style tables (`dataset_versions`, `prediction_logs`) are written best-effort: a failed write is logged as a warning and never fails the calculation that produced it.

## 2. Entity-to-table mapping (verified per service)

### auth-service
| Postgres (TypeORM) |
|---|
| `users` (`UserOrmEntity`), `login_events` (`LoginEventOrmEntity`) |

`login_events` (added in the database-update-plan Fase E) records every successful login (local or Microsoft OAuth) with `ip_address`/`user_agent`, fire-and-forget from `LoginUserUseCase`/`OAuthLoginUseCase` so a recording failure never blocks a login. `device_type` exists but is left `NULL` — reserved for a future device-detection feature, not populated yet.

### user-service
| Postgres (TypeORM) |
|---|
| `user_profiles` (`UserProfileOrmEntity`) |

### academic-service (largest — Postgres entities for the school domain plus the legacy check-in and survey tables)
| Postgres (TypeORM) |
|---|
| `school_years`, `academic_periods`, `institutions` (+ levels, grading scales and bands, attendance and promotion rules, `grading_components`), `grade_levels`, `sections`, `curriculum_subjects`, `subject_catalog`, `subjects`, `evaluations`, `enrollments`, `grades`, `grade_history`, `subject_teachers`, `grade_imports`, `topics`, `class_schedules`, `class_sessions`, `session_attendances`, `weekly_check_ins`, `weekly_check_in_topic_responses`, `survey_questions`, `survey_responses`, `survey_answers`, `teacher_observations`, `student_profiles`, `guardian_students`, `consents`, `student_enrollments`, `period_closures`, `period_results`, `supplementary_grades`, `promotion_decisions`, `absence_justifications` |

> Faculties, careers and credits were removed in the school conversion (migration `1792100000006-RemoveUniversityModel`). The Fase A paragraph below describes the catalog as it was designed; today it carries no career or credits.

`teacher_observations` (`TeacherObservationOrmEntity`) holds the free-text observations a teacher records about a student: `student_id`/`teacher_id` → `academic_user_references`, `subject_id` → `subjects`, `type` constrained by a CHECK to `ACADEMIC | BEHAVIORAL | ATTENDANCE | PERFORMANCE`, indexed by `(student_id, created_at)`.

8 tables added by the database-update-plan Fases A-D (see [entity-relationship-diagram.md](./entity-relationship-diagram.md) §4.3 for full column/FK/CHECK detail):
- **Fase A** — `subject_catalog` split off from `subjects`: the catalog row is the subject as a timeless concept (name/code/credits/career), `subjects` became the period-scoped *offering* of a catalog row (`UNIQUE(subject_catalog_id, academic_period_id)`). Fixes a real structural bug: before this, `subjects.code` was globally `UNIQUE` and `academic_period_id` was `NOT NULL`, so a subject could only ever exist in one period, breaking the cross-period trend analysis analytics-service/prediction-service already compute.
- **Fase B** — `class_schedules` (real weekly day/time slot per offering) + `class_sessions` (concrete dated occurrence of a slot, generated across the whole period date range) + `session_attendances` (per-student attendance per session, `STUDENT_SELF_REPORT` or `TEACHER`, teacher record wins when both exist).
- **Fase C** — `weekly_check_in_topic_responses` replaces the old `weekly_check_ins.topic_responses` jsonb column with a normalized table carrying a real FK to `topics`, so Postgres — not just application code — rejects a `topicId` that doesn't exist or doesn't belong to the check-in's subject.
- **Fase D** — `survey_questions` (generic question catalog, reused for the socioeconomic survey via `survey_code = 'SOCIOECONOMIC'`) + `survey_responses`/`survey_answers` (deliberately no `UNIQUE` on `(student_id, period_id)` — a student can resubmit the same survey more than once, even within the same period, so MentoraPredict's picture of their situation can evolve over time).

### analytics-service
| Postgres (TypeORM) |
|---|
| `student_metrics` (legacy, student-level), `alerts`, `student_subject_metrics` (current, subject-level), `notifications`, `device_tokens`, `dataset_versions` |

`dataset_versions` (`DatasetVersionOrmEntity`) is the calculation audit trail: `student_id` → `analytics_user_references`, `type`, `inputs` and `result` as `jsonb`, `timestamp`, indexed by `(student_id, type, timestamp)`.

### prediction-service
| Postgres (TypeORM) |
|---|
| `student_subject_predictions` (comment in code: "Fase 8 — first Postgres connection in prediction-service"), `prediction_logs` |

`prediction_logs` (`PredictionLogOrmEntity`) is the full audit record of every AI generation: `student_id`/`subject_id`/`period_id` → the local `prediction_*_references` tables (`subject_id` is nullable for period-wide predictions), `risk` and `recommendations` as `jsonb`, `summary`, `model_version`, `created_at`, indexed by `(student_id, subject_id, created_at)`.

**Audit note**: two Python interface stub files (`i_predict_use_case.py`, `i_prediction_log_repository.py`) exist under `prediction-service/src/application/ports/` but are dead/orphaned — the service's own `BOUNDARY.md` explicitly states "Stack: NestJS (TypeScript) puro. Sin Python ni runtime ML local." These files predate the current pure-TypeScript implementation and were never removed. Do not read them as evidence of a Python component — there isn't one.

## 3. Redis usage — real vs. dormant

| Service | Status | Key pattern(s) | TTL |
|---|---|---|---|
| auth-service | **Real, wired** | `auth:refresh:<userId>` (refresh token), `auth:ratelimit:login:<ip>` (login throttle counter) | n/a (SET/DEL) |
| analytics-service | **Real, wired, narrower than documented** | `metrics:<studentId>:<periodId>` (single consumer: `CalculateAverageUseCase`) | **300s (5 min)** hardcoded |
| academic-service | **Present but functionally dormant** | `RedisAdapter` class exists but is injected only in `health.controller.ts` for the liveness ping — not bound to any output port in `app.module.ts`, so no use case actually caches through it today | n/a |
| user-service, prediction-service | Not used | — | — |

`data-models/data-models.yaml`'s Redis section documents a different key shape (`metrics:student:<studentId>:<periodId>`) and a different TTL (3600s) than what's actually running — treat the table above as authoritative, not the design doc.

## 4. Seed data (`database/seeds/postgres/`, 10 files, run in numeric order)

Schema is created by versioned TypeORM migrations, run as an explicit CD step before seeding (see §7). Seeding is handled separately by `infra/scripts/run-seeds.sh` (idempotent, sha256-checksummed per file, tracked in a `seed_history` table) inside the `database/Dockerfile.seed` container, run as the `seed-loader` service in every `docker-compose.*.yml`.

The seeds describe a school (school year 2026-2027, three terms, two sections) and are meant for a **freshly created database**: the unique index of active periods and school years would reject them next to rows from the previous university seeds. All dates, hours and curricula are sample data, not the official calendar. See [../erp-escolar/10-estado-de-implementacion.md](../erp-escolar/10-estado-de-implementacion.md) §5 to recreate the environment.

| File | Seeds |
|---|---|
| `00_users.sql` | 3 ADMIN + 15 TEACHER + 50 STUDENT accounts (`users` + `user_profiles`) |
| `01_staff_and_guardians.sql` | 1 SECRETARY, 1 DECE, 1 INSPECTOR and 25 GUARDIAN accounts |
| `02_user_references.sql` | Populates `academic_user_references`/`analytics_user_references`/`prediction_user_references` from `users` (id, role, is_active) — stands in for the real upsert-on-HTTP-call sync (§3 of [entity-relationship-diagram.md](./entity-relationship-diagram.md)) that only happens once real app traffic occurs |
| `03_school_year.sql` | School year 2026-2027 (Sierra-Amazonía, `ACTIVE`) with three `TRIMESTER` periods; the first one is the active period |
| `04_structure.sql` | 10 subjects in `subject_catalog`, curriculum for 8.º/9.º EGB and 1.º BGU, 4 sections with tutor, 28 courses (`subjects` with `section_id`) with a rotating teacher, `subject_teachers` and 3 syllabus topics per subject |
| `05_people_enrollment.sql` | Student profiles, guardian links (each guardian has two students), consents, `student_enrollments` for students 001–048 (049 and 050 stay unenrolled) and the derived `enrollments` |
| `06_evaluations_grades.sql` | 3 formative + 1 summative activity per course in the first term and 0–10 grades with low, medium and high performers; ~4 % of grades are left unrecorded |
| `07_attendance.sql` | `class_schedules`, `class_sessions` for the whole school year, teacher-recorded `session_attendances` up to today (some students with frequent absences) and `absence_justifications` in every status |
| `08_subject_period_references.sql` | Populates `analytics_subject_references`/`analytics_period_references`/`prediction_subject_references`/`prediction_period_references` from `subjects`/`academic_periods`, same rationale as `02_user_references.sql` |
| `09_student_analytics.sql` | Seeds 4 tables in one pass: `weekly_check_ins` (one per week since the start of the active period), `weekly_check_in_topic_responses` (up to 3 per check-in), `student_subject_metrics` (0–10 averages + risk level), `student_subject_predictions` (status `COMPUTED` + a recommendation string) |

`teacher_observations`, `dataset_versions` and `prediction_logs` have no seed data — they start empty in every environment and fill from real application traffic. Because they carry foreign keys to the reference tables, `02_user_references.sql` and `08_subject_period_references.sql` must have run first (they do, by numeric order).

### Seed credentials (local/QA only — safe to document, not real secrets)

- Emails: `admin01`, `teacher01..08`, `student001..026`, `guardian01..13`, `secretary01`, `dece01` and `inspector01`, all `@mentorapredict.edu.ec`
- Password (all seeded accounts): **`MP123456789`**
- UUIDs are deterministic (`aaaaaaaa-0000-4000-8000-0000000000XX` for admins, `bbbbbbbb-...` teachers, `cccccccc-...` students, `dddddddd-...` guardians) — reproducible across environments.

## 5. Status of pre-existing design artifacts

| Artifact | Status |
|---|---|
| `data-models/data-models.yaml` | Detailed, column-level, but **stale/aspirational**: documents Postgres tables that don't exist (`password_reset_tokens`, `academic_risk`, `academic_metrics_snapshots`, a Postgres `observations` table), is missing real tables (`grade_history`, `subject_teachers`, `weekly_check_ins`, `topics`, `notifications`, `device_tokens`, `student_subject_predictions`, `student_subject_metrics`), does not list the audit tables that actually exist (`teacher_observations`, `dataset_versions`, `prediction_logs`; its former MongoDB section was removed together with MongoDB), and its Redis section doesn't match real key/TTL values. Useful as a column-type/naming-convention reference, **not** as a source of truth for what tables/collections actually exist. |
| `docs/adr/0001-database-strategy.md` (Status: Proposed, never Accepted) | Captured a Postgres/Mongo/Redis split that no longer exists — MongoDB was removed and its data moved to Postgres (see §1). Its recommendation of schema-per-service (§6 below) was never implemented. Kept as a historical record with an update note at the top (ADRs are not rewritten); this doc supersedes it for current-state questions. |

## 6. Schema-per-service: resolved via a different mechanism than originally proposed

Every service still connects to the same Postgres database (`mentorapredict`) and the same default `public` schema — there is no `schema:` option set in any `app.module.ts`'s TypeORM config, and `docs/adr/0001-database-strategy.md`'s original recommendation of per-service Postgres schemas was never carried out. Instead, the bounded-context boundary is enforced by a narrower, deliberate rule adopted during the Fase 4 restructuring (see [entity-relationship-diagram.md](./entity-relationship-diagram.md) §1): **a physical foreign key is only ever added between two tables owned by the same service.** Cross-service references (e.g. `enrollments.student_id` → `auth-service.users.id`) stay as plain `uuid` columns with no physical FK, backed instead by a local reference table that each consuming service keeps in sync via upsert on its own real HTTP traffic (§3 of the same document). This gives each service real, Postgres-enforced referential integrity for its own data without letting a physical constraint couple two services' schemas together — the risk that motivated the original schema-per-service recommendation — while stopping short of full Postgres-level tenant isolation between services.

## 7. Migrations — implemented (Fase 3-4, extended by Fases A-E)

While the project is still in development, each service's migration history was squashed into a single `Baseline` migration generated from its current entities (verified equivalent to the previous incremental chain by diffing `pg_dump --schema-only` output, then applied together with all 13 seed files from an empty database with zero errors). Future schema changes are added as new migrations on top of that baseline.

All 5 services have a `src/data-source.ts` (CLI-facing `DataSource` config) and a `src/migrations/` folder with `migration:generate`/`migration:run`/`migration:revert` npm scripts, each tracked in its own `migrations_<service>` table (a shared default `migrations` table would have conflated all 5 services' histories, since they share one physical database). `synchronize` is hardcoded to `false` unconditionally in every `app.module.ts` — no longer conditional on `NODE_ENV`, closing the risk described below. CD (`cd-qa.yml`/`cd-main.yml`) runs `migration:run` for every service as an explicit `[MIGRATIONS]` step, positioned after pulling images and before starting services, ahead of `seed-loader`. `academic-service` and `auth-service` each gained further migrations from `docs/database/database-update-plan.md` Fases A-E (catálogo de materias, asistencia por sesión, encuesta de comprensión normalizada, encuesta socioeconómica, registro de acceso) — see [entity-relationship-diagram.md](./entity-relationship-diagram.md) §4.1/§4.3 for the resulting schema. Verified end-to-end against a scratch database (migrations for all 5 services from zero, then all 13 seed files in order, zero errors) — the seed gap described in §4 that used to make this fail on a fresh environment is closed.

This closes a real production risk that existed before Fase 2: `docker-compose.qa.yml`/`docker-compose.prod.yml` defaulted `NODE_ENV` to `development` when the CD-generated `.env` never set it explicitly, meaning `synchronize: NODE_ENV !== "production"` was very likely **true** (auto-sync active) in QA and production — undocumented, unversioned schema changes on every deploy. Fixed by both making `NODE_ENV=production` explicit in the CD `.env` generation step and removing the conditional entirely.
