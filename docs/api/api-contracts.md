# API Contracts

> Full endpoint reference, extracted directly from each service's controller decorators (`@Controller`, `@Get`/`@Post`/etc., `@Roles`), not from `docs/API.md`, `docs/CONTRACTS.md`, or `contracts/openapi-contracts.yaml` — all three were found to be stale/incomplete during this audit (missing OAuth routes, phantom `/auth/profile` route, wrong grade scale, missing entire feature areas). Those artifacts are kept as historical design references, not authoritative. **The single most reliable live reference is each service's own generated Swagger** at `/api/v1/<domain>/docs` — cross-check against it if this document and a running service ever disagree.

All routes are reached through Kong at `https://<host>/api/v1/...` (or `/api/socket.io` for the WebSocket). `[Role1, Role2]` denotes `@Roles(...)`; no bracket means "any authenticated role" (still requires a valid JWT); `public` means no `JwtAuthGuard` at all; `internal` means `InternalServiceGuard` + Kong IP-restriction (service-to-service only, unreachable from the public internet even with a valid token).

## auth-service (port 3001, prefix `/api/v1/auth`)

| Method & path | Access | Purpose |
|---|---|---|
| `POST /register` | public | RF-001 — register (defaults role STUDENT) |
| `POST /login` | public | RF-002 — email/password login, returns JWT + refresh token |
| `POST /refresh` | public | RF-002.4 — renew access token |
| `POST /forgot-password` | public | RF-004 — request password reset email |
| `POST /reset-password` | public | RF-004 — reset password with token |
| `POST /logout` | any authenticated | RF-003 — invalidate refresh token |
| `GET /microsoft` | public | Start Microsoft OAuth redirect |
| `GET /microsoft/callback` | public | OAuth callback — issues JWTs, redirects to SPA |
| `POST /internal/users/batch` | internal | Batch user lookup by id list |
| `GET /internal/users/search?q=&limit=` | internal | Text search users |
| `GET /internal/users/:id` | internal | Single user lookup |
| `PATCH /internal/users/:id/role` | internal | Role sync |
| `PATCH /internal/users/:id/status` | internal | Status sync (active/disabled) |
| `PATCH /internal/users/:id/profile` | internal | Profile sync |
| `GET /health` | public | Postgres + Redis check |

## user-service (port 3002, prefix `/api/v1/users`)

| Method & path | Access | Purpose |
|---|---|---|
| `GET /` | `[ADMIN, TEACHER]` | List users (role/status/search/pagination; TEACHER forced to STUDENT-only) |
| `GET /me` | any authenticated | RF-014 — current user's profile |
| `POST /me/avatar` | any authenticated | Upload own avatar (jpg/png, max 2MB) |
| `DELETE /me/avatar` | any authenticated | Remove own avatar |
| `POST /:id/avatar` | `[ADMIN]` | Upload another user's avatar |
| `DELETE /:id/avatar` | `[ADMIN]` | Remove another user's avatar |
| `GET /:id` | any authenticated | Get profile by id |
| `PUT /:id` | any authenticated (self) or `[ADMIN]` (role/status) | Update profile |
| `DELETE /:id` | `[ADMIN]` | Soft-delete a user |
| `GET /uploads/avatars/:filename` | public | Serve avatar file (UUID-validated filename) |
| `POST /internal/profiles` | internal | Create profile (called by auth-service post-registration) |
| `GET /internal/profiles/:id` | internal | Get profile |
| `PUT /internal/profiles/:id` | internal | Update profile |
| `GET /internal/by-role?role=` | internal | List active user ids by role (broadcast targeting) |
| `GET /health` | public | Postgres check |

## academic-service (port 3003, prefix `/api/v1/academic`) — largest controller, ~50 routes

