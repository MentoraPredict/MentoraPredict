# Business Logic

> Domain model, actors, and end-to-end business rules for MentoraPredict. For requirement IDs (RF-/RNF-) see [functional-requirements.md](./functional-requirements.md) and [non-functional-requirements.md](./non-functional-requirements.md). For role-by-role scenarios see [use-cases.md](./use-cases.md). **Note**: this document covers subject-level academic risk, the only risk model actually implemented. Institution-level dropout/desertion is a distinct, unimplemented concept — see [dropout-prediction-proposal.md](./dropout-prediction-proposal.md) for a design proposal, not current behavior.

## 1. Domain summary

MentoraPredict is an early-warning academic platform for a university. It tracks students enrolled in subjects across academic periods, collects weekly self-reported and teacher-recorded signals, computes a deterministic academic-risk classification per student/subject, and layers an AI-generated natural-language summary + recommendation plan on top of that deterministic risk. The goal is to surface at-risk students to teachers/admins and to give students actionable feedback before a subject is lost.

The domain is owned by 5 backend microservices, each with a single bounded context (see [../architecture/low-level-architecture.md](../architecture/low-level-architecture.md) for the technical pattern):

| Bounded context | Service | Owns |
|---|---|---|
| Identity | auth-service | Credentials, JWT issuance, OAuth (Microsoft), password recovery, login/access history |
| Profile | user-service | User profile (photo, bio, status), avatar storage |
| Academic records | academic-service | Faculties, careers, periods, subject catalog + period-scoped subject offerings, enrollments, evaluations, grades, syllabus topics, class schedules/sessions, session attendance, weekly check-ins (with normalized per-topic comprehension), socioeconomic survey, teacher observations |
| Risk & metrics | analytics-service | Deterministic risk classification, trend, compliance, alerts, dashboards, notifications |
| AI prediction | prediction-service | AI-generated summary + recommendations (never computes risk itself) |

## 2. Actors (roles)

The system has exactly 3 roles (`Role` enum: `STUDENT`, `TEACHER`, `ADMIN`), enforced end-to-end by JWT claims validated at Kong (route-level `jwt` plugin) and re-validated per-endpoint by each service's `RolesGuard`/`@Roles(...)` decorator.

- **STUDENT** — enrolls (via ADMIN/TEACHER) in subjects, submits weekly check-ins (attendance self-report + per-topic comprehension), responds to the socioeconomic survey (repeatable), views their own grades/metrics/risk/predictions/alerts, can request an on-demand AI prediction (rate-limited).
- **TEACHER** — owns one or more subjects per period (`subject_teachers`), records evaluations/grades, manages syllabus topics, defines the weekly class schedule for a subject and registers per-session attendance directly (takes precedence over student self-report), writes qualitative observations about students, sees per-subject risk/alerts for their own students only, cannot see other teachers' subjects.
- **ADMIN** — full CRUD over faculties/careers/periods/subjects/users, can act on behalf of any teacher (assign teacher to subject, create/edit any subject, manage enrollments), sees institution-wide dashboards, manages user accounts (create/deactivate/role-change).

There is no "GUEST"/anonymous role for any authenticated feature — public routes are limited to register/login/forgot-password/OAuth-start and the landing page.

## 3. Core business rules

### 3.1 Enrollment
- A student enrolls in a **subject offering** (`subjects` — a specific `subject_catalog` entry, taught in one `academic_period`) for a specific `academic_period` (only one period is `ACTIVE` at a time per the seed convention, though the schema allows several). See §3.9 for why `subjects` and `subject_catalog` are two separate tables.
- Enrollment status is one of `ACTIVE`, `WITHDRAWN`, `COMPLETED`, `SUSPENDED` — the full 4-value `EnrollmentStatus` enum, centralized in `@mentorapredict/shared-types` since Fase 1 of the data-model restructuring, with a matching Postgres `CHECK` constraint on `enrollments.status` since Fase 4 (previously only a plain, unconstrained `varchar`; see [../database/database-architecture.md](../database/database-architecture.md)).
- Only ADMIN/TEACHER can create enrollments (single or batch); a TEACHER can only enroll students into subjects they own.

