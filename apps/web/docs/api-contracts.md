# MentoraPredict Web - API Contracts

This document summarizes the API contracts that `apps/web` must consume from the frontend.

The main source reviewed is:

```txt
contracts/openapi-contracts.yaml
```

The existing `openapi.yaml` files and controllers were also reviewed in:

```txt
services/auth-service
services/user-service
services/academic-service
services/analytics-service
services/recommendation-service
```

## Frontend Rule

The frontend must not call hardcoded URLs from components, forms, or pages.

Routes must be centralized in:

```txt
src/services/api/endpoints.ts
```

And consumed from services:

```txt
src/services/auth/auth.service.ts
src/services/users/users.service.ts
src/services/academic/courses.service.ts
src/services/analytics/risk.service.ts
src/services/recommendations/recommendations.service.ts
```

Current status in `apps/web`:

```txt
src/services/api.ts
src/services/auth.service.ts
```

Currently `auth.service.ts` consumes:

```txt
POST /v1/auth/login
```

The central monorepo contract documents routes with:

```txt
/api/v1/...
```

Since the frontend uses `VITE_API_BASE_URL` with a default value of `/api`, it is reasonable that the client consumes `/v1/...` and the gateway resolves `/api/v1/...`.

## Base URL

The current Axios client uses:

```ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";
```

Therefore, if `VITE_API_BASE_URL=/api`, a call such as:

```txt
/v1/auth/login
```

ends up pointing to:

```txt
/api/v1/auth/login
```

Recommended rule:

```txt
Use paths relative to the frontend gateway in endpoints.ts:
/v1/auth/login
/v1/users/me
/v1/analytics/dashboard/student/:studentId
```

And document the complete backend contract as:

```txt
/api/v1/auth/login
/api/v1/users/me
/api/v1/analytics/dashboard/student/:studentId
```

## Headers

Private routes must send:

```txt
Authorization: Bearer <accessToken>
Content-Type: application/json
```

For file uploads:

