# Use Case Specification — academic-service (Part 2 of 2)

Continuation of [use-cases-technical-academic-service-part1.md](./use-cases-technical-academic-service-part1.md).
Covers Faculties, Academic Periods, Careers, Subjects, Topics, Observations, User
Lifecycle, and Misc (UC-ACAD-30 through UC-ACAD-68).

--------------------------------------------------------------------
## Faculties (6)
--------------------------------------------------------------------

## UC-ACAD-30: Create Faculty

**Actor(s):** Admin

**Trigger:** The admin begins building the academic catalog from the top down (UC-2) by
registering a new faculty.

**Preconditions:** The actor holds the ADMIN role. No other active faculty shares the same
`code`.

**Main Flow:**
1. The admin submits a faculty name and code.
2. `RolesGuard` verifies the ADMIN role.
3. The system creates a new `FacultyEntity` with `status = ACTIVE`.
4. The system returns the created faculty.

**Alternate Flows / Exceptions:**
- **A1 — Duplicate code:** the request is rejected.

**Postconditions:** A new `FacultyEntity` exists, available as a parent for careers
(UC-ACAD-37).

--------------------------------------------------------------------

## UC-ACAD-31: Update Faculty

**Actor(s):** Admin

**Trigger:** The admin edits a faculty's name or code.

**Preconditions:** The target `FacultyEntity` exists.

**Main Flow:**
1. The admin submits updated fields for a specific faculty.
2. `RolesGuard` verifies the ADMIN role.
3. The system applies the changes and persists them.
4. The system returns the updated faculty.

**Alternate Flows / Exceptions:**
- **A1 — Faculty not found:** a not-found error is returned.
- **A2 — New code collides with another faculty:** rejected.

**Postconditions:** The `FacultyEntity` reflects the new values.

--------------------------------------------------------------------

## UC-ACAD-32: Delete Faculty

**Actor(s):** Admin

**Trigger:** The admin removes a faculty that was created in error or is no longer offered.

**Preconditions:** The target `FacultyEntity` exists and has no dependent careers (or the
deletion is only permitted when the faculty has zero careers, per referential-integrity
policy).

**Main Flow:**
1. The admin requests deletion of a specific faculty.
2. `RolesGuard` verifies the ADMIN role.
3. The system verifies no `CareerEntity` rows reference this faculty.
4. The system deletes the `FacultyEntity`.
5. The system returns a success confirmation.

**Alternate Flows / Exceptions:**
- **A1 — Faculty has dependent careers:** the deletion is rejected; the admin should use
  UC-ACAD-35 (change status) instead to deactivate rather than delete.
- **A2 — Faculty not found:** a not-found error is returned.

**Postconditions:** The `FacultyEntity` no longer exists (hard delete, only reachable when
no dependencies exist).

--------------------------------------------------------------------

## UC-ACAD-33: Retrieve Faculty

**Actor(s):** Admin, any authenticated user (read access for catalog browsing)

**Trigger:** A view needs a single faculty's details.

**Preconditions:** The target `FacultyEntity` exists.

**Main Flow:**
1. The caller requests a faculty by ID.
2. The system fetches the `FacultyEntity` from PostgreSQL.
3. The system returns the faculty details.

**Alternate Flows / Exceptions:**
- **A1 — Faculty not found:** a not-found error is returned.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-ACAD-34: List Faculties

**Actor(s):** Admin, any authenticated user (catalog browsing, e.g., during registration or
subject selection)

**Trigger:** A catalog picker or admin table needs the full list of faculties.

**Preconditions:** None beyond authentication.

**Main Flow:**
1. The caller requests the list of faculties, optionally filtered by status.
2. The system queries PostgreSQL for `FacultyEntity` rows.
3. The system returns the list.

**Alternate Flows / Exceptions:**
- **A1 — No faculties registered yet:** an empty list is returned.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-ACAD-35: Change Faculty Status

**Actor(s):** Admin

**Trigger:** The admin deactivates a faculty (e.g., discontinued) without deleting its
historical data, or reactivates one.

