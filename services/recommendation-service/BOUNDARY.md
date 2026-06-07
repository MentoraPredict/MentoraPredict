# recommendation-service — Service Boundary

Responsabilidad única (SRP):
- Generar y exponer recomendaciones personalizadas para estudiantes y grupos en base a predicciones y reglas de negocio.

Inputs:
- Requests desde API Gateway para obtener recomendaciones.
- Datos y predicciones desde `prediction-service`.

Outputs:
- Recomendaciones por estudiante y por asignatura.
- Logs de recomendaciones en MongoDB para trazabilidad.

Datos que gestiona (ownership):
- `recommendations` (Postgres or Mongo según diseño; inicialmente Postgres JSONB).

Dependencias:
- `prediction-service`, `user-service`, `academic-service`.

API surface (resumen):
- `GET /api/v1/recommendation/student/{studentId}`
- `GET /api/v1/recommendation/subjects`
- `POST /api/v1/recommendation/refresh`

Persistencia recomendada:
- Postgres `recommendations` con `payload` JSONB, indexado por `student_id`.
