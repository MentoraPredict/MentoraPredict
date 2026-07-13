# academic-service

Owns the entire academic domain: faculties, careers, academic periods, subjects, enrollments, evaluations, grades and their import/audit trail, teacher assignments and observations, topics/materials, and student weekly check-ins. It is the largest and most fully-implemented service in the monorepo, with 69 use cases across roughly 50 endpoints.

## Tech stack

| Library | Version | Purpose |
|---|---|---|
| NestJS | **11.1.24** | Application framework — a newer major version than the other 4 services (10.3.0) |
| @nestjs/typeorm | 11.0.1 | ORM integration for PostgreSQL |
| pg | 8.21.0 | PostgreSQL driver |
| @nestjs/mongoose | 11.0.0 | MongoDB integration |
| mongoose | 8.3.0 | MongoDB ODM — used for `teacher-observation.schema.ts` |
| ioredis | 5.3.2 | Redis client (present, see Known issues — functionally dormant) |
| @supabase/supabase-js | — | Supabase Storage for subject images / topic files |
| multer | — | File upload handling |
| xlsx | 0.18.5 | Grade-import spreadsheet parsing |
| class-validator | 0.15.1 | DTO validation — newer than other services' 0.14.1 |
| TypeScript | ^6.0.3 | Also newer than other services' ^5.4.0 |
| Jest | 29 | Testing |

Dockerfile is based on `node:22-alpine`, creates `uploads/subjects` and `uploads/topics` directories, and exposes port 3003.

Note: the package.json `description` field still literally reads "placeholder, no logic implemented" — stale metadata, notably ironic given this is the largest and most-implemented service in the monorepo (see Known issues).

## Layer structure

```
src/
  application/{dtos, ports/{input,output}, use-cases (+ __tests__)}
  domain/{entities}
  infrastructure/{adapters, auth, cache, config, controllers, external(empty), filters, guards, persistence, storage, utils}
```

Standard hexagonal structure per [../architecture/low-level-architecture.md](../architecture/low-level-architecture.md), with an extra `infrastructure/utils` folder not present in auth-service or user-service. Unlike user-service, there is no `domain/ports` — all ports live under `application/ports`.

## Domain entities

14 entities total.

| Entity | Purpose |
|---|---|
| `AcademicEntity` | Unused skeleton placeholder — dead code, not wired into any use case. |
| `AcademicPeriodEntity` | name, code, dates, status, type. |
| `CareerEntity` | name, code, facultyId, durationSemesters, status. |
| `EnrollmentEntity` | status, enrolledAt. |
| `EvaluationEntity` | name, weight (0-100), dueDate, isActive. |
| `FacultyEntity` | name, code, status. |
| `GradeEntity` | grade value tied to student + subject + evaluation, 0-20 scale. |
| `GradeHistoryEntity` | audit trail: previousValue/newValue/changedBy. |
| `GradeImportEntity` | bulk import job: file, row counts, status, errors[]. |
| `SubjectEntity` | name, code, credits, careerId, academicPeriodId, maxCapacity, teacherId, imageUrl. |
| `SubjectTeacherEntity` | subject-teacher-period assignment, composite key. |
| `TeacherObservationEntity` | type, content — persisted in MongoDB. |
| `TopicEntity` | title, order, fileUrl. |
| `WeeklyCheckInEntity` | attendance, taskCompletion, studyHours, emotionalState, generalComprehension, topicResponses[]. |

## Use cases

69 use cases total, grouped by feature area.

- **Enrollments**: enroll-student, batch-enroll-students, get-student-enrollments, get-subject-enrollments, update-enrollment-status.
- **Check-ins**: get-current-check-in, get-latest-check-in, upsert-check-in, update-check-in, list-check-ins, get-check-ins-summary.
- **Evaluations**: create-evaluation, update-evaluation, archive-evaluation, list-evaluations, get-subject-evaluation-weights, get-weight-summary.
- **Grades**: record-grade, register-grade, update-grade, get-student-grades, import-grades, import-subject-grades, get-grade-import, list-grade-imports.
- **Teachers/ownership**: assign-teacher, check-subject-ownership, get-teacher-students, get-teacher-subjects.
- **Faculties**: create-faculty, update-faculty, delete-faculty, get-faculty, list-faculties, change-faculty-status.
- **Academic periods**: create-academic-period, update-academic-period, delete-academic-period, get-academic-period, get-active-academic-period, list-academic-periods, change-academic-period-status.
- **Careers**: create-career, update-career, delete-career, get-career, list-careers, change-career-status.
- **Subjects**: create-subject, update-subject, delete-subject, get-subject, list-subjects, change-subject-status, get-student-subjects, upload-subject-image, delete-subject-image.
- **Topics**: create-topic, update-topic, delete-topic, list-topics, upload-topic-file, delete-topic-file, get-subject-topics-internal.
- **Observations**: create-observation, get-observations-by-student.
- **User lifecycle**: check-user-deactivation-eligibility.
- **Misc**: ingest-academic-data.

## HTTP endpoints

Full endpoint reference with roles lives in [../api/api-contracts.md](../api/api-contracts.md) — this section only lists the controller files and route counts.

## External integrations

- **PostgreSQL** — 12 entities: subjects, enrollments, evaluations, grades, faculties, periods, careers, topics, grade imports/history, subject-teacher assignments.
- **MongoDB** — `teacher-observation.schema.ts` only.
- **Redis (ioredis)** — present but dormant; see Known issues.
- **Supabase Storage** — subject images and topic files, alongside local disk storage.
- **AnalyticsHttpClient**, **NotificationHttpClient** — call analytics-service.
- **UserProfileAdapter**, **UserRoleHttpAdapter** — call user-service.

## Environment variables

`ANALYTICS_SERVICE_URL`, `APP_PORT`, `CORS_ORIGINS`, `JWT_*`, `MONGO_DB`/`HOST`/`PASSWORD`/`PORT`/`URL`/`USER`, `NODE_ENV`, `POSTGRES_*`, `REDIS_*`, `SUPABASE_*`, `SWAGGER_SERVER_URL`, `UPLOADS_DIR`, `USER_SERVICE_URL`.

## Known issues / audit findings

- **Dormant Redis adapter**: `RedisAdapter` (`infrastructure/cache/redis.adapter.ts`) exists and is injected only into `health.controller.ts` for the liveness ping. It is not bound to any output port/interface in `app.module.ts`'s providers, so no use case actually caches through it today — present in code, functionally unused.
- **Stale package metadata**: the package.json `description` field says "placeholder, no logic implemented" despite this being the largest, most fully-implemented service in the monorepo. Worth fixing.
- **Fixed bug — subject list ordering**: `SubjectRepository.findAll()` originally had no `ORDER BY`, which let Postgres resurface an updated row in a different position after any `UPDATE`, visible to users as a course "jumping to the end of the list" after being edited. This was fixed by adding `ORDER BY s.createdAt ASC`.