**Preconditions:** The target `FacultyEntity` exists.

**Main Flow:**
1. The admin submits a new status (`ACTIVE`/`INACTIVE`) for a faculty.
2. `RolesGuard` verifies the ADMIN role.
3. The system updates `FacultyEntity.status`.
4. The system returns the updated faculty.

**Alternate Flows / Exceptions:**
- **A1 — Faculty not found:** a not-found error is returned.

**Postconditions:** An inactive faculty is excluded from new-career creation pickers
(UC-ACAD-37) but its historical careers/subjects remain intact.

--------------------------------------------------------------------
## Academic Periods (7)
--------------------------------------------------------------------

## UC-ACAD-36: Create Academic Period

**Actor(s):** Admin

**Trigger:** The admin registers a new academic term (e.g., "2026-1") as part of building
the catalog (UC-2).

**Preconditions:** The actor holds the ADMIN role. The submitted date range is internally
consistent (start before end).

**Main Flow:**
1. The admin submits a period name, code, start/end dates, status, and type.
2. `RolesGuard` verifies the ADMIN role.
3. The system creates a new `AcademicPeriodEntity`.
4. If the submitted status is `ACTIVE`, the system enforces the single-active-period
   business rule (see UC-ACAD-42) before committing.
5. The system returns the created period.

**Alternate Flows / Exceptions:**
- **A1 — Another period is already `ACTIVE` and this one is also submitted as `ACTIVE`:**
  the request is rejected, or the prior period is auto-deactivated, depending on the
  enforced policy — in either case, at most one `ACTIVE` period exists at a time.
- **A2 — Invalid date range:** rejected at validation.

**Postconditions:** A new `AcademicPeriodEntity` exists, available as a parent for subjects
(UC-ACAD-49).

--------------------------------------------------------------------

## UC-ACAD-37: Update Academic Period

**Actor(s):** Admin

**Trigger:** The admin edits a period's name, dates, or type.

**Preconditions:** The target `AcademicPeriodEntity` exists.

**Main Flow:**
1. The admin submits updated fields for a specific period.
2. `RolesGuard` verifies the ADMIN role.
3. The system applies the changes and persists them.
4. The system returns the updated period.

**Alternate Flows / Exceptions:**
- **A1 — Period not found:** a not-found error is returned.
- **A2 — Edit would violate the single-active-period rule:** rejected.

**Postconditions:** The `AcademicPeriodEntity` reflects the new values.

--------------------------------------------------------------------

## UC-ACAD-38: Delete Academic Period

**Actor(s):** Admin

**Trigger:** The admin removes a period created in error.

**Preconditions:** The target `AcademicPeriodEntity` exists and has no dependent subjects.

**Main Flow:**
1. The admin requests deletion of a specific period.
2. `RolesGuard` verifies the ADMIN role.
3. The system verifies no `SubjectEntity` rows reference this period.
4. The system deletes the `AcademicPeriodEntity`.
5. The system returns a success confirmation.

**Alternate Flows / Exceptions:**
- **A1 — Period has dependent subjects:** the deletion is rejected; UC-ACAD-42 (change
  status) should be used instead.
- **A2 — Period not found:** a not-found error is returned.

**Postconditions:** The `AcademicPeriodEntity` no longer exists.

--------------------------------------------------------------------

## UC-ACAD-39: Retrieve Academic Period

**Actor(s):** Admin, any authenticated user

**Trigger:** A view needs a single period's details.

**Preconditions:** The target `AcademicPeriodEntity` exists.

**Main Flow:**
1. The caller requests a period by ID.
2. The system fetches the `AcademicPeriodEntity`.
3. The system returns the period details.

**Alternate Flows / Exceptions:**
- **A1 — Period not found:** a not-found error is returned.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-ACAD-40: Retrieve Active Academic Period

**Actor(s):** Admin, any authenticated user, System (internal — widely consumed as a
default scope for dashboards, enrollments, and metrics)

