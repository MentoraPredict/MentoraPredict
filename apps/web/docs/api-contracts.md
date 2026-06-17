# MentoraPredict Web - API Contracts

Este documento resume los contratos API que debe consumir `apps/web` desde el frontend.

La fuente principal revisada es:

```txt
contracts/openapi-contracts.yaml
```

Tambien se revisaron los `openapi.yaml` y controladores existentes en:

```txt
services/auth-service
services/user-service
services/academic-service
services/analytics-service
services/recommendation-service
```

## Regla Para El Frontend

El frontend no debe llamar URLs hardcodeadas desde componentes, formularios o paginas.

Las rutas deben centralizarse en:

```txt
src/services/api/endpoints.ts
```

Y consumirse desde servicios:

```txt
src/services/auth/auth.service.ts
src/services/users/users.service.ts
src/services/academic/courses.service.ts
src/services/analytics/risk.service.ts
src/services/recommendations/recommendations.service.ts
```

Estado actual en `apps/web`:

```txt
src/services/api.ts
src/services/auth.service.ts
```

Actualmente `auth.service.ts` consume:

```txt
POST /v1/auth/login
```

El contrato central del monorepo documenta rutas con:

```txt
/api/v1/...
```

Como el frontend usa `VITE_API_BASE_URL` con valor por defecto `/api`, es razonable que desde el cliente se consuma `/v1/...` y el gateway resuelva `/api/v1/...`.

## Base URL

El cliente Axios actual usa:

```ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";
```

Por eso, si `VITE_API_BASE_URL=/api`, una llamada como:

```txt
/v1/auth/login
```

termina apuntando a:

```txt
/api/v1/auth/login
```

Regla recomendada:

```txt
En endpoints.ts usar paths relativos al gateway frontend:
/v1/auth/login
/v1/users/me
/v1/analytics/dashboard/student/:studentId
```

Y documentar el contrato backend completo como:

```txt
/api/v1/auth/login
/api/v1/users/me
/api/v1/analytics/dashboard/student/:studentId
```

## Headers

Las rutas privadas deben enviar:

```txt
Authorization: Bearer <accessToken>
Content-Type: application/json
```

Para carga de archivos:

