# Business Logic

> Domain model, actors, and end-to-end business rules for MentoraPredict. For requirement IDs (RF-/RNF-) see [functional-requirements.md](./functional-requirements.md) and [non-functional-requirements.md](./non-functional-requirements.md). For role-by-role scenarios see [use-cases.md](./use-cases.md).

## 1. Domain summary

MentoraPredict is an early-warning academic platform for a university. It tracks students enrolled in subjects across academic periods, collects weekly self-reported and teacher-recorded signals, computes a deterministic academic-risk classification per student/subject, and layers an AI-generated natural-language summary + recommendation plan on top of that deterministic risk. The goal is to surface at-risk students to teachers/admins and to give students actionable feedback before a subject is lost.

The domain is owned by 5 backend microservices, each with a single bounded context (see [../architecture/low-level-architecture.md](../architecture/low-level-architecture.md) for the technical pattern):

| Bounded context | Service | Owns |
|---|---|---|
| Identity | auth-service | Credentials, JWT issuance, OAuth (Microsoft), password recovery |
| Profile | user-service | User profile (photo, bio, status), avatar storage |
| Academic records | academic-service | Faculties, careers, periods, subjects, enrollments, evaluations, grades, syllabus topics, weekly check-ins, teacher observations |
| Risk & metrics | analytics-service | Deterministic risk classification, trend, compliance, alerts, dashboards, notifications |
| AI prediction | prediction-service | AI-generated summary + recommendations (never computes risk itself) |

## 2. Actors (roles)

The system has exactly 3 roles (`Role` enum: `STUDENT`, `TEACHER`, `ADMIN`), enforced end-to-end by JWT claims validated at Kong (route-level `jwt` plugin) and re-validated per-endpoint by each service's `RolesGuard`/`@Roles(...)` decorator.

- **STUDENT** — enrolls (via ADMIN/TEACHER) in subjects, submits weekly check-ins, views their own grades/metrics/risk/predictions/alerts, can request an on-demand AI prediction (rate-limited).
- **TEACHER** — owns one or more subjects per period (`subject_teachers`), records evaluations/grades, manages syllabus topics, writes qualitative observations about students, sees per-subject risk/alerts for their own students only, cannot see other teachers' subjects.
- **ADMIN** — full CRUD over faculties/careers/periods/subjects/users, can act on behalf of any teacher (assign teacher to subject, create/edit any subject, manage enrollments), sees institution-wide dashboards, manages user accounts (create/deactivate/role-change).

There is no "GUEST"/anonymous role for any authenticated feature — public routes are limited to register/login/forgot-password/OAuth-start and the landing page.

## 3. Core business rules

### 3.1 Enrollment
- A student enrolls in a subject for a specific `academic_period` (only one period is `ACTIVE` at a time per the seed convention, though the schema allows several).
- Enrollment status is one of `ACTIVE`, `WITHDRAWN`, `COMPLETED` per the TypeScript `EnrollmentStatus` enum — **note:** seed data also writes a `SUSPENDED` status, which works only because the `enrollments.status` column is a plain `varchar`, not a real Postgres/TS enum constraint. This is a known inconsistency, not an intentional 4th status — see [../database/database-architecture.md](../database/database-architecture.md).
- Only ADMIN/TEACHER can create enrollments (single or batch); a TEACHER can only enroll students into subjects they own.

### 3.2 Grading
- Grades are recorded on a **0–20 scale** (confirmed via `NUMERIC(4,2)` columns and seed data ranges) — several older design docs (`docs/api/api-contracts.md`'s predecessor, `data-models.yaml`) incorrectly describe a 0–10 scale; 0–20 is the real, implemented scale.
- A subject defines one or more `evaluations`, each with a `weight` (0–100). A student's subject average is the weight-adjusted mean of their evaluation grades.
- Every grade update is audited into `grade_history` (previous value, new value, who changed it, when) — grades are never silently overwritten.
- Grades can be recorded one at a time or bulk-imported from a spreadsheet (`.xlsx`/`.csv`) via a tracked `grade_imports` job (row counts, per-row errors, status).

### 3.3 Weekly check-ins (student self-report)
- A student can submit **one check-in per subject per academic week**, capturing: attendance, task completion, study hours, self-reported emotional state, and self-rated comprehension (plus free-text responses to per-topic questions).
- Check-ins are the raw signal analytics-service aggregates into `student_subject_metrics` (weekly snapshot: average grade, compliance index, attendance rate, study hours, comprehension average, trend slope, and the classified risk level for that week).

### 3.4 Risk classification (deterministic, analytics-service only)
- Risk level is one of `LOW / MEDIUM / HIGH / CRITICAL` (**4 values** — this is the real domain value set used by `ClassifyRiskUseCase`, `AlertEntity`, and the seed data's scoring algorithm). Configurable via `RISK_HIGH_THRESHOLD`/`RISK_CRITICAL_THRESHOLD` env vars.
- Risk is computed **exclusively** by analytics-service, from grade average + compliance + attendance + trend. No other service (including prediction-service) is allowed to compute or override a risk level — they only consume analytics-service's `risk-snapshot`.
- **Known codebase inconsistency**: `packages/shared-types`' `RiskLevel` enum only declares 3 values (no `CRITICAL`) — the shared package is out of sync with the real domain. Treat analytics-service's own 4-value definition as authoritative.

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

## 5. Known domain/documentation inconsistencies (flagged during this audit, not silently resolved)

These are real discrepancies found between different parts of the codebase/docs — documented here rather than papered over, so a reader isn't misled by picking the wrong source:

| Topic | Discrepancy |
|---|---|
| `EnrollmentStatus` | TS enum: `ACTIVE/WITHDRAWN/COMPLETED` (3). Seed data writes a 4th, `SUSPENDED`, into the same untyped varchar column. |
| `RiskLevel` | Real analytics-service domain + seed data: 4 values (`LOW/MEDIUM/HIGH/CRITICAL`). `packages/shared-types`: 3 values (no `CRITICAL`). `contracts/openapi-contracts.yaml` schema: also 3 values. |
| Grade scale | Real: 0–20 (`NUMERIC(4,2)`, confirmed in seed data and entity definitions). Some older docs/contracts describe 0–10. |
| RF-007 / RF-008 | `academic-service`'s controller comments tag "enroll student" as RF-007 and "create evaluation"/"register grade" as RF-008; `contracts/openapi-contracts.yaml` assigns those same features to RF-010 and RF-012 respectively. Unreconciled labeling mismatch between code comments and the design contract. |

See [../database/database-architecture.md](../database/database-architecture.md) for the underlying data-model detail behind these, and [functional-requirements.md](./functional-requirements.md) for the RF-007/008 discrepancy in context.
