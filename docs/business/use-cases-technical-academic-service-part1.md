# Use Case Specification — academic-service (Part 1 of 2)

Formal, IEEE-style use case document for the application-layer use cases implemented in
`academic-service`. This is the largest and most fully-implemented service in the
monorepo: it owns the entire academic domain — faculties, careers, academic periods,
subjects, enrollments, evaluations, grades and their import/audit trail, teacher
assignments and observations, topics/materials, and student weekly check-ins.

Source documentation states **69** use cases total for this service; **68** are
individually named in the technical inventory and are specified below, split across two
files for readability. Part 1 covers Enrollments, Check-ins, Evaluations, Grades, and
Teachers/Ownership (29 use cases: UC-ACAD-01 through UC-ACAD-29). Part 2
([use-cases-technical-academic-service-part2.md](./use-cases-technical-academic-service-part2.md))
covers Faculties, Academic Periods, Careers,
Subjects, Topics, Observations, User Lifecycle, and Misc (39 use cases: UC-ACAD-30 through
UC-ACAD-68).

**Actors**
- **Student** — enrolls (via Admin/Teacher), submits weekly check-ins, views grades.
- **Teacher** — owns subjects, records grades, manages evaluations/topics, writes
  observations, enrolls students into their own subjects.
- **Admin** — manages the full academic catalog and can perform any Teacher-scoped action
  across all subjects.
- **System (internal)** — cross-service calls, e.g., analytics-service or user-service
  checking academic dependencies.

--------------------------------------------------------------------
## Enrollments (5)
--------------------------------------------------------------------

## UC-ACAD-01: Enroll a Single Student

**Actor(s):** Admin, Teacher (own subjects only)

**Trigger:** The actor selects a subject and a student to enroll (UC-3).

**Preconditions:** The subject exists and has not exceeded `maxCapacity`. The student does
not already hold an `ACTIVE` enrollment in the subject. A TEACHER caller owns the subject.

**Main Flow:**
1. The actor submits a student ID and a subject ID via the enrollment endpoint.
2. `RolesGuard`/ownership checks authorize the request (TEACHER restricted to subjects they
   own, verified via UC-ACAD-27).
3. The system verifies the subject has remaining capacity and the student is not already
   actively enrolled.
4. The system creates a new `EnrollmentEntity` with `status = ACTIVE` and
   `enrolledAt = now()`.
5. The system returns the created enrollment.

**Alternate Flows / Exceptions:**
- **A1 — Subject at capacity:** the request is rejected.
- **A2 — Student already actively enrolled:** the request is rejected (no duplicate
  enrollment).
- **A3 — Teacher does not own the subject:** the request is rejected.

**Postconditions:** A new `EnrollmentEntity` exists with `status = ACTIVE`, making the
student eligible for check-ins (UC-ACAD-08), grades (UC-ACAD-18), and risk analytics.

--------------------------------------------------------------------

## UC-ACAD-02: Batch-Enroll Students

**Actor(s):** Admin, Teacher (own subjects only)

**Trigger:** The actor uploads or selects a list of students to enroll into a subject at
once (UC-3), e.g., an entire class roster.

**Preconditions:** Same as UC-ACAD-01, evaluated per student in the list.

**Main Flow:**
1. The actor submits a subject ID and a list of student IDs.
2. `RolesGuard`/ownership checks authorize the request.
3. For each student ID, the system applies the same validation as UC-ACAD-01 (capacity,
   duplicate-enrollment check).
4. The system creates `EnrollmentEntity` rows for all students that pass validation and
   collects per-student errors for any that fail (e.g., already enrolled).
5. The system returns a summary: students successfully enrolled and students skipped with
   reasons.

**Alternate Flows / Exceptions:**
- **A1 — Subject capacity reached partway through the batch:** remaining students in the
  batch are skipped and reported as failed, without rolling back the ones already enrolled.
- **A2 — Entire list invalid (e.g., subject not found):** the whole batch fails before any
  enrollment is created.

**Postconditions:** Zero or more new `EnrollmentEntity` rows exist; the caller receives a
per-student success/failure breakdown.

--------------------------------------------------------------------

## UC-ACAD-03: Retrieve a Student's Enrollments