```txt
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

The current Axios interceptor already attaches the token from `localStorage`:

```ts
config.headers.Authorization = `Bearer ${token}`;
```

When `auth.store.ts` exists, the token must continue to be managed centrally, not from components.

## Roles

Expected roles:

```txt
STUDENT
TEACHER
ADMIN
```

The role must come from the authenticated user, ideally from:

```txt
GET /api/v1/users/me
```

Not from duplicated checks or visual components.

## Auth Service

Responsible for:

- registration;
- login;
- refresh token;
- logout;
- password recovery;
- password reset.

### POST /api/v1/auth/register

Registers a new user. The central contract indicates the default role is `STUDENT`.

Recommended frontend path:

```txt
POST /v1/auth/register
```

Request:

```json
{
  "firstName": "Victor",
  "lastName": "Canar",
  "email": "victor@universidad.edu",
  "password": "password123"
}
```

Response `201`:

```json
{
  "id": "user-uuid",
  "email": "victor@universidad.edu",
  "role": "STUDENT",
  "createdAt": "2026-06-14T00:00:00.000Z"
}
```

Expected errors:

- `409`: email already exists.
- `422`: validation error.

### POST /api/v1/auth/login

Starts a session with email and password.

Current frontend path:

```txt
POST /v1/auth/login
```

Request:

```json
{
  "email": "victor@universidad.edu",
  "password": "password123"
}
```

Current response documented in the central contract:

```json
{
  "accessToken": "jwt-access-token",
  "refreshToken": "opaque-refresh-token",
  "expiresIn": 900,
  "tokenType": "Bearer"
}
```

Recommended response for the frontend:

```json
{
  "accessToken": "jwt-access-token",
  "refreshToken": "opaque-refresh-token",
  "expiresIn": 900,
  "tokenType": "Bearer",
  "user": {
    "id": "user-uuid",
    "firstName": "Victor",
    "lastName": "Canar",
    "email": "victor@universidad.edu",
    "role": "STUDENT",
    "isActive": true
  },
  "role": "STUDENT"
}
```

Important note:

```txt
The current login contract does not include user or role in the response.
Therefore, the recommended flow is login -> save tokens -> GET /users/me.
```

Recommended frontend flow:

```txt
POST /v1/auth/login
-> save accessToken and refreshToken
-> GET /v1/users/me
-> auth.store saves user and role
-> RoleRedirect sends the user to the correct dashboard
```

Expected errors:

- `401`: invalid credentials.
- `403`: too many attempts or account blocked, depending on implementation.

### POST /api/v1/auth/refresh

Renews the access token using a refresh token.

Recommended frontend path:

```txt
POST /v1/auth/refresh
```

Request:

```json
{
  "refreshToken": "opaque-refresh-token"
}
```

Response `200`:

```json
{
  "accessToken": "new-jwt-access-token",
  "expiresIn": 900
}
```

Expected errors:

- `401`: invalid or expired refresh token.

### POST /api/v1/auth/logout

Closes the session and invalidates the refresh token.

Recommended frontend path:

```txt
POST /v1/auth/logout
```

Headers:

```txt
Authorization: Bearer <accessToken>
```

Request:

```json
{
  "refreshToken": "opaque-refresh-token"
}
```

Response:

```txt
204 No Content
```

### POST /api/v1/auth/forgot-password

Requests password recovery.

Recommended frontend path:

```txt
POST /v1/auth/forgot-password
```

Request:

```json
{
  "email": "victor@universidad.edu"
}
```

Expected response according to the central contract:

```txt
202 Accepted
```

Current controller status:

```txt
204 No Content
```

Note:

```txt
There is a difference between the central contract and the current controller. The frontend should treat both as success without depending on a response body.
```

### POST /api/v1/auth/reset-password

Resets the password using a token.

Recommended frontend path:

```txt
POST /v1/auth/reset-password
```

Request:

```json
{
  "token": "reset-token",
  "newPassword": "new-password123"
}
```

Response:

```txt
204 No Content
```

Expected errors:

- `400`: invalid or expired token.

## User Service

Responsible for:

- authenticated profile;
- users;
- roles;
- account status.

### GET /api/v1/users/me

Retrieves the authenticated user.

Recommended frontend path:

```txt
GET /v1/users/me
```

Headers:

```txt
Authorization: Bearer <accessToken>
```

Expected response:

```json
{
  "id": "user-uuid",
  "firstName": "Victor",
  "lastName": "Canar",
  "email": "victor@universidad.edu",
  "role": "STUDENT",
  "isActive": true,
  "createdAt": "2026-06-14T00:00:00.000Z"
}
```

Frontend usage:

```txt
Source of truth for user and role.
```

### GET /api/v1/users

Lists users. Must be used by `ADMIN`.

Recommended frontend path:

```txt
GET /v1/users?role=STUDENT&page=1&limit=20
```

Query params:

- `role`: `STUDENT`, `TEACHER`, `ADMIN`.
- `page`: page number.
- `limit`: page size.

Expected response:

```json
{
  "items": [
    {
      "id": "user-uuid",
      "firstName": "Victor",
      "lastName": "Canar",
      "email": "victor@universidad.edu",
      "role": "STUDENT",
      "isActive": true
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 1
}
```

Expected errors:

- `401`: not authenticated.
- `403`: requires `ADMIN` role.

### PATCH /api/v1/users/{id}/role

Updates a user's role. Must be used by `ADMIN`.

Recommended frontend path:

```txt
PATCH /v1/users/:id/role
```

Request:

```json
{
  "role": "TEACHER"
}
```

Response:

```txt
200 OK
```

Expected errors:

- `403`: not authorized.
- `404`: user not found.

### Current State Note

The central contract documents `/api/v1/users/me` and `/api/v1/users/{id}/role`.

The current `user-service` controller exposes base routes such as:

```txt
/users
/users/:id
```

A `setGlobalPrefix("api/v1")` is not observed in `main.ts`. Before fully integrating the frontend, it is advisable to align `user-service` with the central contract or configure Kong to normalize the route.

## Academic Service

Responsible for:

- faculties;
- careers;
- academic periods;
- courses/subjects;
- enrollments;
- evaluations;
- grades;
- data ingestion.

Frontend language rule:

```txt
Backend: subject
Frontend: course
```

Although the backend contract says `subjects`, the frontend should expose `courses`.

### GET /api/v1/faculties

Lists faculties.

Recommended frontend path:

```txt
GET /v1/faculties
```

Expected response:

```json
[
  {
    "id": "faculty-uuid",
    "name": "Engineering and Applied Sciences",
    "code": "FICA"
  }
]
```

### POST /api/v1/faculties

Creates a faculty. Must be used by `ADMIN`.

Request:

```json
{
  "name": "Engineering and Applied Sciences",
  "code": "FICA"
}
```

### GET /api/v1/careers

Lists careers.

Recommended frontend path:

```txt
GET /v1/careers
```

### POST /api/v1/careers

Creates a career. Must be used by `ADMIN`.

Request:

```json
{
  "name": "Information Systems Engineering",
  "code": "ISI",
  "facultyId": "faculty-uuid"
}
```

### GET /api/v1/academic-periods

Lists academic periods.

Recommended frontend path:

```txt
GET /v1/academic-periods
```

### POST /api/v1/academic-periods

Creates an academic period. Must be used by `ADMIN`.

Request:

```json
{
  "name": "2026-A",
  "startDate": "2026-04-01",
  "endDate": "2026-09-30",
  "careerId": "career-uuid",
  "isActive": true
}
```

### GET /api/v1/subjects

Lists subjects/courses.

Recommended frontend path:

```txt
GET /v1/subjects?periodId=period-uuid&teacherId=teacher-uuid
```

Recommended name within the frontend:

```txt
courses.service.ts -> listCourses()
```

Expected response:

```json
[
  {
    "id": "subject-uuid",
    "name": "Web Programming",
    "code": "PW-701",
    "credits": 4,
    "periodId": "period-uuid",
    "teacherId": "teacher-uuid"
  }
]
```

Recommended mapper:

```txt
SubjectDto -> Course
subjectId -> courseId
subject.name -> course.name
```

### POST /api/v1/subjects

Creates a subject/course. Must be used by `ADMIN`.

Request:

```json
{
  "name": "Web Programming",
  "code": "PW-701",
  "credits": 4,
  "periodId": "period-uuid"
}
```

### PUT /api/v1/subjects/{id}/teacher

Assigns a teacher to a subject/course. Must be used by `ADMIN`.

Request:

```json
{
  "teacherId": "teacher-uuid"
}
```

### GET /api/v1/enrollments

Lists enrollments by student or by subject.

Recommended frontend path:

```txt
GET /v1/enrollments?studentId=student-uuid
GET /v1/enrollments?subjectId=subject-uuid
```

Recommended frontend name:

```txt
enrollments.service.ts
```

### POST /api/v1/enrollments

Enrolls a student in a subject/course.

Request:

```json
{
  "studentId": "student-uuid",
  "subjectId": "subject-uuid"
}
```

### GET /api/v1/evaluations

Lists evaluations by subject/course.

Recommended frontend path:

```txt
GET /v1/evaluations?subjectId=subject-uuid
```

### POST /api/v1/evaluations

Creates an evaluation. Must be used by `TEACHER`.

Request:

```json
{
  "name": "Midterm 1",
  "weight": 30,
  "subjectId": "subject-uuid",
  "dueDate": "2026-07-15"
}
```

### POST /api/v1/grades

Records a student's grade.

Request:

```json
{
  "studentId": "student-uuid",
  "evaluationId": "evaluation-uuid",
  "value": 8.5
}
```

### POST /api/v1/ingest

Bulk upload of academic data.

Recommended frontend path:

```txt
POST /v1/ingest
```

Content-Type:

```txt
multipart/form-data
```

Form data:

```txt
file: binary
periodId: period-uuid
format: excel | csv | json
```

Response:

```txt
202 Accepted
```

### Current State Note

The central contract uses:

```txt
/api/v1/subjects
/api/v1/enrollments
/api/v1/evaluations
/api/v1/grades
/api/v1/ingest
```

The current `academic-service` controller uses:

```txt
/api/v1/academic/enrollments
/api/v1/academic/evaluations
/api/v1/academic/grades
/api/v1/academic/import/grades
```

Before connecting real screens, the gateway or the contract should be aligned. For the frontend, the important thing is to hide this difference behind `academic` services and mappers.

## Analytics Service

Responsible for:

- academic risk;
- alerts;
- aggregated dashboards;
- calculated metrics for visualization.

### GET /api/v1/analytics/risk/{studentId}

Retrieves risk classification for a student.

Recommended frontend path:

```txt
GET /v1/analytics/risk/:studentId
```

Expected response:

```json
{
  "studentId": "student-uuid",
  "riskLevel": "HIGH",
  "score": 72.4,
  "factors": ["low_average", "declining_trend"],
  "classifiedAt": "2026-06-14T00:00:00.000Z"
}
```

### GET /api/v1/analytics/alerts

Lists early alerts.

Recommended frontend path:

```txt
GET /v1/analytics/alerts?studentId=student-uuid&subjectId=subject-uuid&level=HIGH&resolved=false
```

Query params:

- `studentId`
- `subjectId`
- `level`: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` according to the final implementation.
- `resolved`: boolean.

Expected response:

```json
{
  "items": [
    {
      "id": "alert-uuid",
      "studentId": "student-uuid",
      "subjectId": "subject-uuid",
      "riskLevel": "HIGH",
      "message": "Student risk level is HIGH",
      "resolved": false,
      "createdAt": "2026-06-14T00:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 1
}
```

### GET /api/v1/analytics/dashboard/student/{studentId}

Retrieves the aggregated payload for the student dashboard.

Recommended frontend path:

```txt
GET /v1/analytics/dashboard/student/:studentId
```

Expected response:

```json
{
  "profile": {},
  "currentMetrics": {},
  "riskLevel": "HIGH",
  "activeAlerts": [],
  "recommendations": []
}
```

### GET /api/v1/analytics/dashboard/teacher/{teacherId}

Retrieves the teacher dashboard.

Recommended frontend path:

```txt
GET /v1/analytics/dashboard/teacher/:teacherId
```

Conceptual response:

```json
{
  "teacherId": "teacher-uuid",
  "courses": [],
  "atRiskStudents": [],
  "alerts": [],
  "periodId": "period-uuid"
}
```

### GET /api/v1/analytics/dashboard/admin

Retrieves the administrative dashboard.

Recommended frontend path:

```txt
GET /v1/analytics/dashboard/admin
```

Conceptual response:

```json
{
  "totalStudents": 0,
  "totalTeachers": 0,
  "totalCourses": 0,
  "riskDistribution": {
    "LOW": 0,
    "MEDIUM": 0,
    "HIGH": 0,
    "CRITICAL": 0
  },
  "totalUnreadAlerts": 0
}
```

### Current State Note

The current `analytics-service` controller also exposes calculation operations:

```txt
POST /api/v1/analytics/average/:studentId/:periodId
POST /api/v1/analytics/trend/:studentId
POST /api/v1/analytics/compliance/:studentId
POST /api/v1/analytics/risk
POST /api/v1/analytics/alerts/:studentId
```

These routes appear to be more internal or calculation-oriented. For frontend dashboards, prefer aggregated `GET /dashboard/...` endpoints when they are available.

## Recommendation Service

Responsible for:

- generating recommendations;
- consulting recommendation history;
- recording teacher observations.

Current state:

```txt
recommendation-service is currently a skeleton and does not have fully functional controllers.
```

The central contract defines the expected routes.

### POST /api/v1/recommendations/generate

Generates a personalized improvement plan.

Recommended frontend path:

```txt
POST /v1/recommendations/generate
```

Request:

```json
{
  "studentId": "student-uuid",
  "context": {
    "riskLevel": "HIGH",
    "weakSubjects": ["Web Programming", "Calculus II"],
    "complianceIndex": 62.5,
    "trend": "DECLINING"
  }
}
```

Response `201`:

```json
{
  "id": "recommendation-uuid",
  "studentId": "student-uuid",
  "plan": "Personalized improvement plan",
  "actions": [
    "Review pending activities",
    "Schedule tutoring with the teacher"
  ],
  "generatedAt": "2026-06-14T00:00:00.000Z"
}
```

### GET /api/v1/recommendations/students/{studentId}

Retrieves the recommendation history of a student.

Recommended frontend path:

```txt
GET /v1/recommendations/students/:studentId
```

Expected response:

```json
[
  {
    "id": "recommendation-uuid",
    "studentId": "student-uuid",
    "riskLevel": "HIGH",
    "plan": "Personalized improvement plan",
    "actions": [],
    "generatedAt": "2026-06-14T00:00:00.000Z"
  }
]
```

### POST /api/v1/observations

Records a teacher observation for a student.

Recommended frontend path:

```txt
POST /v1/observations
```

Request:

```json
{
  "studentId": "student-uuid",
  "subjectId": "subject-uuid",
  "text": "The student requires follow-up on weekly assignments."
}
```

Response:

```txt
201 Created
```

## Recommended Endpoints For apps/web

Example `endpoints.ts`:

```ts
export const ENDPOINTS = {
  AUTH: {
    REGISTER: "/v1/auth/register",
    LOGIN: "/v1/auth/login",
    REFRESH: "/v1/auth/refresh",
    LOGOUT: "/v1/auth/logout",
    FORGOT_PASSWORD: "/v1/auth/forgot-password",
    RESET_PASSWORD: "/v1/auth/reset-password",
  },
  USERS: {
    ME: "/v1/users/me",
    LIST: "/v1/users",
    ROLE: (id: string) => `/v1/users/${id}/role`,
  },
  ACADEMIC: {
    FACULTIES: "/v1/faculties",
    CAREERS: "/v1/careers",
    PERIODS: "/v1/academic-periods",
    SUBJECTS: "/v1/subjects",
    SUBJECT_TEACHER: (id: string) => `/v1/subjects/${id}/teacher`,
    ENROLLMENTS: "/v1/enrollments",
    EVALUATIONS: "/v1/evaluations",
    GRADES: "/v1/grades",
    INGEST: "/v1/ingest",
  },
  ANALYTICS: {
    RISK: (studentId: string) => `/v1/analytics/risk/${studentId}`,
    ALERTS: "/v1/analytics/alerts",
    STUDENT_DASHBOARD: (studentId: string) =>
      `/v1/analytics/dashboard/student/${studentId}`,
    TEACHER_DASHBOARD: (teacherId: string) =>
      `/v1/analytics/dashboard/teacher/${teacherId}`,
    ADMIN_DASHBOARD: "/v1/analytics/dashboard/admin",
  },
  RECOMMENDATIONS: {
    GENERATE: "/v1/recommendations/generate",
    BY_STUDENT: (studentId: string) =>
      `/v1/recommendations/students/${studentId}`,
    OBSERVATIONS: "/v1/observations",
  },
} as const;
```

## Recommended Mappers

The frontend should map backend contracts to product language.

Examples:

```txt
SubjectDto -> Course
subjectId -> courseId
academicPeriod -> period
riskLevel -> risk.level
score -> risk.score
```

This keeps the UI aligned with `business-domain.md`.

## Rules

- Do not use hardcoded endpoints inside components.
- Do not read or write tokens directly from pages.
- Do not use JWT as the source of user data.
- Use `GET /users/me` to obtain `user` and `role`.
- Centralize API routes in `endpoints.ts`.
- Create services by frontend domain, not by screen.
- Map backend `subjects` to frontend `courses`.
- Handle differences between contract and controller through services/gateway, not through the UI.

## Summary

The key contracts for `apps/web` are:

```txt
Auth Service
-> login, register, refresh, logout, password reset

User Service
-> current user, users, roles

Academic Service
-> courses/subjects, enrollments, evaluations, grades, ingestion

Analytics Service
-> risk, alerts, dashboards

Recommendation Service
-> generated plans, recommendation history, observations
```

The frontend should consume them through centralized services and maintain the product language:

```txt
Course in the UI.
Subject only as a backend contract detail.
```
