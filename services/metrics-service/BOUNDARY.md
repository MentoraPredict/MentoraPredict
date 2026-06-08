# metrics-service — Service Boundary

Responsabilidad única (SRP):
- Calcular y exponer métricas agregadas y puntos de datos para dashboards, por usuario, asignatura y periodos.

Inputs:
- Consultas desde API Gateway para dashboards.
- Eventos y datos desde `academic-service`, `analytics-service` y `prediction-service` (consumo para agregaciones).

Outputs:
- Endpoints de métricas agregadas y series temporales.
- Publicación opcional de métricas agregadas a `analytics-service`.

Datos que gestiona (ownership):
- No posee datos canónicos, mantiene vistas/materializaciones y caches en Redis/Postgres según necesidad.

Dependencias:
- `academic-service`, `user-service`, `prediction-service`.

API surface (resumen):
- `GET /api/v1/metrics/overview`
- `GET /api/v1/metrics/users/{userId}`
- `GET /api/v1/metrics/subjects/{subjectId}`

Persistencia recomendada:
- Postgres for historical aggregates; Redis for fast caches and dashboards.