**Trigger:** Nearly every period-scoped view/use case (dashboards, enrollments, grade
entry, check-ins) needs to resolve "the current period" without the caller specifying an
ID explicitly.

**Preconditions:** Exactly zero or one `AcademicPeriodEntity` currently has
`status = ACTIVE`, by construction of UC-ACAD-36/37/42.

**Main Flow:**
1. The caller requests the currently active period.
2. The system queries PostgreSQL for the `AcademicPeriodEntity` with `status = ACTIVE`.
3. The system returns that period.

**Alternate Flows / Exceptions:**
- **A1 — No period is currently active:** the system returns a "no active period" response;
  callers that depend on it (e.g., new enrollments) are expected to handle this state
  explicitly rather than assume one always exists.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-ACAD-41: List Academic Periods

**Actor(s):** Admin, any authenticated user

**Trigger:** A catalog picker or admin table needs the full list of periods (e.g., to view
historical data from a past term).

**Preconditions:** None beyond authentication.

**Main Flow:**
1. The caller requests the list of periods, optionally filtered by status/type.
2. The system queries PostgreSQL for `AcademicPeriodEntity` rows, typically ordered by
   start date descending.
3. The system returns the list.

**Alternate Flows / Exceptions:**
- **A1 — No periods registered yet:** an empty list is returned.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-ACAD-42: Change Academic Period Status

**Actor(s):** Admin

**Trigger:** The admin activates a new term (making it the current one) or closes out an
old one.

**Preconditions:** The target `AcademicPeriodEntity` exists.

**Main Flow:**
1. The admin submits a new status for a period (e.g., activating it).
2. `RolesGuard` verifies the ADMIN role.
3. If the requested status is `ACTIVE`, the system first transitions any other currently
   `ACTIVE` period to a non-active status, enforcing that only one period is ever `ACTIVE`
   at a time.
4. The system updates the target period's status.
5. The system returns the updated period.

**Alternate Flows / Exceptions:**
- **A1 — Period not found:** a not-found error is returned.

**Postconditions:** At most one `AcademicPeriodEntity` has `status = ACTIVE`; UC-ACAD-40
now resolves to the newly activated period.

--------------------------------------------------------------------
## Careers (6)
--------------------------------------------------------------------

## UC-ACAD-43: Create Career

**Actor(s):** Admin

**Trigger:** The admin registers a new career/program under a faculty (UC-2), e.g.,
"Software Engineering" under the "Faculty of Engineering."

**Preconditions:** The parent `FacultyEntity` exists and is active. No other career under
the same faculty shares the same `code`.

**Main Flow:**
1. The admin submits a career name, code, parent faculty ID, and duration in semesters.
2. `RolesGuard` verifies the ADMIN role.
3. The system verifies the parent faculty exists.
4. The system creates a new `CareerEntity` with `status = ACTIVE`.
5. The system returns the created career.

**Alternate Flows / Exceptions:**
- **A1 — Parent faculty does not exist:** the request is rejected.
- **A2 — Duplicate code within the faculty:** the request is rejected.

**Postconditions:** A new `CareerEntity` exists, available as a parent for subjects
(UC-ACAD-49).

--------------------------------------------------------------------

## UC-ACAD-44: Update Career

**Actor(s):** Admin

**Trigger:** The admin edits a career's name, code, or duration.

**Preconditions:** The target `CareerEntity` exists.

**Main Flow:**
1. The admin submits updated fields for a specific career.
2. `RolesGuard` verifies the ADMIN role.
3. The system applies the changes and persists them.
4. The system returns the updated career.

**Alternate Flows / Exceptions:**
- **A1 — Career not found:** a not-found error is returned.

**Postconditions:** The `CareerEntity` reflects the new values.

--------------------------------------------------------------------

## UC-ACAD-45: Delete Career

**Actor(s):** Admin

**Trigger:** The admin removes a career created in error.

**Preconditions:** The target `CareerEntity` exists and has no dependent subjects.

**Main Flow:**
1. The admin requests deletion of a specific career.
2. `RolesGuard` verifies the ADMIN role.
3. The system verifies no `SubjectEntity` rows reference this career.
4. The system deletes the `CareerEntity`.
5. The system returns a success confirmation.

