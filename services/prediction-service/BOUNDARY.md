# prediction-service - Service Boundary

Responsabilidad unica (SRP):
- Combinar el riesgo academico ya calculado por `analytics-service` (RF-018, deterministico)
  con el contexto academico del estudiante (`academic-service`) y producir, via OpenAI,
  un resumen en lenguaje natural + un plan de recomendaciones accionables.
- prediction-service nunca calcula el riesgo por su cuenta: siempre lo consume de
  analytics-service. OpenAI solo redacta texto y recomendaciones; no decide niveles de riesgo.

Inputs:
- `GET /api/v1/prediction/students/:studentId/periods/:periodId` (JWT de usuario, via Kong).
- Internamente: `analytics-service` (`/internal/risk-snapshot`) y `academic-service`
  (`/internal/students/:id/grades`) via tokens de servicio firmados con `InternalJwtService`.

Outputs:
- `PredictionResult` JSON: `{ studentId, periodId, risk, summary, recommendations[], modelVersion, generatedAt }`.
- Persistencia de cada prediccion en MongoDB (`prediction_logs`) para trazabilidad/auditoria.

Datos que gestiona (ownership):
- Coleccion MongoDB: `prediction_logs`.
- Plan de recomendaciones generado dentro de cada resultado de prediccion.

Dependencias:
- `analytics-service` (riesgo deterministico).
- `academic-service` (notas/materias del periodo).
- OpenAI API (`OPENAI_API_KEY`) solo para redactar `summary` + `recommendations`.

API surface (resumen):
- `GET /api/v1/prediction/students/:studentId/periods/:periodId` - genera prediccion + recomendaciones.
- `GET /api/v1/prediction/students/:studentId/history?limit=N` - historial de predicciones.

Persistencia:
- MongoDB (`prediction_logs`), sin Postgres ni Redis. El servicio es stateless respecto
  a calculos y solo registra resultados.

Stack:
- NestJS (TypeScript) puro. Sin Python ni runtime ML local. El riesgo proviene de la
  formula deterministica existente en analytics-service; lo generativo es el texto y
  el plan de recomendaciones delegado a OpenAI.