### Enrollments
| Method & path | Access | Purpose |
|---|---|---|
| `POST /enrollments` | `[TEACHER, ADMIN]` | RF-010 — enroll a student |
| `GET /subjects/:subjectId/enrollments` | `[TEACHER, ADMIN]` | List a subject's enrollments |
| `POST /subjects/:subjectId/enrollments/batch` | `[TEACHER, ADMIN]` | Batch enroll |
| `PATCH /enrollments/:enrollmentId/status` | `[TEACHER, ADMIN]` | Update enrollment status |
| `GET /enrollments` | `[ADMIN, TEACHER, STUDENT]` | List (filtered by caller) |

### Weekly check-ins
| Method & path | Access | Purpose |
|---|---|---|
| `GET /students/me/subjects` | `[STUDENT]` | List own enrolled subjects |
| `GET /students/me/subjects/:subjectId/check-ins/current` | `[STUDENT]` | Current week's check-in |
| `POST /students/me/subjects/:subjectId/check-ins` | `[STUDENT]` | Submit a check-in |
| `PUT /students/me/subjects/:subjectId/check-ins/:checkInId` | `[STUDENT]` | Update current week's check-in |
| `GET /students/me/subjects/:subjectId/check-ins` | `[STUDENT]` | List own check-in history |
| `GET /subjects/:subjectId/check-ins/summary` | `[TEACHER]` | Aggregated check-in summary |

### Evaluations & grades
| Method & path | Access | Purpose |
|---|---|---|
| `POST /evaluations` | `[TEACHER, ADMIN]` | Create evaluation |
| `GET /subjects/:subjectId/evaluations/weight-summary` | `[TEACHER, ADMIN]` | Weight totals |
| `GET /subjects/:subjectId/evaluations` | `[TEACHER, ADMIN, STUDENT]` | List evaluations |
| `POST /subjects/:subjectId/evaluations` | `[TEACHER]` | Create (subject-scoped route) |
| `PUT /evaluations/:evaluationId` | `[TEACHER]` | Update evaluation |
| `PATCH /evaluations/:evaluationId/status` | `[TEACHER]` | Archive/activate |
| `POST /grades` | `[TEACHER, ADMIN]` | RF-012 — record a grade |
| `POST /grades/evaluation` | `[TEACHER, ADMIN]` | Record grade tied to an evaluation |
| `PUT /grades/:id` | `[TEACHER, ADMIN]` | Update grade (audited to `grade_history`) |
| `POST /subjects/:subjectId/grade-imports` | `[TEACHER]` | RF-013 — bulk import (xlsx/csv) |
| `GET /subjects/:subjectId/grade-imports` | `[TEACHER, ADMIN]` | List import jobs |
| `GET /grade-imports/:importId` | `[TEACHER, ADMIN]` | Import job status/errors |
| `POST /import/grades` | `[TEACHER, ADMIN]` | Alternate bulk import route |

### Catalog: faculties / periods / careers
| Method & path | Access | Purpose |
|---|---|---|
| `GET /faculties`, `GET /faculties/:id` | any authenticated | RF-006 |
| `POST /faculties`, `PUT /faculties/:id`, `PATCH /faculties/:id/status`, `DELETE /faculties/:id` | `[ADMIN]` | RF-006 CRUD |
| `GET /periods`, `GET /periods/active`, `GET /periods/:id` | any authenticated | RF-008 |
| `POST /periods`, `PUT /periods/:id`, `PATCH /periods/:id/status`, `DELETE /periods/:id` | `[ADMIN]` | RF-008 CRUD |
| `GET /careers`, `GET /careers/:id` | any authenticated | RF-007 |
| `POST /careers`, `PUT /careers/:id`, `PATCH /careers/:id/status`, `DELETE /careers/:id` | `[ADMIN]` | RF-007 CRUD |

### Subjects & teachers
| Method & path | Access | Purpose |
|---|---|---|
| `GET /subjects`, `GET /subjects/:id` | any authenticated | RF-009 |
| `POST /subjects` | `[TEACHER, ADMIN]` | Create (ADMIN must supply `teacherId`; TEACHER always gets their own id) |
| `GET /teachers/me/subjects` | `[TEACHER]` | Own subjects |
| `PUT /subjects/:id`, `PATCH /subjects/:id/status` | `[ADMIN, TEACHER]` | Update / activate-deactivate |
| `DELETE /subjects/:id` | `[ADMIN]` | Delete |
| `POST /subjects/:subjectId/image`, `DELETE /subjects/:subjectId/image` | `[TEACHER, ADMIN]` | Cover image (Supabase Storage) |
| `POST /teachers/assign` | `[ADMIN]` | RF-011 — assign teacher to subject |