**Alternate Flows / Exceptions:**
- **A1 — Career has dependent subjects:** rejected; UC-ACAD-48 (change status) should be
  used instead.
- **A2 — Career not found:** a not-found error is returned.

**Postconditions:** The `CareerEntity` no longer exists.

--------------------------------------------------------------------

## UC-ACAD-46: Retrieve Career

**Actor(s):** Admin, any authenticated user

**Trigger:** A view needs a single career's details.

**Preconditions:** The target `CareerEntity` exists.

**Main Flow:**
1. The caller requests a career by ID.
2. The system fetches the `CareerEntity`.
3. The system returns the career details.

**Alternate Flows / Exceptions:**
- **A1 — Career not found:** a not-found error is returned.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-ACAD-47: List Careers

**Actor(s):** Admin, any authenticated user

**Trigger:** A catalog picker or admin table needs the list of careers, optionally scoped
to a faculty.

**Preconditions:** None beyond authentication.

**Main Flow:**
1. The caller requests the list of careers, optionally filtered by faculty ID or status.
2. The system queries PostgreSQL for matching `CareerEntity` rows.
3. The system returns the list.

**Alternate Flows / Exceptions:**
- **A1 — No careers registered yet (or none for the given faculty):** an empty list is
  returned.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-ACAD-48: Change Career Status

**Actor(s):** Admin

**Trigger:** The admin deactivates a discontinued career, or reactivates one.

**Preconditions:** The target `CareerEntity` exists.

**Main Flow:**
1. The admin submits a new status for a career.
2. `RolesGuard` verifies the ADMIN role.
3. The system updates `CareerEntity.status`.
4. The system returns the updated career.

**Alternate Flows / Exceptions:**
- **A1 — Career not found:** a not-found error is returned.

**Postconditions:** An inactive career is excluded from new-subject creation pickers
(UC-ACAD-49) but its historical subjects remain intact.

--------------------------------------------------------------------
## Subjects (9)
--------------------------------------------------------------------

## UC-ACAD-49: Create Subject

**Actor(s):** Admin

**Trigger:** The admin registers a new subject under a career and period (UC-2), optionally
assigning a teacher and uploading a cover image at creation time.

**Preconditions:** The parent `CareerEntity` and `AcademicPeriodEntity` both exist and are
active. If a teacher is specified, that user holds the TEACHER role.

**Main Flow:**
1. The admin submits a subject name, code, credits, career ID, period ID, max capacity,
   and optionally a teacher ID and a cover image file.
2. `RolesGuard` verifies the ADMIN role.
3. The system verifies the parent career and period exist.
4. The system creates a new `SubjectEntity`. If an image was provided, the system stores
   it (Supabase Storage or local disk fallback) and sets `imageUrl`.
5. If a teacher was specified, the system creates the corresponding `SubjectTeacherEntity`
   assignment (equivalent to invoking UC-ACAD-26).
6. The system returns the created subject.

**Alternate Flows / Exceptions:**
- **A1 — Parent career or period does not exist, or either is inactive:** the request is
  rejected.
- **A2 — Specified teacher does not hold the TEACHER role:** the request is rejected.
- **A3 — Image upload fails:** the subject is still created; the image can be attached
  later via UC-ACAD-56.

**Postconditions:** A new `SubjectEntity` exists (`ORDER BY createdAt ASC` is applied on
subsequent listings — UC-ACAD-53 — so a newly created or later-edited subject retains a
stable position rather than "jumping" in the list, a previously-fixed ordering bug);
available for enrollments (UC-ACAD-01), evaluations (UC-ACAD-12), and topics
(UC-ACAD-58).

--------------------------------------------------------------------

## UC-ACAD-50: Update Subject

**Actor(s):** Admin, Teacher (own subject, limited fields)

**Trigger:** The admin or owning teacher edits a subject's details.

