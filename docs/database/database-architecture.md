# Database Architecture

> Verified directly against each service's `app.module.ts` TypeORM/Mongoose registrations and the seed SQL files — **not** against `data-models/data-models.yaml` or `docs/adr/0001-database-strategy.md`, both of which are stale design-phase artifacts (see §5). If those two documents and this one disagree, trust this one; it was cross-checked against running code.

## 1. Technology split

| Database | Purpose | Shared or per-service? |
|---|---|---|
| **PostgreSQL** (single instance, DB `mentorapredict`) | Relational, canonical academic/identity data | One physical database, one `public` schema, shared by **all 5 services** — logical separation only (see §6) |
| **MongoDB Atlas** (single cluster, DB `mentorapredict_nosql`) | Append-mostly / schema-loose data: observations, AI audit logs, dataset versioning | Shared cluster/database, 3 of 5 services connect to it |
| **Redis** | Ephemeral state: refresh tokens, login throttling, one narrow metrics cache | Shared instance, 2 of 5 services have real wired usage |

All Mongo connections use `lazyConnection: true` + `bufferTimeoutMS: 3000` — an unreachable Atlas cluster degrades the specific Mongo-dependent feature instead of crashing the service at boot (see [../architecture/high-level-architecture.md](../architecture/high-level-architecture.md) §5).

## 2. Entity-to-table/collection mapping (verified per service)

### auth-service
| Postgres (TypeORM) | MongoDB |
|---|---|
| `users` (`UserOrmEntity`) | — |

### user-service
| Postgres (TypeORM) | MongoDB |
|---|---|
| `user_profiles` (`UserProfileOrmEntity`) | — |

### academic-service (largest — 12 Postgres entities)
| Postgres (TypeORM) | MongoDB |
|---|---|
| `faculties`, `careers`, `academic_periods`, `subjects`, `evaluations`, `enrollments`, `grades`, `grade_history`, `subject_teachers`, `grade_imports`, `weekly_check_ins`, `topics` | `teacher_observations` |

### analytics-service
| Postgres (TypeORM) | MongoDB |
|---|---|
| `student_metrics` (legacy, student-level), `alerts`, `student_subject_metrics` (current, subject-level), `notifications`, `device_tokens` | `dataset-version` |

### prediction-service
| Postgres (TypeORM) | MongoDB |
|---|---|
| `student_subject_predictions` (comment in code: "Fase 8 — first Postgres connection in prediction-service") | `prediction-log` |

**Audit note**: two Python interface stub files (`i_predict_use_case.py`, `i_prediction_log_repository.py`) exist under `prediction-service/src/application/ports/` but are dead/orphaned — the service's own `BOUNDARY.md` explicitly states "Stack: NestJS (TypeScript) puro. Sin Python ni runtime ML local." These files predate the current pure-TypeScript implementation and were never removed. Do not read them as evidence of a Python component — there isn't one.

## 3. Redis usage — real vs. dormant

| Service | Status | Key pattern(s) | TTL |
|---|---|---|---|
| auth-service | **Real, wired** | `auth:refresh:<userId>` (refresh token), `auth:ratelimit:login:<ip>` (login throttle counter) | n/a (SET/DEL) |
| analytics-service | **Real, wired, narrower than documented** | `metrics:<studentId>:<periodId>` (single consumer: `CalculateAverageUseCase`) | **300s (5 min)** hardcoded |
| academic-service | **Present but functionally dormant** | `RedisAdapter` class exists but is injected only in `health.controller.ts` for the liveness ping — not bound to any output port in `app.module.ts`, so no use case actually caches through it today | n/a |
| user-service, prediction-service | Not used | — | — |

`data-models/data-models.yaml`'s Redis section documents a different key shape (`metrics:student:<studentId>:<periodId>`) and a different TTL (3600s) than what's actually running — treat the table above as authoritative, not the design doc.

## 4. Seed data (`database/seeds/postgres/`, 11 files, run in numeric order)

No SQL migrations exist anywhere in the repo — schema is created purely by TypeORM `synchronize` (see §7). Seeding is handled separately by `infra/scripts/run-seeds.sh` (idempotent, sha256-checksummed per file, tracked in a `seed_history` table) inside the `database/Dockerfile.seed` container, run as the `seed-loader` service in every `docker-compose.*.yml`.