```txt
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

El interceptor actual de Axios ya adjunta el token desde `localStorage`:

```ts
config.headers.Authorization = `Bearer ${token}`;
```

Cuando exista `auth.store.ts`, el token debe seguir siendo gestionado de forma centralizada, no desde componentes.

## Roles

Roles esperados:

```txt
STUDENT
TEACHER
ADMIN
```

El rol debe venir del usuario autenticado, idealmente desde:

```txt
GET /api/v1/users/me
```

No desde checks duplicados ni desde componentes visuales.

## Auth Service

Responsable de:

- registro;
- login;
- refresh token;
- logout;
- recuperacion de contrasena;
- reset de contrasena.

### POST /api/v1/auth/register

Registra un usuario nuevo. El contrato central indica rol por defecto `STUDENT`.

Frontend path recomendado:

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

Errores esperados:

- `409`: email ya existe.
- `422`: error de validacion.

### POST /api/v1/auth/login

Inicia sesion con email y contrasena.

Frontend path actual:

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

Response actual documentada en contrato central:

```json
{
  "accessToken": "jwt-access-token",
  "refreshToken": "opaque-refresh-token",
  "expiresIn": 900,
  "tokenType": "Bearer"
}
```

Response recomendada para el frontend:

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

Nota importante:

```txt
El contrato actual de login no incluye user ni role en la respuesta.
Por eso el flujo recomendado es login -> guardar tokens -> GET /users/me.
```

Flujo frontend recomendado:

```txt
POST /v1/auth/login
-> guardar accessToken y refreshToken
-> GET /v1/users/me
-> auth.store guarda user y role
-> RoleRedirect envia al dashboard correcto
```

Errores esperados:

- `401`: credenciales invalidas.
- `403`: demasiados intentos o cuenta bloqueada, segun implementacion.

### POST /api/v1/auth/refresh

Renueva el access token usando refresh token.

Frontend path recomendado:

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

Errores esperados:

- `401`: refresh token invalido o expirado.

### POST /api/v1/auth/logout

Cierra sesion e invalida el refresh token.

Frontend path recomendado:

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

Solicita recuperacion de contrasena.

Frontend path recomendado:

```txt
POST /v1/auth/forgot-password
```

Request:

```json
{
  "email": "victor@universidad.edu"
}
```

Response esperada segun contrato central:

```txt
202 Accepted
```

Estado del controlador actual:

```txt
204 No Content
```

Nota:

```txt
Hay diferencia entre contrato central y controlador actual. El frontend debe tratar ambos como exito sin depender de body.
```

### POST /api/v1/auth/reset-password

Restablece contrasena con token.

Frontend path recomendado:

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

Errores esperados:

- `400`: token invalido o expirado.

## User Service

Responsable de:

- perfil autenticado;
- usuarios;
- roles;
- estado de cuenta.

### GET /api/v1/users/me

Obtiene el usuario autenticado.

Frontend path recomendado:

```txt
GET /v1/users/me
```

Headers:

```txt
Authorization: Bearer <accessToken>
```

Response esperada:

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

Uso en frontend:

```txt
Fuente de verdad para user y role.
```

### GET /api/v1/users

Lista usuarios. Debe ser usado por `ADMIN`.

Frontend path recomendado:

```txt
GET /v1/users?role=STUDENT&page=1&limit=20
```

Query params:

- `role`: `STUDENT`, `TEACHER`, `ADMIN`.
- `page`: pagina.
- `limit`: limite por pagina.

Response esperada:

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

Errores esperados:

- `401`: no autenticado.
- `403`: requiere rol `ADMIN`.

### PATCH /api/v1/users/{id}/role

Actualiza el rol de un usuario. Debe ser usado por `ADMIN`.

Frontend path recomendado:

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

Errores esperados:

- `403`: no autorizado.
- `404`: usuario no encontrado.

### Nota De Estado Actual

El contrato central documenta `/api/v1/users/me` y `/api/v1/users/{id}/role`.

El controlador actual de `user-service` expone rutas base como:

```txt
/users
/users/:id
```

No se observa un `setGlobalPrefix("api/v1")` en `main.ts`. Antes de integrar completamente el frontend, conviene alinear user-service con el contrato central o configurar Kong para normalizar la ruta.

## Academic Service

Responsable de:

- facultades;
- carreras;
- periodos academicos;
- cursos/materias;
- matriculas;
- evaluaciones;
- calificaciones;
- carga de datos.

Regla de lenguaje frontend:

```txt
Backend: subject
Frontend: course
```

Aunque el contrato backend diga `subjects`, el frontend debe exponer `courses`.

### GET /api/v1/faculties

Lista facultades.

Frontend path recomendado:

```txt
GET /v1/faculties
```

Response esperada:

```json
[
  {
    "id": "faculty-uuid",
    "name": "Ingenieria y Ciencias Aplicadas",
    "code": "FICA"
  }
]
```

### POST /api/v1/faculties

Crea facultad. Debe ser usado por `ADMIN`.

Request:

```json
{
  "name": "Ingenieria y Ciencias Aplicadas",
  "code": "FICA"
}
```

### GET /api/v1/careers

Lista carreras.

Frontend path recomendado:

```txt
GET /v1/careers
```

### POST /api/v1/careers

Crea carrera. Debe ser usado por `ADMIN`.

Request:

```json
{
  "name": "Ingenieria en Sistemas de Informacion",
  "code": "ISI",
  "facultyId": "faculty-uuid"
}
```

### GET /api/v1/academic-periods

Lista periodos academicos.

Frontend path recomendado:

```txt
GET /v1/academic-periods
```

### POST /api/v1/academic-periods

Crea periodo academico. Debe ser usado por `ADMIN`.

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

Lista materias/cursos.

Frontend path recomendado:

```txt
GET /v1/subjects?periodId=period-uuid&teacherId=teacher-uuid
```

Nombre recomendado dentro del frontend:

```txt
courses.service.ts -> listCourses()
```

Response esperada:

```json
[
  {
    "id": "subject-uuid",
    "name": "Programacion Web",
    "code": "PW-701",
    "credits": 4,
    "periodId": "period-uuid",
    "teacherId": "teacher-uuid"
  }
]
```

Mapper recomendado:

```txt
SubjectDto -> Course
subjectId -> courseId
subject.name -> course.name
```

### POST /api/v1/subjects

Crea materia/curso. Debe ser usado por `ADMIN`.

Request:

```json
{
  "name": "Programacion Web",
  "code": "PW-701",
  "credits": 4,
  "periodId": "period-uuid"
}
```

### PUT /api/v1/subjects/{id}/teacher

Asigna docente a una materia/curso. Debe ser usado por `ADMIN`.

Request:

```json
{
  "teacherId": "teacher-uuid"
}
```

### GET /api/v1/enrollments

Lista matriculas por estudiante o por materia.

Frontend path recomendado:

```txt
GET /v1/enrollments?studentId=student-uuid
GET /v1/enrollments?subjectId=subject-uuid
```

Nombre frontend recomendado:

```txt
enrollments.service.ts
```

### POST /api/v1/enrollments

Matricula estudiante en materia/curso.

Request:

```json
{
  "studentId": "student-uuid",
  "subjectId": "subject-uuid"
}
```

### GET /api/v1/evaluations

Lista evaluaciones por materia/curso.

Frontend path recomendado:

```txt
GET /v1/evaluations?subjectId=subject-uuid
```

### POST /api/v1/evaluations

Crea evaluacion. Debe ser usado por `TEACHER`.

Request:

```json
{
  "name": "Parcial 1",
  "weight": 30,
  "subjectId": "subject-uuid",
  "dueDate": "2026-07-15"
}
```

### POST /api/v1/grades

Registra calificacion de estudiante.

Request:

```json
{
  "studentId": "student-uuid",
  "evaluationId": "evaluation-uuid",
  "value": 8.5
}
```

### POST /api/v1/ingest

Carga masiva de datos academicos.

Frontend path recomendado:

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

### Nota De Estado Actual

El contrato central usa:

```txt
/api/v1/subjects
/api/v1/enrollments
/api/v1/evaluations
/api/v1/grades
/api/v1/ingest
```

El controlador actual de `academic-service` usa:

```txt
/api/v1/academic/enrollments
/api/v1/academic/evaluations
/api/v1/academic/grades
/api/v1/academic/import/grades
```

Antes de conectar pantallas reales, se debe alinear el gateway o el contrato. Para el frontend, lo importante es ocultar esta diferencia detras de `academic` services y mappers.

## Analytics Service

Responsable de:

- riesgo academico;
- alertas;
- dashboards agregados;
- metricas calculadas para visualizacion.

### GET /api/v1/analytics/risk/{studentId}

Obtiene clasificacion de riesgo para estudiante.

Frontend path recomendado:

```txt
GET /v1/analytics/risk/:studentId
```

Response esperada:

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

Lista alertas tempranas.

Frontend path recomendado:

```txt
GET /v1/analytics/alerts?studentId=student-uuid&subjectId=subject-uuid&level=HIGH&resolved=false
```

Query params:

- `studentId`
- `subjectId`
- `level`: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` segun implementacion final.
- `resolved`: boolean.