### Syllabus topics
| Method & path | Access | Purpose |
|---|---|---|
| `GET /subjects/:subjectId/topics` | `[TEACHER, STUDENT, ADMIN]` | List |
| `POST /subjects/:subjectId/topics` | `[TEACHER]` | Create |
| `PUT /topics/:topicId`, `DELETE /topics/:topicId` | `[TEACHER]` | Update / delete |
| `POST /topics/:topicId/file`, `DELETE /topics/:topicId/file` | `[TEACHER]` | Attach/remove a file |

### Observations, uploads, internal, health
| Method & path | Access | Purpose |
|---|---|---|
| `POST /observations` | `[TEACHER]` | RF-022 — create observation (Mongo) |
| `GET /observations/student/:id` | any authenticated | List a student's observations |
| `GET /uploads/subjects/:filename`, `GET /uploads/topics/:filename` | public | Serve uploaded files |
| `GET /internal/students/:studentId/grades?periodId=` | internal | Cross-service grade lookup |
| `GET /internal/students/:studentId/enrollments` | internal | Cross-service enrollment lookup |
| `GET /internal/subjects/:subjectId/evaluations` | internal | Weights, consumed by analytics-service |
| `GET /internal/students/:studentId/check-ins/latest?subjectId=&periodId=` | internal | Latest check-in |
| `GET /internal/subjects/:subjectId/teachers/:teacherId/is-owner` | internal | Ownership check |
| `GET /internal/subjects/:subjectId` | internal | Name/teacherId lookup |
| `GET /internal/teachers/:teacherId/students?periodId=` | internal | Roster for a teacher |
| `GET /internal/subjects/:subjectId/topics` | internal | Consumed by prediction-service for AI context |
| `GET /internal/users/:userId/deactivation-eligibility?role=` | internal | UC-11 dependency check |
| `GET /health` | public | Postgres + Redis + MongoDB check |

## analytics-service (port 3004, prefix `/api/v1/analytics` and `/api/v1/notifications`)

### Analytics
| Method & path | Access | Purpose |
|---|---|---|
| `GET /students/me/subjects/overview` | `[STUDENT]` | Batched per-subject overview (1 call instead of N) |
| `GET /students/me/subjects/:subjectId/metrics` | `[STUDENT]` | Weekly metrics + trend for one subject |
| `GET /subjects/:subjectId/metrics/summary` | `[TEACHER, ADMIN]` | Subject average + risk-count breakdown |
| `GET /subjects/:subjectId/metrics/progress` | `[TEACHER, ADMIN]` | Weekly course-average series |
| `GET /students/me/subjects/:subjectId/risk` | `[STUDENT]` | Own risk for a subject |
| `GET /students/me/alerts` | `[STUDENT]` | Own alerts |
| `GET /subjects/:subjectId/alerts` | `[TEACHER]` | Subject alerts |
| `POST /average/:studentId/:periodId` | any authenticated | RF-015 |
| `POST /trend/:studentId` | any authenticated | RF-016 |
| `POST /compliance/:studentId` | any authenticated | RF-017 |
| `POST /risk` | any authenticated | RF-018 |
| `POST /alerts/:studentId` | any authenticated | RF-021 — generate |
| `PATCH /alerts/:alertId/resolve` | `[TEACHER]` | Resolve an alert |
| `GET /dashboard/student/:studentId` | any authenticated | RF-023 |
| `GET /dashboard/teacher/:teacherId` | any authenticated | RF-024 |
| `GET /dashboard/admin` | any authenticated | RF-025 |
| `GET /metrics/overview`, `GET /metrics/users/:userId`, `GET /metrics/subjects/:subjectId` | any authenticated | Generic metrics views |
| `GET /internal/risk-snapshot/:studentId/:periodId` | internal | Consumed by prediction-service |
| `POST /internal/recalculate` | internal | Weekly recalculation trigger |
| `GET /internal/students/:studentId/subjects/:subjectId/metrics/latest` | internal | Consumed by academic-service & prediction-service |
| `GET /health` | public | Postgres + Redis + MongoDB check |