| File | Seeds |
|---|---|
| `00_users.sql` | 3 ADMIN + 15 TEACHER + 50 STUDENT accounts (`users` + `user_profiles`) |
| `01_faculties.sql` | 10 faculties (real UCE-style names/codes) |
| `02_careers.sql` | ~18 careers under those faculties |
| `03_academicPeriods.sql` | 8 academic periods, 2025-A → 2028-B (2026-A is the only `ACTIVE` one) |
| `04_subjects.sql` | 19 subjects forming a full 10-semester Ingeniería en Sistemas de Información curriculum |
| `05_enrollments.sql` | Deterministic enrollment of every student into 3–5 subjects for 2026-A (~70% ACTIVE / 20% WITHDRAWN / 10% `SUSPENDED` — see the enum discrepancy noted in [../business/business-logic.md](../business/business-logic.md) §5) |
| `06_evaluations.sql` | 3–5 evaluations per subject with weights |
| `07_grades.sql` | Grades (0–20 scale) for every active enrollment × evaluation, plus ~30% of grades get a `grade_history` correction entry |
| `08_subject_teachers.sql` | Syncs the `subject_teachers` join table to `subjects.teacherId` |
| `09_student_analytics.sql` | Seeds 3 tables in one pass: `weekly_check_ins` (4 weeks per active enrollment), `student_subject_metrics` (computed averages + risk level), `student_subject_predictions` (status `COMPUTED` + a recommendation string) |
| `10_topics.sql` | 5–6 real syllabus topics per subject (replaces an older generic "Unidad N" placeholder set) |

**MongoDB has zero seed data** (`database/seeds/mongo/` is an empty placeholder) — `teacher_observations`, `dataset-version`, `prediction-log` all start empty in every environment.

### Seed credentials (local/QA only — safe to document, not real secrets)

- Emails: `admin01@mentorapredict.edu.ec`…`admin03@…`, `teacher01@…`…`teacher15@…`, `student001@…`…`student050@…`
- Password (all seeded accounts): **`MP123456789`**
- UUIDs are deterministic (`aaaaaaaa-0000-4000-8000-0000000000XX` for admins, `bbbbbbbb-...` teachers, `cccccccc-...` students) — reproducible across environments.

## 5. Status of pre-existing design artifacts

| Artifact | Status |
|---|---|
| `data-models/data-models.yaml` | Detailed, column-level, but **stale/aspirational**: documents Postgres tables that don't exist (`password_reset_tokens`, `academic_risk`, `academic_metrics_snapshots`, a Postgres `observations` table), is missing real tables (`grade_history`, `subject_teachers`, `weekly_check_ins`, `topics`, `notifications`, `device_tokens`, `student_subject_predictions`, `student_subject_metrics`), documents 3 Mongo collections that don't exist (`recommendation_plans`, `ingestion_jobs`, `audit_logs`) while missing the 3 that do (`teacher_observations`, `dataset-version`, `prediction-log`), and its Redis section doesn't match real key/TTL values. Useful as a column-type/naming-convention reference, **not** as a source of truth for what tables/collections actually exist. |
| `docs/adr/0001-database-strategy.md` (Status: Proposed, never Accepted) | Correctly captures the high-level Postgres/Mongo/Redis split, but says Mongo is used "for prediction-service" only — misses that academic-service and analytics-service also connect to Mongo. Its recommendation of schema-per-service (§6 below) was never implemented. Left as-is (ADRs are historical records), this doc supersedes it for current-state questions. |

## 6. Known gap: no schema-per-service

Every service connects to the same Postgres database (`mentorapredict`) and the same default `public` schema — there is no `schema:` option set in any `app.module.ts`'s TypeORM config. This means, in principle, any service *could* query another service's tables directly (nothing in Postgres itself prevents it), even though in practice each service's TypeORM `forFeature()` registration only ever touches its own entities. `docs/adr/0001-database-strategy.md` originally recommended per-service schemas specifically to enforce this boundary at the database level; that recommendation was never carried out.

## 7. Known gap: no migrations

No `*.migration.ts` files, no `typeorm migration:run` step, no `migrationsRun` config anywhere in the repo. Every service sets `synchronize: cfg.get("NODE_ENV") !== "production"` — meaning:
- In **dev/QA**, TypeORM auto-creates/alters tables from entity definitions on every boot (convenient, but destructive schema drift is possible with no history/rollback).
- In **production**, `synchronize` is `false` and **nothing replaces it** — there is currently no mechanism to create or evolve the production schema through the deployment pipeline. This is a real production-readiness gap worth addressing (introducing `typeorm migration:generate`/`run` as an explicit CD step) rather than a designed behavior.