**Actor(s):** Student (own), Admin, Teacher (own subjects, implicitly)

**Trigger:** The student's subjects list (UC-ANLY-14) or a profile view needs the list of
subjects a student is enrolled in.

**Preconditions:** None beyond authentication/authorization.

**Main Flow:**
1. The caller requests enrollments for a given student ID (or `me`).
2. Ownership/role checks authorize the request.
3. The system queries PostgreSQL for `EnrollmentEntity` rows for that student, optionally
   filtered by status or period.
4. The system returns the list, each entry joined with its subject summary.

**Alternate Flows / Exceptions:**
- **A1 — Student has no enrollments:** an empty list is returned.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-ACAD-04: Retrieve a Subject's Enrollments

**Actor(s):** Teacher (own subject), Admin

**Trigger:** The teacher opens the roster/gradebook for one of their subjects.

**Preconditions:** The caller is authorized for the target subject.

**Main Flow:**
1. The caller requests enrollments for a given subject ID.
2. `RolesGuard`/ownership checks authorize the request.
3. The system queries PostgreSQL for all `EnrollmentEntity` rows for that subject,
   optionally filtered by status.
4. The system returns the list, each entry joined with the enrolled student's basic
   identity (via user-service, if needed for display).

**Alternate Flows / Exceptions:**
- **A1 — Subject has no enrollments yet:** an empty list is returned.
- **A2 — Teacher does not own the subject:** the request is rejected.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-ACAD-05: Update Enrollment Status

**Actor(s):** Admin, Teacher (own subject)

**Trigger:** A student withdraws from a subject, or their enrollment must otherwise change
state (e.g., `ACTIVE` → `WITHDRAWN`).

**Preconditions:** The target `EnrollmentEntity` exists. The caller is authorized for the
underlying subject.

**Main Flow:**
1. The actor submits a new status for a specific enrollment (e.g., `WITHDRAWN`,
   `COMPLETED`).
2. `RolesGuard`/ownership checks authorize the request.
3. The system updates the `EnrollmentEntity.status` field.
4. The system returns the updated enrollment.

**Alternate Flows / Exceptions:**
- **A1 — Enrollment not found:** a not-found error is returned.
- **A2 — Invalid status transition (implementation-defined state machine):** the request is
  rejected.

**Postconditions:** The enrollment reflects its new status; a student whose enrollment is
no longer `ACTIVE` stops being eligible for new check-ins (UC-ACAD-09) and is excluded from
active-enrollment counts used by UC-ACAD-67 (deactivation eligibility).

--------------------------------------------------------------------
## Check-ins (6)
--------------------------------------------------------------------

## UC-ACAD-06: Retrieve Current Week's Check-in

**Actor(s):** Student (own)

**Trigger:** The student opens the check-in form for a subject and the frontend needs to
know whether this week's check-in has already been started/submitted (UC-5).

**Preconditions:** The student holds an `ACTIVE` enrollment in the subject.

**Main Flow:**
1. The student requests the current week's check-in for a subject.
2. The system computes the current academic week and queries for a matching
   `WeeklyCheckInEntity`.
3. The system returns the existing check-in if found, or an empty/"not started" response if
   not.

**Alternate Flows / Exceptions:**
- **A1 — No enrollment for the subject:** the request is rejected.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-ACAD-07: Retrieve Latest Check-in