### 3.2 Grading
- Grades are recorded on a **0–20 scale** (confirmed via `NUMERIC(4,2)` columns and seed data ranges) — several older design docs (`docs/api/api-contracts.md`'s predecessor, `data-models.yaml`) incorrectly describe a 0–10 scale; 0–20 is the real, implemented scale.
- A subject defines one or more `evaluations`, each with a `weight` (0–100). A student's subject average is the weight-adjusted mean of their evaluation grades.
- Every grade update is audited into `grade_history` (previous value, new value, who changed it, when) — grades are never silently overwritten.
- Grades can be recorded one at a time or bulk-imported from a spreadsheet (`.xlsx`/`.csv`) via a tracked `grade_imports` job (row counts, per-row errors, status).

### 3.3 Weekly check-ins (student self-report)
- A student can submit **one check-in per subject per academic week**, capturing: attendance, task completion, study hours, self-reported emotional state, self-rated general comprehension, and a per-topic comprehension score (0-100) for each syllabus topic — normalized into `weekly_check_in_topic_responses` since Fase C (real FK to `topics`, so an invalid/foreign `topicId` is rejected by Postgres itself, not just by the use case).
- **`attendance` is no longer a number the student types directly** (Fase B) — it's recalculated on every check-in upsert from `session_attendances`: for every real class session that week (`class_sessions`, generated from the subject's `class_schedules`), the student's own self-report counts unless the teacher registered attendance for that same session, in which case the teacher's record wins. The result is expressed as the same 0-100 the rest of the system already expects, so no downstream contract changed — see §3.10 for the full mechanism.
- Check-ins are the raw signal analytics-service aggregates into `student_subject_metrics` (weekly snapshot: average grade, compliance index, attendance rate, study hours, comprehension average, trend slope, and the classified risk level for that week). Because `attendance` keeps flowing through the same `weekly_check_ins.attendance` column, **analytics-service needed zero code changes** to benefit from the more accurate, session-backed number.

