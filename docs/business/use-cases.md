# Use Cases

> Functional/narrative use cases by role and by cross-cutting flow. For the technical inventory of backend use-case classes (application layer), see each service's doc under [../backend/](../backend/), or the fully formalized IEEE-style specification of all 123 of them in [use-cases-technical-index.md](./use-cases-technical-index.md). For requirement IDs, see [functional-requirements.md](./functional-requirements.md).

## Actors

- **STUDENT** — enrolled student, primary consumer of risk/prediction feedback.
- **TEACHER** — owns subjects, records grades, writes observations.
- **ADMIN** — manages the institution's catalog (faculties/careers/periods/subjects) and users.
- **System (internal)** — automated recalculation triggers, not a human actor, included where relevant since they drive real business outcomes.

---

## UC-1: Student registration and first login

**Actor**: STUDENT (unauthenticated)
**Flow**:
1. Student submits registration form (email, password, name) → `POST /auth/register`.
2. auth-service creates the credential row, defaults role to `STUDENT`, and internally provisions a matching `user_profiles` row in user-service.
3. Student logs in (`POST /auth/login`) or via Microsoft OAuth (`GET /auth/microsoft` → redirect → `GET /auth/microsoft/callback`), receiving a JWT access token + refresh token.
4. Frontend hydrates the session (`hydrateSession`), decodes the JWT for a fallback identity, then fetches the full profile (`GET /users/me`).
**Alternate flow**: Login with a disabled account → backend returns `ACCOUNT_DISABLED` error code → frontend shows a dedicated `DisabledAccountDialog` instead of a generic error.

## UC-2: Admin builds the academic catalog

**Actor**: ADMIN
**Flow**: Create a faculty → create one or more careers under it → create an academic period (only one should be `ACTIVE` at a time) → create subjects under a career+period, optionally assigning a teacher and uploading a cover image → assign/re-assign a teacher to a subject independently of subject creation.
**Related**: RF-006 through RF-009, RF-011.

## UC-3: Admin or teacher enrolls students

**Actor**: ADMIN or TEACHER (TEACHER restricted to their own subjects)
**Flow**: Select a subject → enroll one student, or batch-enroll a list of students → each enrollment starts `ACTIVE`. Enrollment status can later be updated (e.g. to `WITHDRAWN`) by ADMIN/TEACHER.
**Related**: RF-010.

## UC-4: Teacher manages a subject's syllabus and evaluations

**Actor**: TEACHER (owner of the subject)
**Flow**: Create syllabus topics (with optional file upload) → create evaluations with weights that should sum sensibly toward 100% → record grades per student per evaluation, or bulk-import a spreadsheet of grades (tracked as a `grade_import` job with per-row error reporting) → every grade change is captured in `grade_history` for audit.
**Related**: RF-009 (topics live under subjects), RF-012, RF-013.

## UC-5: Student submits a weekly check-in

**Actor**: STUDENT
**Flow**: For each active enrollment, once per academic week, submit a self-report: attendance, task completion, study hours, emotional state, self-rated comprehension, and free-text answers to per-topic questions. A student can update (but not duplicate) the current week's check-in.
**Downstream effect**: triggers the recalculation pipeline (see UC-7).
**Related**: weekly check-in use cases in academic-service (`upsert-check-in`, `update-check-in`).

## UC-6: Teacher writes a qualitative observation

**Actor**: TEACHER
**Flow**: Teacher adds a free-text observation about a specific student (e.g. "shows improved participation this week"), tagged with a type. Observations are stored in MongoDB (`teacher_observations`) and can be listed per student — visible to the teacher and, transitively, usable as context by the AI prediction (informally referenced, not a strict dependency).
**Related**: RF-022.

## UC-7: Automatic risk recalculation after a grade or check-in change (system-driven)

**Actor**: System (triggered by UC-4 or UC-5)
**Flow**:
1. academic-service detects a grade or check-in change and calls analytics-service internally (`POST /internal/recalculate`).
2. analytics-service recomputes the week's `student_subject_metrics` (average, compliance index, attendance rate, trend slope via the WASM regression module) and classifies risk (`LOW/MEDIUM/HIGH/CRITICAL`).
3. If risk crossed into `MEDIUM+`, an `Alert` is generated.
4. analytics-service calls prediction-service internally to refresh the per-subject deterministic prediction and fire-and-forget an AI recommendation refresh.
5. A notification is created (Postgres) and pushed in real time (Socket.IO room `user:{userId}` for web/desktop, Expo push for mobile) to the affected student and/or their teacher.
**Related**: RF-015 through RF-018, RF-021; the full pipeline is described in [business-logic.md §4.1](./business-logic.md#41-grade-recorded--risk-recalculated--alertnotification-pipeline).

## UC-8: Student requests an AI-generated prediction on demand

**Actor**: STUDENT
**Flow**: Student clicks "generate prediction" for a subject (or for the whole period). Backend checks a 1-hour cooldown (per student, and separately per student+subject); if allowed, fetches the current deterministic risk snapshot from analytics-service + academic context from academic-service, sends both to OpenAI, persists the result (Postgres for the rule-based prediction, MongoDB `prediction_logs` for the full audit record), and returns a natural-language summary + recommendation list.
**Alternate flow**: Cooldown not yet elapsed → request rejected, frontend shows time remaining.
**Related**: RF-019, RF-020.

## UC-9: Teacher reviews at-risk students in their subject

**Actor**: TEACHER
**Flow**: Open a subject's performance view → see aggregated subject metrics (average, risk-level distribution across enrolled students) → drill into per-student risk/alerts → resolve an alert with a note once addressed.
**Related**: RF-015, RF-021, RF-024.

## UC-10: Admin reviews institution-wide indicators

**Actor**: ADMIN
**Flow**: Open the admin dashboard → see aggregated counts across all subjects/students (active users, at-risk counts, recent alerts) → navigate into user management (create/edit/deactivate users, filter by role) or course management (create/edit/deactivate subjects, assign teachers).
**Related**: RF-025, plus the full CRUD flows in UC-2/UC-3.

## UC-11: Admin deactivates a user, respecting academic dependencies

**Actor**: ADMIN
**Flow**: Attempt to deactivate a TEACHER or STUDENT → backend checks `CheckUserDeactivationEligibilityUseCase` (academic-service) for active dependencies (owned subjects for a teacher, active enrollments for a student) → if blocked, frontend shows `AdminUserRestrictionDialog` explaining why, instead of a generic error → if eligible, deactivation proceeds and a notification is sent to the affected user.
**Related**: business-logic.md §3.8.

## UC-12: Student browses notifications

**Actor**: STUDENT / TEACHER / ADMIN (any authenticated role)
**Flow**: Bell icon shows an unread count (eager-fetched). Opening the dropdown lazily fetches the read history on first open (not eagerly, to reduce request volume). Marking one or all as read updates both the badge and the persisted status.
**Related**: notification pipeline in UC-7 step 5.

## UC-13: Any user downloads the desktop or mobile app

**Actor**: Unauthenticated visitor (landing page) or any authenticated web user
**Flow**: Landing/web downloads section fetches a live manifest (`/downloads/desktop.json`, `/downloads/mobile.json`) published by CI/CD on every QA/prod deploy, showing current version and a direct download link — not a static "coming soon" placeholder. See [../deployment/ci-cd-pipeline.md](../deployment/ci-cd-pipeline.md) for how these are published.
