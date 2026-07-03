# academic-service — Service Boundary

Responsabilidad única (SRP):
- Exponer y gestionar datos académicos canónicos: facultades, carreras, asignaturas, periodos académicos, inscripciones y evaluaciones.

Inputs:
- Consultas y comandos desde API Gateway (lectura y escritura de datos académicos).
- Eventos de `user-service` y `analytics-service` (opcional) para mantener caches o materializados.

Outputs:
- DTOs y colecciones de datos académicos para otros servicios.
- Eventos de `enrollment_created`, `evaluation_created` hacia `analytics-service`.

Datos que gestiona (ownership):
- `faculties`, `careers`, `subjects`, `academic_periods`, `enrollments`, `evaluations`, `grades`, `observations`.

Dependencias:
- `user-service` para validar `studentId` y `teacherId` (solo lectura).
- `analytics-service` para exportar eventos/aggregados.

API surface (resumen):
- `GET /api/v1/academic/faculties`
- `GET /api/v1/academic/careers`
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
