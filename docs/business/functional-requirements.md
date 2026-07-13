# Functional Requirements (RF-)

> **No canonical requirements specification exists anywhere in this repository.** This catalog was reconstructed by grepping the entire codebase for `RF-0\d\d` references (controller `@ApiOperation` comments, `contracts/openapi-contracts.yaml` section headers, `data-models/data-models.yaml` field notes, per-service `README.md` "coverage" lines) and cross-referencing each code with the endpoint it's actually attached to. Codes not listed here (RF-026+) do not appear anywhere in the code.

| Code | Requirement | Owning service | Implemented by |
|---|---|---|---|
| RF-001 | Register a new user (defaults to role `STUDENT`) | auth-service | `POST /api/v1/auth/register` |
| RF-002 | Login with email/password, returns JWT (RS256) + refresh token | auth-service | `POST /api/v1/auth/login` |
| RF-002.4 | Renew access token using a refresh token | auth-service | `POST /api/v1/auth/refresh` |
| RF-003 | Logout — invalidates the refresh token in Redis | auth-service | `POST /api/v1/auth/logout` |
| RF-004 | Password recovery — request reset email, then reset with token | auth-service | `POST /api/v1/auth/forgot-password`, `POST /api/v1/auth/reset-password` |
| RF-005 | Role-based access control / assign role to a user | auth-service, user-service | `RolesGuard` + `@Roles()` on every protected route; `PUT /api/v1/users/:id` (ADMIN) |
| RF-006 | Faculties: list / create / update / deactivate | academic-service | `GET|POST|PUT|PATCH|DELETE /api/v1/academic/faculties*` |
| RF-007 | Careers: list / create / update / deactivate | academic-service | `GET|POST|PUT|PATCH|DELETE /api/v1/academic/careers*` — **see discrepancy note below** |
| RF-008 | Academic periods: list / create / update / deactivate | academic-service | `GET|POST|PUT|PATCH|DELETE /api/v1/academic/periods*` — **see discrepancy note below** |
| RF-009 | Subjects: list / create / update / deactivate | academic-service | `GET|POST|PUT|PATCH|DELETE /api/v1/academic/subjects*` |
| RF-010 | Enrollments: list (filtered) / enroll a student in a subject | academic-service | `GET /api/v1/academic/enrollments`, `POST /api/v1/academic/enrollments`, `POST /api/v1/academic/subjects/:id/enrollments/batch` |
| RF-011 | Assign a teacher to a subject | academic-service | `POST /api/v1/academic/teachers/assign` (ADMIN) |
| RF-012 | Evaluations & grades: create evaluation, record/update grade with audit history | academic-service | `POST /api/v1/academic/evaluations`, `POST /api/v1/academic/grades`, `PUT /api/v1/academic/grades/:id` |
| RF-013 | Bulk-ingest academic data (grade import from spreadsheet) | academic-service | `POST /api/v1/academic/subjects/:id/grade-imports`, `POST /api/v1/academic/import/grades` |
| RF-014 | User profile — fetch/list profiles, keep `user_profiles` in sync with auth-service on registration | user-service, auth-service | `GET /api/v1/users/me`, `GET /api/v1/users`, internal profile-sync call from auth-service |
| RF-015 | Weighted average calculation + aggregated subject/institution metrics | analytics-service | `POST /api/v1/analytics/average/:studentId/:periodId`, `GET .../metrics/summary`, `GET /api/v1/analytics/metrics/overview` |
| RF-016 | Performance trend calculation | analytics-service | `POST /api/v1/analytics/trend/:studentId`, `CalculateTrendUseCase` (WASM linear regression) |
| RF-017 | Compliance index calculation | analytics-service | `POST /api/v1/analytics/compliance/:studentId` |
| RF-018 | Deterministic risk classification for a student | analytics-service | `POST /api/v1/analytics/risk`, `GET /internal/risk-snapshot/:studentId/:periodId` (consumed by prediction-service) |
| RF-019 | Generate AI-assisted risk prediction (combines RF-018's risk + academic context + OpenAI) | prediction-service | `GET /api/v1/prediction/students/:studentId/periods/:periodId` |
| RF-020 | Generate AI recommendations + prediction/recommendation history | prediction-service | same endpoint as RF-019 (recommendations are part of the response), `GET /api/v1/prediction/students/:studentId/history` |
| RF-021 | Early alerts — list / generate alerts for a student | analytics-service | `GET /api/v1/analytics/students/me/alerts`, `GET /api/v1/analytics/subjects/:id/alerts`, `POST /api/v1/analytics/alerts/:studentId` |
| RF-022 | Teacher qualitative observations about a student | academic-service | `POST /api/v1/academic/observations`, `GET /api/v1/academic/observations/student/:id` |
| RF-023 | Student dashboard — aggregated personal data | analytics-service | `GET /api/v1/analytics/dashboard/student/:studentId` |
| RF-024 | Teacher dashboard — at-risk students per subject | analytics-service | `GET /api/v1/analytics/dashboard/teacher/:teacherId` |
| RF-025 | Admin dashboard — institution-wide indicators | analytics-service | `GET /api/v1/analytics/dashboard/admin` |

## Discrepancy: RF-007 / RF-008 labeling mismatch

`academic-service`'s controller (`academic.controller.ts`) tags **"Enroll a student in a subject"** as `RF-007` (line 226) and **"Create evaluation" / "Register grade"** as `RF-008` (lines 445, 604) in its inline `@ApiOperation` comments. `contracts/openapi-contracts.yaml`, however, assigns those same two features to **RF-010** (enrollments) and **RF-012** (evaluations/grades) — matching the table above, which follows the contract's numbering since it's the more complete, internally consistent source. The controller's inline comments appear to have been written against an earlier/different RF numbering and never updated. This was not silently reconciled — if you're grepping the code directly for `RF-007`/`RF-008`, be aware the comment you find describes a different feature than what this table (and the contract) label with that code.

## Not implemented / not found in code

RF-026 and above do not appear anywhere in the codebase. If the institution's original requirements document specifies more functional requirements beyond RF-025 (e.g., reporting exports, multi-institution support, parent/guardian access), they have not been implemented as of this audit.