**Preconditions:** The target `SubjectEntity` exists. The caller is authorized (ADMIN
unrestricted; TEACHER must own the subject, verified via UC-ACAD-27).

**Main Flow:**
1. The actor submits updated fields (name, credits, max capacity, etc.).
2. `RolesGuard`/ownership checks authorize the request.
3. The system applies the changes and persists them.
4. The system returns the updated subject.

**Alternate Flows / Exceptions:**
- **A1 — Subject not found:** a not-found error is returned.
- **A2 — Teacher attempts to edit a subject they do not own:** the request is rejected.

**Postconditions:** The `SubjectEntity` reflects the new values, retaining its stable
creation-order position in list views (UC-ACAD-53).

--------------------------------------------------------------------

## UC-ACAD-51: Delete Subject

**Actor(s):** Admin

**Trigger:** The admin removes a subject created in error.

**Preconditions:** The target `SubjectEntity` exists and has no dependent enrollments,
evaluations, or grades (or deletion cascades per referential-integrity policy — the safer,
more likely path is that deletion is blocked when dependencies exist).

**Main Flow:**
1. The admin requests deletion of a specific subject.
2. `RolesGuard` verifies the ADMIN role.
3. The system verifies no dependent `EnrollmentEntity`/`EvaluationEntity`/`GradeEntity`
   rows reference this subject.
4. The system deletes the `SubjectEntity`.
5. The system returns a success confirmation.

**Alternate Flows / Exceptions:**
- **A1 — Subject has dependent data:** the deletion is rejected; UC-ACAD-54 (change status)
  should be used instead.
- **A2 — Subject not found:** a not-found error is returned.

**Postconditions:** The `SubjectEntity` no longer exists.

--------------------------------------------------------------------

## UC-ACAD-52: Retrieve Subject

**Actor(s):** Admin, Teacher, Student (any authenticated user, catalog/detail view)

**Trigger:** A view needs a single subject's details.

**Preconditions:** The target `SubjectEntity` exists.

**Main Flow:**
1. The caller requests a subject by ID.
2. The system fetches the `SubjectEntity`.
3. The system returns the subject details, including `imageUrl` and assigned teacher, if
   any.

**Alternate Flows / Exceptions:**
- **A1 — Subject not found:** a not-found error is returned.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-ACAD-53: List Subjects

**Actor(s):** Admin, Teacher, Student, any authenticated user

**Trigger:** A catalog picker, admin table, or course-management screen (UC-10) needs the
list of subjects, optionally filtered by career/period/teacher.

**Preconditions:** None beyond authentication.

**Main Flow:**
1. The caller requests the list of subjects, optionally filtered.
2. The system queries PostgreSQL for matching `SubjectEntity` rows, explicitly ordered by
   `createdAt ASC` so that editing a subject (UC-ACAD-50) does not change its position in
   the list — a previously-observed ordering bug, now fixed by this explicit `ORDER BY`.
3. The system returns the list.

**Alternate Flows / Exceptions:**
- **A1 — No subjects match the filters:** an empty list is returned.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-ACAD-54: Change Subject Status

**Actor(s):** Admin

**Trigger:** The admin deactivates a subject no longer offered, or reactivates one.

**Preconditions:** The target `SubjectEntity` exists.

**Main Flow:**
1. The admin submits a new status for a subject.
2. `RolesGuard` verifies the ADMIN role.
3. The system updates `SubjectEntity.status`.
4. The system returns the updated subject.

**Alternate Flows / Exceptions:**
- **A1 — Subject not found:** a not-found error is returned.

**Postconditions:** An inactive subject is excluded from new-enrollment pickers
(UC-ACAD-01) but its historical enrollments/grades remain intact.

--------------------------------------------------------------------

## UC-ACAD-55: Retrieve a Student's Subjects

**Actor(s):** Student (own)

**Trigger:** The student's subject picker or dashboard needs the list of subjects they are
enrolled in for the active period (a subject-centric variant of UC-ACAD-03).

**Preconditions:** None beyond authentication.