### 3.4 Risk classification (deterministic, analytics-service only)
- Risk level is one of `LOW / MEDIUM / HIGH / CRITICAL` (**4 values** — this is the real domain value set used by `ClassifyRiskUseCase`, `AlertEntity`, and the seed data's scoring algorithm). Configurable via `RISK_HIGH_THRESHOLD`/`RISK_CRITICAL_THRESHOLD` env vars.
- Risk is computed **exclusively** by analytics-service, from grade average + compliance + attendance + trend. No other service (including prediction-service) is allowed to compute or override a risk level — they only consume analytics-service's `risk-snapshot`.
- `RiskLevel`'s 4 values (`LOW/MEDIUM/HIGH/CRITICAL`) are centralized in `@mentorapredict/shared-types` since Fase 1 — analytics-service and prediction-service both import it rather than redefining it locally, and `student_subject_metrics.risk_level`/`student_subject_predictions.predicted_risk_level` both have a matching Postgres `CHECK` constraint since Fase 4.

### 3.5 Alerts
- An alert (`AlertEntity`) is generated when a student's risk crosses into `MEDIUM`/`HIGH`/`CRITICAL` territory, or synthetically by the frontend for conditions like "average below the 14/20 passing grade" or "multiple high-risk students in a course." Alerts persist with a status (`UNREAD`/`ACTIVE`/resolved) and can be resolved by a TEACHER with a note.
- 14/20 is the institutional passing-grade threshold referenced by the frontend's synthetic alert generation (`course-analytics.service.ts`).

### 3.6 AI prediction (prediction-service)
- prediction-service **never** computes risk itself — it fetches the deterministic risk snapshot from analytics-service (`GET /internal/risk-snapshot/:studentId/:periodId`) and the student's academic context (grades, topics) from academic-service, then asks OpenAI to produce a natural-language `summary` + a list of `recommendations`. The risk *level* shown to the user always originates from analytics-service; OpenAI only writes the explanation text.
- Two granularities exist: a **global** per-period prediction (all subjects combined) and a **per-subject** prediction. Both are cached/persisted (`student_subject_predictions` in Postgres for the per-subject rule-based version, `prediction_logs` in MongoDB as a full audit trail of every AI generation).
- On-demand student-triggered generation is rate-limited to **1 request per hour** (per student, and separately per student+subject) to bound OpenAI API cost.

### 3.7 Notifications
- Notifications (owned by analytics-service's `notifications` sub-module) are created for events like a new alert, a role/status change, or a deactivation. They're delivered two ways simultaneously: persisted to Postgres (source of truth, fetched via `GET /notifications/me`) and pushed in real time via Socket.IO (`notification:new` event, room `user:{userId}`) to connected web/desktop clients. Mobile does not use Socket.IO — it registers an Expo push token instead and receives native push notifications.

### 3.8 Deactivation safeguards
- An ADMIN cannot deactivate a TEACHER or STUDENT who has active academic dependencies (e.g., a teacher currently owning active subjects, a student with active enrollments) — `CheckUserDeactivationEligibilityUseCase` in academic-service blocks the operation and the frontend shows a restriction dialog explaining why.

### 3.9 Subject catalog vs. subject offering (added in [database-update-plan.md](../database/database-update-plan.md) Fase A)
- **`subject_catalog`** is the subject as a timeless concept — "Bases de Datos I" exists once, with its name/code/credits/career. **`subjects`** is the period-scoped *offering* of a catalog entry (`UNIQUE(subject_catalog_id, academic_period_id)` — the same subject can be offered at most once per period, but can be re-offered every period indefinitely).
- This split fixed a real structural bug, not a hypothetical one: before Fase A, `subjects.code` was globally `UNIQUE` and `subjects.academic_period_id` was `NOT NULL`, so a subject could only ever exist in **one period, forever** — re-offering "Bases de Datos I" in a second semester was structurally impossible without inventing a fake second code, and it broke the cross-period trend analysis analytics-service/prediction-service already compute per subject.
- `max_capacity`, `teacher_id`, and `is_active` stay on `subjects` (the offering), not on `subject_catalog` — they're properties of *this semester's* instance of the course (a different teacher or capacity next semester doesn't change what the subject *is*).
- Creating a subject offering (`POST /subjects`) can either point at an existing `subject_catalog_id` (re-offering) or supply the catalog fields inline (first-time offering, catalog row created transparently) — both paths produce the same result, so the endpoint's contract didn't need to change for existing callers.

### 3.10 Session-based attendance (Fase B)
- A subject offering's weekly schedule (`class_schedules` — day + start/end time, one or more slots per week) is defined once via `POST /subjects/:id/schedule`, either at creation time or afterward. Redefining an already-scheduled subject is rejected (`ConflictException`) — the schedule is meant to be set once per offering, matching the real-world fact that a semester's timetable doesn't change mid-course.
- Defining the schedule immediately generates every concrete `class_sessions` row (one per matching weekday) across the *entire* `academic_period`'s date range — so a subject meeting Monday and Wednesday in a 16-week period gets 32 sessions up front, each independently markable `PLANNED`/`HELD`/`CANCELLED`.
- **Two paths write attendance**, both landing in `session_attendances`:
  1. **Student self-report** — folded automatically into the student's weekly check-in (`attendance >= 50` on the 0-100 scale the student already reports maps to `present = true`), tagged `STUDENT_SELF_REPORT`.
  2. **Teacher record** — `POST /subjects/:id/sessions/:sessionId/attendance`, a batch endpoint (`TEACHER`, own subjects only, or `ADMIN`), tagged `TEACHER`.
- **Precedence rule**: when both exist for the same session/student, **the teacher's record always wins**. The weekly `attendance` percentage shown everywhere downstream (`weekly_check_ins.attendance`, and everything analytics-service computes from it) is recalculated as the share of that week's sessions where the student was present, preferring the teacher's record per session and falling back to self-report only where the teacher never registered one.
- A subject with no schedule defined has no `class_sessions`, so attendance stays purely self-reported (the old behavior) until a teacher/admin defines one — this is the state of every one of the 19 seeded subjects today (see §6).

### 3.11 Socioeconomic survey (Fase D)
- `survey_questions` is a generic, reusable question catalog (not hardcoded to socioeconomic data) — today populated only for `survey_code = 'SOCIOECONOMIC'`. Adding a question is a new row, not a migration.
- A student can submit the same survey **more than once, including within the same academic period** — deliberately, no `UNIQUE` constraint exists on `(student_id, period_id, survey_code)`. Each submission is an independent, immutable `survey_responses` row with its own `survey_answers`; nothing is ever updated in place. This is intentional: the goal is for MentoraPredict to build an evolving picture of a student's situation over time, not a single static snapshot.
- Today nothing *consumes* survey data automatically (no risk/alert logic reads `survey_responses`) — it's captured and queryable (`GET /students/me/survey-responses`) but purely informational until a future phase wires it into risk classification or teacher-facing views (out of scope for Fases A-E, see §6).

### 3.12 Platform access tracking (Fase E)
- Every successful login (`LOCAL` or `MICROSOFT`) is recorded in `login_events` (auth-service) with timestamp, IP, and user-agent — fire-and-forget, so a failure to record never blocks or fails the login itself.
- `device_type` exists on the table but is intentionally left `NULL` in every row — reserved for a future device-detection feature, not implemented in this phase (explicit scope decision: "a futuro, pero dejarlo listo").
- No endpoint reads `login_events` back yet (no admin-facing access-history view exists) — see §6.

## 4. Cross-service business workflows

### 4.1 "Grade recorded → risk recalculated → alert/notification" pipeline
1. TEACHER records/updates a grade or a STUDENT submits a check-in (academic-service).
2. academic-service calls analytics-service's internal recalculation endpoint (`POST /internal/recalculate`).
3. analytics-service recomputes `student_subject_metrics` for that student/subject (average, compliance, trend via the WASM linear-regression module, risk level), and generates an alert if the new risk level warrants one.
4. analytics-service calls prediction-service's internal recalculation endpoint, which refreshes the deterministic per-subject prediction and fires-and-forgets a refresh of the AI-generated recommendation text.
5. A notification is created and pushed (Postgres + Socket.IO/Expo push) if applicable.

This is fully synchronous HTTP, service-to-service, authenticated via a signed internal JWT (`scope: service:internal`) — there is no message broker/event bus anywhere in the system.

### 4.2 "New user" pipeline
1. `POST /auth/register` (auth-service) creates the credential row (`users` table) and issues no profile yet.
2. auth-service calls user-service internally to create the matching `user_profiles` row.
3. Role defaults to `STUDENT` for self-registration; ADMIN-created users (`CreateUserForm`) can be assigned any role directly.

## 5. Known domain/documentation inconsistencies

Real discrepancies found between different parts of the codebase/docs, documented here rather than papered over. Four of the five below are resolved — three by the Fase 1/4 data-model restructuring (enum centralization in `@mentorapredict/shared-types` + matching Postgres `CHECK` constraints), one by fixing the seed files during the Fases A-E documentation pass — kept in this table as a historical record of what was inconsistent and how it was resolved, not as an open gap:

| Topic | Discrepancy | Status |
|---|---|---|
| `EnrollmentStatus` | TS enum: `ACTIVE/WITHDRAWN/COMPLETED` (3). Seed data wrote a 4th, `SUSPENDED`, into an untyped varchar column. | **Resolved** (Fase 1/4) — `EnrollmentStatus` now has all 4 values in `shared-types`, with a Postgres `CHECK` constraint on `enrollments.status`. |
| `RiskLevel` | Real analytics-service domain + seed data: 4 values (`LOW/MEDIUM/HIGH/CRITICAL`). `packages/shared-types`: 3 values (no `CRITICAL`). `contracts/openapi-contracts.yaml` schema: also 3 values. | **Resolved** (Fase 1/4) — `shared-types` now declares all 4 values; both consuming services import it. `contracts/openapi-contracts.yaml` updated to match. |
| `AuthProvider` | Found during the same audit, previously undocumented: `auth-service`'s real, implemented set is `LOCAL/MICROSOFT` (2). `user-service` independently declared `LOCAL/GOOGLE/MICROSOFT` (3) — `GOOGLE` was aspirational, never implemented in `auth-service`. | **Resolved** (Fase 1) — new `AuthProvider` enum in `shared-types` with the real 2-value set; both services import it, `GOOGLE` removed from `user-service`. |
| Grade scale | Real: 0–20 (`NUMERIC(4,2)`, confirmed in seed data and entity definitions). Some older docs/contracts describe 0–10. | Open — unrelated to the enum-centralization work above; not part of this restructuring's scope. |
| RF-007 / RF-008 | `academic-service`'s controller comments tag "enroll student" as RF-007 and "create evaluation"/"register grade" as RF-008; `contracts/openapi-contracts.yaml` assigns those same features to RF-010 and RF-012 respectively. Unreconciled labeling mismatch between code comments and the design contract. | Open — unrelated to the enum-centralization work above; not part of this restructuring's scope. |
| Seed data vs. Fases A-E schema | `04_subjects.sql` and `09_student_analytics.sql` (old numbering) inserted against pre-Fase-A/C column shapes; a fresh-database test run also surfaced an older, unrelated gap dating back to Fase 4 — no seed had ever populated `academic_user_references`/`analytics_*_references`/`prediction_*_references`, so seeding from an empty database already failed at `subjects.teacher_id` before Fases A-E ever touched the schema. | **Resolved** — both issues fixed and verified against a scratch database (all 5 services migrated from zero, all 13 seed files run in order, zero errors, row counts/joins checked). See [../database/database-architecture.md](../database/database-architecture.md) §4 for the current seed file list. |

See [../database/database-architecture.md](../database/database-architecture.md) and [../database/entity-relationship-diagram.md](../database/entity-relationship-diagram.md) for the underlying data-model detail behind the resolved rows, and [functional-requirements.md](./functional-requirements.md) for the RF-007/008 discrepancy in context.

## 6. What's still left after Fases A-E ([database-update-plan.md](../database/database-update-plan.md))

With all 5 phases closed (subject catalog, session-based attendance, normalized per-topic comprehension, socioeconomic survey, access logging — all implemented, migrated, and verified against the real database), here's what the data model already supports but **doesn't yet have a full application/UI layer around**:

- **The frontend (`apps/web`) doesn't consume any of the new endpoints** — deliberately out of scope for the plan. Neither the `subject-catalog` CRUD, nor schedule/session definition, nor teacher-side attendance registration, nor the socioeconomic survey have a screen yet; the student's weekly check-in still works (the frontend already called that endpoint), but it doesn't surface the per-session breakdown that now exists behind it.
- **`survey_questions` is empty** — there's no seed or data migration for the socioeconomic survey's question catalog. Until an ADMIN creates questions via `POST /surveys/questions`, `GET /surveys/SOCIOECONOMIC/questions` returns an empty list and the survey has nothing to answer.
- **None of the 19 seeded subjects has a schedule defined** — the 513 sessions generated under the old (week-only) design were deleted rather than backfilled with fabricated schedules (an explicit user decision). Until someone calls `POST /subjects/:id/schedule` for each real offering, no `class_sessions` exist and attendance stays 100% self-reported — the system works, just without Fase B's real contribution yet.
- **Socioeconomic survey data feeds no calculation** — neither `analytics-service` nor `prediction-service` reads `survey_responses`. It's pure data capture for now; wiring it into the risk model is a later-phase change, explicitly out of scope for this plan.
- **`login_events` has no read view** — every access is recorded, but no endpoint (and no ADMIN screen) exposes that history yet. `device_type` remains unpopulated (reserved on purpose).
- **Redefining an already-set schedule isn't supported** (`DefineSubjectScheduleUseCase` rejects it with `ConflictException`) — a deliberate Fase B simplification, not a bug; if a schedule genuinely changes mid-semester, there's currently no way to fix it without touching the database directly.