Response esperada:

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

Obtiene payload agregado del dashboard del estudiante.

Frontend path recomendado:

```txt
GET /v1/analytics/dashboard/student/:studentId
```

Response esperada:

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

Obtiene dashboard del docente.

Frontend path recomendado:

```txt
GET /v1/analytics/dashboard/teacher/:teacherId
```

Response conceptual:

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

Obtiene dashboard administrativo.

Frontend path recomendado:

```txt
GET /v1/analytics/dashboard/admin
```

Response conceptual:

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

### Nota De Estado Actual

El controlador actual de `analytics-service` tambien expone operaciones de calculo:

```txt
POST /api/v1/analytics/average/:studentId/:periodId
POST /api/v1/analytics/trend/:studentId
POST /api/v1/analytics/compliance/:studentId
POST /api/v1/analytics/risk
POST /api/v1/analytics/alerts/:studentId
```

Estas rutas parecen mas internas o de calculo. Para dashboards frontend, preferir endpoints agregados `GET /dashboard/...` cuando esten disponibles.

## Recommendation Service

Responsable de:

- generar recomendaciones;
- consultar historial de recomendaciones;
- registrar observaciones docentes.

Estado actual:

```txt
recommendation-service esta como skeleton y no tiene controladores funcionales completos.
```

El contrato central define las rutas esperadas.

### POST /api/v1/recommendations/generate

Genera plan personalizado de mejora.

Frontend path recomendado:

```txt
POST /v1/recommendations/generate
```

Request:

```json
{
  "studentId": "student-uuid",
  "context": {
    "riskLevel": "HIGH",
    "weakSubjects": ["Programacion Web", "Calculo II"],
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
  "plan": "Plan de mejora personalizado",
  "actions": [
    "Revisar actividades pendientes",
    "Agendar tutoria con el docente"
  ],
  "generatedAt": "2026-06-14T00:00:00.000Z"
}
```

### GET /api/v1/recommendations/students/{studentId}

Obtiene historial de recomendaciones de un estudiante.

Frontend path recomendado:

```txt
GET /v1/recommendations/students/:studentId
```

Response esperada:

```json
[
  {
    "id": "recommendation-uuid",
    "studentId": "student-uuid",
    "riskLevel": "HIGH",
    "plan": "Plan de mejora personalizado",
    "actions": [],
    "generatedAt": "2026-06-14T00:00:00.000Z"
  }
]
```

### POST /api/v1/observations

Registra observacion de docente para un estudiante.

Frontend path recomendado:

```txt
POST /v1/observations
```

Request:

```json
{
  "studentId": "student-uuid",
  "subjectId": "subject-uuid",
  "text": "El estudiante requiere seguimiento en entregas semanales."
}
```

Response:

```txt
201 Created
```

## Endpoints Recomendados Para apps/web

Ejemplo de `endpoints.ts`:

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

## Mappers Recomendados

El frontend debe mapear contratos backend a lenguaje del producto.

Ejemplos:

```txt
SubjectDto -> Course
subjectId -> courseId
academicPeriod -> period
riskLevel -> risk.level
score -> risk.score
```

Esto mantiene la UI alineada con `business-domain.md`.

## Reglas

- No usar endpoints hardcodeados dentro de componentes.
- No leer ni escribir tokens directamente desde pages.
- No usar JWT como fuente de datos del usuario.
- Usar `GET /users/me` para obtener `user` y `role`.
- Centralizar rutas API en `endpoints.ts`.
- Crear servicios por dominio frontend, no por pantalla.
- Mapear `subjects` del backend a `courses` en frontend.
- Tratar diferencias entre contrato y controlador desde services/gateway, no desde UI.

## Resumen

Los contratos clave para `apps/web` son:

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

El frontend debe consumirlos mediante servicios centralizados y mantener el lenguaje de producto:

```txt
Course en UI.
Subject solo como detalle de contrato backend.
```