**Actor(s):** Student (own), Teacher/Admin (viewing a student's most recent self-report)

**Trigger:** A view needs the most recently submitted check-in regardless of week (e.g., a
teacher reviewing a student's latest self-reported state).

**Preconditions:** At least one `WeeklyCheckInEntity` exists for the student+subject.

**Main Flow:**
1. The caller requests the latest check-in for a student+subject.
2. Ownership/role checks authorize the request.
3. The system queries PostgreSQL for the most recent `WeeklyCheckInEntity` by week.
4. The system returns that check-in.

**Alternate Flows / Exceptions:**
- **A1 — No check-in ever submitted:** a "no data" response is returned.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-ACAD-08: Upsert (Create or Update) Weekly Check-in

**Actor(s):** Student (own)

**Trigger:** The student fills out and submits their weekly self-report (UC-5): attendance,
task completion, study hours, emotional state, self-rated comprehension, and free-text
answers to per-topic questions.

**Preconditions:** The student holds an `ACTIVE` enrollment in the subject. At most one
check-in exists for the current academic week (upsert semantics — a student can update but
not duplicate the current week's check-in).

**Main Flow:**
1. The student submits the check-in fields for the current week.
2. The system computes the current academic week/year and checks for an existing
   `WeeklyCheckInEntity` for this student+subject+week.
3. If none exists, the system creates a new `WeeklyCheckInEntity`; if one exists, the
   system updates it in place (same identity, no duplicate row).
4. The system persists the record and returns it.
5. **Downstream effect:** the system triggers the risk recalculation pipeline by calling
   analytics-service internally (`POST /internal/recalculate` — see UC-ANLY-05 / UC-7).

**Alternate Flows / Exceptions:**
- **A1 — Student not actively enrolled:** the request is rejected.
- **A2 — analytics-service recalculation call fails:** the check-in itself is still
  persisted; the recalculation is best-effort/retryable and does not roll back the
  check-in.

**Postconditions:** A `WeeklyCheckInEntity` exists for the current week reflecting the
submitted data; a downstream metrics recalculation has been triggered.

--------------------------------------------------------------------

## UC-ACAD-09: Update Weekly Check-in

**Actor(s):** Student (own)

**Trigger:** The student revises an already-submitted check-in for the current week before
it locks (implementation detail: whether check-ins remain editable indefinitely within the
week or only until some cutoff is a business rule enforced here).

**Preconditions:** A `WeeklyCheckInEntity` for the current week already exists for this
student+subject.

**Main Flow:**
1. The student submits revised check-in fields.
2. The system locates the existing `WeeklyCheckInEntity` for the current week.
3. The system applies the changes and persists them.
4. As in UC-ACAD-08, the system triggers the analytics-service recalculation pipeline.

**Alternate Flows / Exceptions:**
- **A1 — No existing check-in for the current week:** the request is rejected; the client
  should call UC-ACAD-08 instead.

**Postconditions:** The current week's `WeeklyCheckInEntity` reflects the latest submitted
values; a downstream metrics recalculation has been triggered.

--------------------------------------------------------------------

## UC-ACAD-10: List Check-ins

**Actor(s):** Student (own), Teacher (own subjects), Admin

**Trigger:** A history view needs all of a student's check-ins for a subject across the
period.

**Preconditions:** None beyond authentication/authorization for the target student.

**Main Flow:**
1. The caller requests the check-in history for a student+subject.
2. Ownership/role checks authorize the request.
3. The system queries PostgreSQL for all `WeeklyCheckInEntity` rows for that
   student+subject, ordered by week.
4. The system returns the ordered list.

**Alternate Flows / Exceptions:**
- **A1 — No check-ins submitted yet:** an empty list is returned.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-ACAD-11: Retrieve Check-ins Summary

**Actor(s):** Teacher (own subjects), Admin

**Trigger:** The teacher's subject view needs an aggregate view of check-in compliance
across all enrolled students (e.g., how many submitted this week).

**Preconditions:** The caller is authorized for the target subject.

**Main Flow:**
1. The caller requests the check-ins summary for a subject and week (defaulting to the
   current week).
2. `RolesGuard`/ownership checks authorize the request.
3. The system aggregates `WeeklyCheckInEntity` submission counts and average field values
   (attendance, task completion, study hours, comprehension) across enrolled students for
   that week.
4. The system returns the summary.

**Alternate Flows / Exceptions:**
- **A1 — No check-ins submitted for the requested week:** a zeroed summary is returned.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------
## Evaluations (6)
--------------------------------------------------------------------

## UC-ACAD-12: Create Evaluation

**Actor(s):** Teacher (own subject), Admin

**Trigger:** The teacher defines a new gradable evaluation for a subject (UC-4), e.g., a
midterm exam worth 30%.

**Preconditions:** The caller owns (or administers) the target subject. The evaluation's
weight, combined with existing active evaluations, should sum sensibly toward 100% (a soft
business constraint checked/reported, per RF-012/RF-013).

**Main Flow:**
1. The actor submits an evaluation name, weight (0–100), due date, and subject ID.
2. `RolesGuard`/ownership checks authorize the request.
3. The system creates a new `EvaluationEntity` with `isActive = true`.
4. The system returns the created evaluation, potentially flagging if the subject's total
   active weight now exceeds or falls short of 100%.

**Alternate Flows / Exceptions:**
- **A1 — Teacher does not own the subject:** the request is rejected.
- **A2 — Weight out of the 0–100 range:** rejected at validation.

**Postconditions:** A new `EvaluationEntity` exists, available for grade recording
(UC-ACAD-18).

--------------------------------------------------------------------

## UC-ACAD-13: Update Evaluation

**Actor(s):** Teacher (own subject), Admin

**Trigger:** The teacher edits an evaluation's name, weight, or due date.

**Preconditions:** The target `EvaluationEntity` exists and belongs to a subject the caller
is authorized for.

**Main Flow:**
1. The actor submits updated fields for a specific evaluation.
2. `RolesGuard`/ownership checks authorize the request.
3. The system applies the changes and persists them.
4. The system returns the updated evaluation.

**Alternate Flows / Exceptions:**
- **A1 — Evaluation not found:** a not-found error is returned.
- **A2 — Teacher does not own the underlying subject:** the request is rejected.

**Postconditions:** The `EvaluationEntity` reflects the new values; any grades already
recorded against it (UC-ACAD-18) are unaffected by a weight change unless a recalculation
is explicitly triggered.

--------------------------------------------------------------------

## UC-ACAD-14: Archive Evaluation

**Actor(s):** Teacher (own subject), Admin

**Trigger:** The teacher retires an evaluation that should no longer count (soft-delete via
`isActive = false`, rather than a hard delete, preserving historical grade records).

**Preconditions:** The target `EvaluationEntity` exists and is currently active.

**Main Flow:**
1. The actor requests archival of a specific evaluation.
2. `RolesGuard`/ownership checks authorize the request.
3. The system sets `isActive = false` on the `EvaluationEntity`.
4. The system returns the updated (archived) evaluation.

**Alternate Flows / Exceptions:**
- **A1 — Evaluation already archived:** treated as an idempotent no-op.

**Postconditions:** The evaluation no longer counts toward `get-subject-evaluation-weights`
(UC-ACAD-16) totals, but its historical grades (UC-ACAD-21) remain intact.

--------------------------------------------------------------------

## UC-ACAD-15: List Evaluations

**Actor(s):** Teacher (own subject), Admin, Student (read-only, own subject)

**Trigger:** The gradebook or student subject view needs the list of evaluations defined
for a subject.

**Preconditions:** None beyond authorization for the target subject.

**Main Flow:**
1. The caller requests the list of evaluations for a subject, optionally including
   archived ones.
2. Ownership/role checks authorize the request.
3. The system queries PostgreSQL for matching `EvaluationEntity` rows.
4. The system returns the list.

**Alternate Flows / Exceptions:**
- **A1 — No evaluations defined yet:** an empty list is returned.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-ACAD-16: Retrieve Subject Evaluation Weights

**Actor(s):** Teacher (own subject), Admin

**Trigger:** The teacher checks whether the active evaluations for a subject sum correctly
toward 100% before finalizing the grading scheme.

**Preconditions:** The caller is authorized for the target subject.

**Main Flow:**
1. The caller requests the evaluation weights breakdown for a subject.
2. `RolesGuard`/ownership checks authorize the request.
3. The system sums the `weight` field across all active `EvaluationEntity` rows for the
   subject.
4. The system returns the per-evaluation weights and the running total.

**Alternate Flows / Exceptions:**
- **A1 — Total does not equal 100%:** the system still returns the data; enforcement is a
  UI-level warning rather than a hard backend constraint (per RF-012/RF-013 wording,
  "should sum sensibly").

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-ACAD-17: Retrieve Weight Summary

**Actor(s):** Teacher (own subject), Admin

**Trigger:** A more condensed variant of UC-ACAD-16, e.g., for a compact gradebook header
that shows only the aggregate percentage without a per-evaluation breakdown.

**Preconditions:** The caller is authorized for the target subject.

**Main Flow:**
1. The caller requests the weight summary for a subject.
2. `RolesGuard`/ownership checks authorize the request.
3. The system computes the aggregate active weight percentage.
4. The system returns the single summary figure (and a boolean/flag for whether it equals
   100%).

**Alternate Flows / Exceptions:**
- **A1 — No active evaluations:** the summary reports 0%.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------
## Grades (8)
--------------------------------------------------------------------

## UC-ACAD-18: Record Grade

**Actor(s):** Teacher (own subject), Admin

**Trigger:** The teacher enters a single student's grade for a specific evaluation (UC-4).

**Preconditions:** The student holds an `ACTIVE` enrollment in the subject. The target
`EvaluationEntity` exists and is active. The caller is authorized for the subject.

**Main Flow:**
1. The teacher submits a grade value (0–20 scale) for a student+evaluation pair.
2. `RolesGuard`/ownership checks authorize the request.
3. The system creates a new `GradeEntity` linking student, subject, evaluation, and value.
4. The system writes a corresponding `GradeHistoryEntity` row capturing the change
   (`previousValue = null`, `newValue`, `changedBy = <teacher id>`).
5. **Downstream effect:** the system triggers the analytics-service recalculation pipeline
   (UC-ANLY-05 / UC-7), identical in spirit to UC-ACAD-08's downstream effect.
6. The system returns the recorded grade.

**Alternate Flows / Exceptions:**
- **A1 — Grade value outside the 0–20 scale:** rejected at validation.
- **A2 — Student not enrolled or evaluation inactive:** the request is rejected.
- **A3 — A grade already exists for this student+evaluation:** the request is rejected;
  the caller should use UC-ACAD-20 (Update Grade) instead.

**Postconditions:** A new `GradeEntity` and a matching `GradeHistoryEntity` audit row
exist; a downstream metrics recalculation has been triggered.

--------------------------------------------------------------------

## UC-ACAD-19: Register Grade

**Actor(s):** Teacher (own subject), Admin

**Trigger:** A second, related entry point for recording a grade — per the source
inventory this is distinct from UC-ACAD-18 (`record-grade`), most plausibly covering a
different call site (e.g., a simplified/legacy input path or a role-specific variant) that
converges on the same underlying persistence as UC-ACAD-18.

**Preconditions:** Same as UC-ACAD-18.

**Main Flow:**
1. The actor submits a grade value for a student+evaluation pair through this alternate
   entry point.
2. The same authorization, validation, persistence (`GradeEntity` +
   `GradeHistoryEntity`), and downstream recalculation steps as UC-ACAD-18 apply.
3. The system returns the recorded grade.

**Alternate Flows / Exceptions:** Same as UC-ACAD-18.

**Postconditions:** Same as UC-ACAD-18.

--------------------------------------------------------------------

## UC-ACAD-20: Update Grade

**Actor(s):** Teacher (own subject), Admin

**Trigger:** The teacher corrects a previously recorded grade.

**Preconditions:** A `GradeEntity` already exists for the student+evaluation. The caller is
authorized for the subject.

**Main Flow:**
1. The teacher submits a new value for an existing grade.
2. `RolesGuard`/ownership checks authorize the request.
3. The system updates the `GradeEntity.value` field.
4. The system writes a new `GradeHistoryEntity` row (`previousValue = <old>`,
   `newValue = <new>`, `changedBy = <teacher id>`), preserving full audit history rather
   than overwriting it.
5. The system triggers the analytics-service recalculation pipeline, as in UC-ACAD-18.
6. The system returns the updated grade.

**Alternate Flows / Exceptions:**
- **A1 — Grade does not exist yet:** the request is rejected; the caller should use
  UC-ACAD-18/19 instead.
- **A2 — New value outside the 0–20 scale:** rejected at validation.

**Postconditions:** The `GradeEntity` reflects the new value; `grade_history` contains a
complete, append-only audit trail of every change; a downstream recalculation has been
triggered.

--------------------------------------------------------------------

## UC-ACAD-21: Retrieve Student Grades

**Actor(s):** Student (own), Teacher (own subject), Admin

**Trigger:** The student views their grades for a subject, or a teacher/admin reviews a
specific student's grade history.

**Preconditions:** None beyond authentication/authorization for the target student and
subject.

**Main Flow:**
1. The caller requests grades for a student+subject.
2. Ownership/role checks authorize the request.
3. The system queries PostgreSQL for all `GradeEntity` rows for that student+subject,
   joined with their evaluations.
4. The system returns the list, optionally alongside the weighted running average.

**Alternate Flows / Exceptions:**
- **A1 — No grades recorded yet:** an empty list is returned.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-ACAD-22: Import Grades

**Actor(s):** Teacher (own subject), Admin

**Trigger:** The teacher uploads a spreadsheet to bulk-load grades for many students at
once (UC-4), instead of entering them one by one.

**Preconditions:** The uploaded file is a well-formed spreadsheet (`xlsx`) with the
expected columns. The caller is authorized for the target subject.

**Main Flow:**
1. The teacher uploads a spreadsheet file for a subject+evaluation.
2. `RolesGuard`/ownership checks authorize the request.
3. The system creates a `GradeImportEntity` job record (`status = PROCESSING`, file
   reference, initial row counts).
4. The system parses the spreadsheet (via `xlsx`), validating each row (student
   identifier resolvable, grade value in range).
5. For each valid row, the system records or updates the corresponding `GradeEntity` (per
   UC-ACAD-18/UC-ACAD-20 semantics) and its `GradeHistoryEntity` audit row.
6. Rows that fail validation are collected into the `GradeImportEntity.errors[]` array
   instead of aborting the whole import.
7. The system finalizes the `GradeImportEntity` with `status = COMPLETED` (or
   `COMPLETED_WITH_ERRORS`) and row counts (total/succeeded/failed).
8. The system triggers the analytics-service recalculation pipeline for each affected
   student+subject.

**Alternate Flows / Exceptions:**
- **A1 — File is not a valid spreadsheet or is unreadable:** the job fails immediately with
  `status = FAILED` and no grades are written.
- **A2 — Some rows fail validation:** those rows are skipped and reported in `errors[]`;
  valid rows are still committed (partial success, not all-or-nothing).

**Postconditions:** A `GradeImportEntity` job record exists describing the outcome; zero or
more `GradeEntity`/`GradeHistoryEntity` rows have been created/updated; downstream
recalculations have been triggered for affected students.

--------------------------------------------------------------------

## UC-ACAD-23: Import Subject Grades

**Actor(s):** Teacher (own subject), Admin

**Trigger:** A subject-wide variant of UC-ACAD-22, importing grades across multiple
evaluations for a subject in a single spreadsheet, rather than one evaluation at a time.

**Preconditions:** Same as UC-ACAD-22, with the spreadsheet expected to identify the
evaluation per row/column rather than it being fixed for the whole file.

**Main Flow:**
1. The teacher uploads a subject-wide grade spreadsheet.
2. The system creates a `GradeImportEntity` job and parses the file, resolving both the
   student and the evaluation per row.
3. The same per-row validation, partial-success persistence, audit-trail writing, and
   downstream recalculation steps as UC-ACAD-22 apply, now spanning multiple evaluations.
4. The system finalizes the `GradeImportEntity` and returns its summary.

**Alternate Flows / Exceptions:** Same categories as UC-ACAD-22, plus:
- **A3 — A row references an evaluation that does not belong to the subject:** that row is
  rejected and reported in `errors[]`.

**Postconditions:** Same as UC-ACAD-22, potentially spanning several evaluations in one
job.

--------------------------------------------------------------------

## UC-ACAD-24: Retrieve Grade Import Job

**Actor(s):** Teacher (own subject), Admin

**Trigger:** The teacher checks the status/result of a previously submitted bulk import
(UC-ACAD-22/23), including its per-row error report.

**Preconditions:** The target `GradeImportEntity` exists.

**Main Flow:**
1. The caller requests a specific grade import job by ID.
2. Ownership/role checks authorize the request.
3. The system fetches the `GradeImportEntity`, including its `errors[]` array and row
   counts.
4. The system returns the job details.

**Alternate Flows / Exceptions:**
- **A1 — Job not found:** a not-found error is returned.
- **A2 — Job still processing:** the current in-progress status and partial counts are
  returned rather than an error.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-ACAD-25: List Grade Import Jobs

**Actor(s):** Teacher (own subject), Admin

**Trigger:** The teacher reviews the history of bulk imports performed for a subject.

**Preconditions:** The caller is authorized for the target subject.

**Main Flow:**
1. The caller requests the list of grade import jobs for a subject.
2. `RolesGuard`/ownership checks authorize the request.
3. The system queries PostgreSQL for matching `GradeImportEntity` rows, ordered most
   recent first.
4. The system returns the list, each with a summary (status, row counts, timestamp).

**Alternate Flows / Exceptions:**
- **A1 — No imports performed yet:** an empty list is returned.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------
## Teachers / Ownership (4)
--------------------------------------------------------------------

## UC-ACAD-26: Assign Teacher to Subject

**Actor(s):** Admin

**Trigger:** The admin assigns or re-assigns a teacher to a subject (UC-2), independently
of the subject's initial creation.

**Preconditions:** The target subject and the target teacher (a user with role TEACHER)
both exist.

**Main Flow:**
1. The admin submits a subject ID and a teacher (user) ID.
2. `RolesGuard` verifies the ADMIN role.
3. The system creates or updates a `SubjectTeacherEntity` (subject-teacher-period composite
   key) and/or sets `SubjectEntity.teacherId`.
4. The system returns the updated assignment.

**Alternate Flows / Exceptions:**
- **A1 — Target user does not hold the TEACHER role:** the request is rejected.
- **A2 — Subject already has a different teacher assigned:** the assignment is replaced
  (re-assignment), not duplicated.

**Postconditions:** The subject's owning teacher reflects the new assignment; the new
teacher gains access to the subject via UC-ACAD-27's ownership check.

--------------------------------------------------------------------

## UC-ACAD-27: Check Subject Ownership

**Actor(s):** System (internal — invoked as an authorization step inside nearly every
teacher-scoped use case above: UC-ACAD-01, 04, 05, 12–17, 18–25)

**Trigger:** A TEACHER-scoped request needs to verify that the calling teacher actually
owns the target subject before proceeding.

**Preconditions:** The caller presents a subject ID and their own (teacher) user ID.

**Main Flow:**
1. The invoking use case calls this check with the subject ID and teacher ID.
2. The system looks up the `SubjectTeacherEntity`/`SubjectEntity.teacherId` for the
   subject.
3. The system returns a boolean/authorization result indicating ownership.

**Alternate Flows / Exceptions:**
- **A1 — Subject not found:** ownership is reported as false (fails closed).

**Postconditions:** None (pure authorization check, no persistence).

--------------------------------------------------------------------

## UC-ACAD-28: Retrieve a Teacher's Students

**Actor(s):** Teacher (own)

**Trigger:** The teacher wants a consolidated roster of every student across all of their
subjects, rather than one subject at a time (contrast with UC-ACAD-04).

**Preconditions:** The teacher owns at least one subject.

**Main Flow:**
1. The teacher requests their consolidated student list.
2. The system identifies all subjects owned by the teacher (via `SubjectTeacherEntity`).
3. The system queries `EnrollmentEntity` rows across those subjects and de-duplicates
   students appearing in more than one.
4. The system returns the consolidated list of students, each with the subject(s) they
   share with this teacher.

**Alternate Flows / Exceptions:**
- **A1 — Teacher owns no subjects:** an empty list is returned.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-ACAD-29: Retrieve a Teacher's Subjects

**Actor(s):** Teacher (own)

**Trigger:** The teacher's dashboard/subject picker needs the list of subjects they own.

**Preconditions:** None beyond authentication as TEACHER.

**Main Flow:**
1. The teacher requests their owned subjects.
2. The system queries `SubjectTeacherEntity`/`SubjectEntity.teacherId` for rows matching
   the teacher's user ID.
3. The system returns the list of subjects.

**Alternate Flows / Exceptions:**
- **A1 — Teacher owns no subjects yet:** an empty list is returned.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

*(Continued in [use-cases-technical-academic-service-part2.md](./use-cases-technical-academic-service-part2.md):
Faculties, Academic Periods, Careers, Subjects, Topics, Observations, User Lifecycle, and
Misc — UC-ACAD-30 through UC-ACAD-68.)*
