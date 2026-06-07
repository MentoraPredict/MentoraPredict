# prediction-service — Service Boundary

Responsabilidad única (SRP):
- Ejecutar modelos de predicción y exponer endpoints para solicitud de predicciones, listado de modelos y feedback de etiquetas.

Inputs:
- Requests de predicción desde `metrics-service` o `recommendation-service`.
- Datos históricos y features desde `prediction-service` ingestion pipelines (fuera de fase 0).

Outputs:
- Predicciones por estudiante/asignatura.
- Guardado de requests y resultados en MongoDB (`prediction_requests`).
- Publicación opcional de eventos a `analytics-service`.

Datos que gestiona (ownership):
- Colecciones en MongoDB: `prediction_requests`, `student_profiles`, `model_metadata`.

Dependencias:
- `user-service` (para validate student existence) y `academic-service` (metadata asignaturas).

API surface (resumen):
- `POST /api/v1/prediction/predict`
- `GET /api/v1/prediction/models`
- `POST /api/v1/prediction/feedback`

Persistencia recomendada:
- MongoDB para resultados y metadatos de modelos; S3/Blob para artefactos de modelos si aplica.