**Main Flow:**
1. The student requests their subjects for the active (or specified) period.
2. The system joins the student's `EnrollmentEntity` rows with their `SubjectEntity`
   details.
3. The system returns the list of subjects.

**Alternate Flows / Exceptions:**
- **A1 — No active enrollments:** an empty list is returned.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-ACAD-56: Upload Subject Image

**Actor(s):** Admin, Teacher (own subject)

**Trigger:** The admin or owning teacher attaches/replaces a subject's cover image after
creation (independently of UC-ACAD-49's optional inline upload).

**Preconditions:** The target `SubjectEntity` exists. The uploaded file passes format/size
validation.

**Main Flow:**
1. The actor uploads an image file for a specific subject.
2. `RolesGuard`/ownership checks authorize the request.
3. The system stores the image (Supabase Storage or local disk fallback under
   `uploads/subjects`).
4. The system updates `SubjectEntity.imageUrl`, replacing any prior image.
5. The system returns the updated subject.

**Alternate Flows / Exceptions:**
- **A1 — Invalid file type/size:** rejected before storage.
- **A2 — Storage backend misconfigured:** the upload fails at storage time; the service
  itself remains available.

**Postconditions:** The subject's `imageUrl` points to the newly uploaded image.

--------------------------------------------------------------------

## UC-ACAD-57: Delete Subject Image

**Actor(s):** Admin, Teacher (own subject)

**Trigger:** The actor removes a subject's cover image.

**Preconditions:** The target `SubjectEntity` currently has a non-null `imageUrl`.

**Main Flow:**
1. The actor requests image removal for a specific subject.
2. `RolesGuard`/ownership checks authorize the request.
3. The system removes the stored image from Supabase Storage or local disk, as applicable.
4. The system clears `SubjectEntity.imageUrl`.
5. The system returns the updated subject.

**Alternate Flows / Exceptions:**
- **A1 — No image currently set:** treated as an idempotent no-op.

**Postconditions:** The subject no longer references a cover image.

--------------------------------------------------------------------
## Topics (7)
--------------------------------------------------------------------

## UC-ACAD-58: Create Topic

**Actor(s):** Teacher (own subject), Admin

**Trigger:** The teacher adds a syllabus topic to a subject (UC-4), optionally with an
attached file.

**Preconditions:** The caller is authorized for the target subject.

**Main Flow:**
1. The teacher submits a topic title, an order/sequence number, and optionally a file.
2. `RolesGuard`/ownership checks authorize the request.
3. The system creates a new `TopicEntity`. If a file was provided, the system stores it
   and sets `fileUrl` (equivalent to invoking UC-ACAD-62).
4. The system returns the created topic.

**Alternate Flows / Exceptions:**
- **A1 — Teacher does not own the subject:** the request is rejected.

**Postconditions:** A new `TopicEntity` exists under the subject's syllabus; it becomes
available as context for weekly check-in questions (UC-ACAD-08) and for AI predictions
(UC-PRED-01/02, via `AcademicHttpClient`).

--------------------------------------------------------------------

## UC-ACAD-59: Update Topic

**Actor(s):** Teacher (own subject), Admin

**Trigger:** The teacher edits a topic's title or ordering.

**Preconditions:** The target `TopicEntity` exists and belongs to a subject the caller is
authorized for.

**Main Flow:**
1. The actor submits updated fields for a specific topic.
2. `RolesGuard`/ownership checks authorize the request.
3. The system applies the changes and persists them.
4. The system returns the updated topic.

**Alternate Flows / Exceptions:**
- **A1 — Topic not found:** a not-found error is returned.

**Postconditions:** The `TopicEntity` reflects the new values.

--------------------------------------------------------------------

## UC-ACAD-60: Delete Topic

**Actor(s):** Teacher (own subject), Admin

**Trigger:** The teacher removes a topic from the syllabus.

**Preconditions:** The target `TopicEntity` exists.

**Main Flow:**
1. The actor requests deletion of a specific topic.
2. `RolesGuard`/ownership checks authorize the request.
3. If the topic has an attached file, the system removes it from storage (equivalent to
   invoking UC-ACAD-63).
4. The system deletes the `TopicEntity`.
5. The system returns a success confirmation.

**Alternate Flows / Exceptions:**
- **A1 — Topic not found:** a not-found error is returned.

**Postconditions:** The `TopicEntity` no longer exists.

--------------------------------------------------------------------

## UC-ACAD-61: List Topics

**Actor(s):** Teacher (own subject), Admin, Student (own subject, read-only)

**Trigger:** The syllabus view for a subject needs the ordered list of topics.

**Preconditions:** None beyond authorization for the target subject.

**Main Flow:**
1. The caller requests the list of topics for a subject.
2. Ownership/role checks authorize the request.
3. The system queries PostgreSQL for `TopicEntity` rows for that subject, ordered by
   `order`.
4. The system returns the ordered list.

**Alternate Flows / Exceptions:**
- **A1 — No topics defined yet:** an empty list is returned.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-ACAD-62: Upload Topic File

**Actor(s):** Teacher (own subject), Admin

**Trigger:** The teacher attaches or replaces a material/file on a topic.

**Preconditions:** The target `TopicEntity` exists. The uploaded file passes format/size
validation.

**Main Flow:**
1. The teacher uploads a file for a specific topic.
2. `RolesGuard`/ownership checks authorize the request.
3. The system stores the file (Supabase Storage or local disk fallback under
   `uploads/topics`).
4. The system updates `TopicEntity.fileUrl`, replacing any prior file.
5. The system returns the updated topic.

**Alternate Flows / Exceptions:**
- **A1 — Invalid file type/size:** rejected before storage.

**Postconditions:** The topic's `fileUrl` points to the newly uploaded file.

--------------------------------------------------------------------

## UC-ACAD-63: Delete Topic File

**Actor(s):** Teacher (own subject), Admin

**Trigger:** The teacher removes a topic's attached file without deleting the topic itself.

**Preconditions:** The target `TopicEntity` currently has a non-null `fileUrl`.

**Main Flow:**
1. The actor requests file removal for a specific topic.
2. `RolesGuard`/ownership checks authorize the request.
3. The system removes the stored file from Supabase Storage or local disk, as applicable.
4. The system clears `TopicEntity.fileUrl`.
5. The system returns the updated topic.

**Alternate Flows / Exceptions:**
- **A1 — No file currently set:** treated as an idempotent no-op.

**Postconditions:** The topic no longer references a file.

--------------------------------------------------------------------

## UC-ACAD-64: Retrieve a Subject's Topics (Internal)

**Actor(s):** System (internal — prediction-service, via `AcademicHttpClient`)

**Trigger:** prediction-service needs syllabus topics as grounding context for an
AI-generated recommendation (UC-PRED-01/02).

**Preconditions:** The caller holds a valid internal-scope JWT.

**Main Flow:**
1. The internal caller requests the topics for a subject via the internal endpoint.
2. `InternalServiceGuard` verifies the `service:internal` scope.
3. The system queries PostgreSQL for `TopicEntity` rows for that subject.
4. The system returns the list in a shape suited for internal consumption (e.g., titles
   only, no file URLs).

**Alternate Flows / Exceptions:**
- **A1 — No topics defined for the subject:** an empty list is returned; the AI prompt
  proceeds with reduced context rather than failing.

**Postconditions:** None (read-only operation, internal-only variant of UC-ACAD-61).

--------------------------------------------------------------------
## Observations (2)
--------------------------------------------------------------------

## UC-ACAD-65: Create Observation

**Actor(s):** Teacher (own subject/student)

**Trigger:** The teacher writes a free-text qualitative note about a specific student
(UC-6), e.g., "shows improved participation this week," tagged with a type.

**Preconditions:** The student holds an `ACTIVE` enrollment in a subject the teacher owns.

**Main Flow:**
1. The teacher submits observation content, a type tag, a student ID, and a subject ID.
2. `RolesGuard`/ownership checks authorize the request.
3. The system persists a new `TeacherObservationEntity` document in MongoDB
   (`teacher_observations`).
4. The system returns the created observation.

**Alternate Flows / Exceptions:**
- **A1 — Teacher does not own the subject, or the student is not enrolled in it:** the
  request is rejected.

**Postconditions:** A new `TeacherObservationEntity` document exists, listable per student
(UC-ACAD-66) and informally usable as AI prediction context.

--------------------------------------------------------------------

## UC-ACAD-66: Retrieve Observations by Student

**Actor(s):** Teacher (own subject/student), Admin

**Trigger:** The teacher reviews the history of qualitative observations recorded for a
student.

**Preconditions:** None beyond authorization for the target student/subject.

**Main Flow:**
1. The caller requests observations for a specific student, optionally scoped to a
   subject.
2. Ownership/role checks authorize the request.
3. The system queries MongoDB for matching `TeacherObservationEntity` documents, ordered
   most recent first.
4. The system returns the list.

**Alternate Flows / Exceptions:**
- **A1 — No observations recorded yet:** an empty list is returned.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------
## User Lifecycle (1)
--------------------------------------------------------------------

## UC-ACAD-67: Check User Deactivation Eligibility

**Actor(s):** System (internal — invoked by user-service, via `AcademicStatusHttpClient`,
as part of UC-USER-04)

**Trigger:** An admin has requested deactivation of a TEACHER or STUDENT in user-service,
which must first confirm no active academic dependency blocks the deactivation (UC-11).

**Preconditions:** The caller holds a valid internal-scope JWT.

**Main Flow:**
1. user-service calls the internal eligibility-check endpoint with the target user's ID
   and role.
2. `InternalServiceGuard` verifies the `service:internal` scope.
3. If the target is a TEACHER, the system checks whether any `SubjectEntity` currently has
   this user as its assigned teacher (via `SubjectTeacherEntity`/`teacherId`). If the
   target is a STUDENT, the system checks for any `EnrollmentEntity` with
   `status = ACTIVE`.
4. The system returns an eligibility result: eligible (no blocking dependency), or
   ineligible, together with a machine-readable reason (e.g., "owns 3 active subjects").

**Alternate Flows / Exceptions:**
- **A1 — Blocking dependency found:** the system returns `ineligible` with details; the
  calling flow (UC-USER-04) surfaces this via the `AdminUserRestrictionDialog` rather than
  proceeding with deactivation.
- **A2 — Target user has no academic footprint at all (e.g., newly created):** the system
  returns `eligible`.

**Postconditions:** None (read-only check; the actual deactivation, if eligible, happens in
user-service as part of UC-USER-04).

--------------------------------------------------------------------
## Misc (1)
--------------------------------------------------------------------

## UC-ACAD-68: Ingest Academic Data

**Actor(s):** Admin, System (internal — e.g., a bulk-loading/migration entry point)

**Trigger:** A bulk, cross-entity academic dataset (e.g., an initial institutional data
load or a migration from a legacy system) needs to be ingested in one operation, rather
than through individual create endpoints (UC-ACAD-30, 36, 43, 49, etc.).

**Preconditions:** The actor holds the ADMIN role (or the internal-scope JWT, if invoked
as a system-level migration step). The submitted dataset is well-formed.

**Main Flow:**
1. The actor submits a structured academic dataset (faculties, careers, periods, subjects,
   and/or enrollments) in a single payload.
2. The appropriate guard authorizes the request.
3. The system validates and persists the entities in dependency order (faculties before
   careers, careers and periods before subjects, subjects before enrollments), reusing the
   same validation rules as the corresponding individual use cases.
4. The system returns a summary of created/updated/skipped records.

**Alternate Flows / Exceptions:**
- **A1 — A record in the dataset fails validation (e.g., duplicate code, missing parent):**
  that record is skipped and reported; ingestion continues for the remaining records rather
  than aborting entirely (implementation-defined all-or-nothing vs. partial-success
  policy).

**Postconditions:** The academic catalog reflects the ingested dataset, subject to the
same integrity rules enforced by the individual create use cases it wraps.
