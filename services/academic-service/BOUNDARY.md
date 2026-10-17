# academic-service — Service Boundary

Responsabilidad única (SRP):

- Exponer y gestionar datos académicos canónicos: años lectivos y periodos de calificación, grados y paralelos, asignaturas, matrículas, evaluaciones, calificaciones, promoción y asistencia.

Inputs:

- Consultas y comandos desde API Gateway (lectura y escritura de datos académicos).
- Eventos de `user-service` y `analytics-service` (opcional) para mantener caches o materializados.

Outputs:

- DTOs y colecciones de datos académicos para otros servicios.
- Eventos de `enrollment_created`, `evaluation_created` hacia `analytics-service`.

Datos que gestiona (ownership):

- `school_years`, `academic_periods`, `grade_levels`, `sections`, `subject_catalog`, `subjects`, `student_enrollments`, `enrollments`, `evaluations`, `grades`, `period_results`, `promotion_decisions`, `class_sessions`, `session_attendances`, `absence_justifications`, `observations`.

Dependencias:

- `user-service` para validar `studentId` y `teacherId` (solo lectura).
- `analytics-service` para exportar eventos/aggregados.

API surface (resumen):

- `GET /api/v1/academic/school-years`
- `GET /api/v1/academic/sections`
- `GET /api/v1/academic/subjects`
- `GET /api/v1/academic/academic-periods`
- `POST /api/v1/academic/enrollments`
- `GET /api/v1/academic/enrollments`
- `POST /api/v1/academic/evaluations`
- `GET /api/v1/academic/evaluations`

Persistencia recomendada:

- PostgreSQL (schema `academic_service`).

Reglas operativas:

- Validar headers `x-correlation-id` y `x-request-id`.
- Emitir eventos para integraciones asincrónicas cuando aplique.