### Notifications (same service, different prefix)
| Method & path | Access | Purpose |
|---|---|---|
| `GET /notifications/me?status=&type=&page=&limit=` | any authenticated | List own notifications |
| `PATCH /notifications/read-all` | any authenticated | Mark all read |
| `PATCH /notifications/:notificationId/read` | any authenticated | Mark one read |
| `POST /notifications/device-tokens` | any authenticated | Register Expo push token |
| `DELETE /notifications/device-tokens` | any authenticated | Unregister |
| `POST /notifications/internal` | internal | Create/broadcast a notification |
| **WS** `/api/socket.io` | JWT on connect | Real-time `notification:new` push, room `user:{userId}` — source of truth remains Postgres |

## prediction-service (port 3006, prefix `/api/v1/prediction`)

| Method & path | Access | Purpose |
|---|---|---|
| `GET /students/me/subjects/:subjectId/prediction` | `[STUDENT]` | Own per-subject prediction |
| `GET /subjects/:subjectId/students/:studentId/prediction` | `[TEACHER, ADMIN]` | Any student's per-subject prediction |
| `GET /subjects/:subjectId/predictions?page=&limit=` | `[TEACHER, ADMIN]` | Latest prediction per student in a subject |
| `GET /students/:studentId/periods/:periodId` | `[STUDENT, TEACHER, ADMIN]` | RF-019 — global AI prediction (STUDENT restricted to own id) |
| `GET /students/:studentId/history?limit=&subjectId=` | `[STUDENT, TEACHER, ADMIN]` | RF-020 — prediction history (STUDENT restricted to own id) |
| `POST /students/me/periods/:periodId/generate` | `[STUDENT]` | On-demand global generation, 1/hour cooldown |
| `POST /students/me/subjects/:subjectId/generate` | `[STUDENT]` | On-demand subject generation, 1/hour/subject cooldown |
| `POST /internal/recalculate` | internal | Triggered by analytics-service after check-in/grade change |
| `GET /health` | public | **MongoDB only** — known inconsistency, service also uses Postgres but its health check doesn't report it |

## Common response shapes

- **Pagination**: `{ items: T[], total, page, limit }` — each service implements this independently (`packages/shared-types`' `PaginatedResponse` exists but is not consumed anywhere; see [../backend/shared-packages.md](../backend/shared-packages.md)).
- **Errors**: `{ statusCode, message, error, correlationId }` via each service's `http-exception.filter.ts`; `code` field added for specific cases like `ACCOUNT_DISABLED`.
- **Roles**: `Role` enum is `STUDENT | TEACHER | ADMIN` everywhere — no 4th value exists in real code (contrast with `contracts/openapi-contracts.yaml`, which matches this correctly).

## Superseded artifacts (do not use as source of truth)

| Artifact | Why it's superseded |
|---|---|
| `docs/API.md` (old) | Documented a phantom `GET /auth/profile` route (real profile endpoint is `GET /users/me` on a different service); used a 0–10 grade scale (real: 0–20); covered only auth + academic, missing user/analytics/prediction entirely. Removed. |
| `docs/CONTRACTS.md` (old) | Internally inconsistent (embeds an `openapi: 3.0.0` snippet while the real contract file declares `3.1.0`); `EnrollmentStatus`/`RiskLevel` values didn't match real enums; Redis key format didn't match real code. Removed. |
| `contracts/openapi-contracts.yaml` | Kept in place (outside `docs/`), but is a hand-authored **design-phase** artifact, not generated from the running services. Missing check-ins, topics, grade-imports, notifications, device-tokens, and both OAuth routes. Use this document instead for current endpoint truth. |
