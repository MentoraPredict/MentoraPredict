# prediction-service — Service Boundary

> **Nota de fusión:** este servicio absorbe lo que originalmente eran `prediction-service`
> y `recommendation-service` (ambos eran skeletons sin lógica implementada). Se unificaron
> porque ambos dependían de los mismos datos (riesgo + contexto académico del estudiante)
> y porque ya no se generan predicciones/análisis locales con modelos propios: las
> recomendaciones se generan vía la API de OpenAI. Esto elimina la necesidad de un runtime
> Python/ML separado.

Responsabilidad única (SRP):
- Combinar el riesgo académico ya calculado por `analytics-service` (RF-018, determinístico)
  con el contexto académico del estudiante (`academic-service`) y producir, vía OpenAI,
  un resumen en lenguaje natural + un plan de recomendaciones accionables.
- prediction-service NUNCA calcula el riesgo por su cuenta — siempre lo consume de
  analytics-service. OpenAI solo redacta texto, no decide niveles de riesgo.

Inputs:
- `GET /api/v1/prediction/students/:studentId/periods/:periodId` (JWT de usuario, vía Kong).
- Internamente: `analytics-service` (`/internal/risk-snapshot`) y `academic-service`
  (`/internal/students/:id/grades`) vía tokens de servicio firmados con `InternalJwtService`.

Outputs:
- `PredictionResult` JSON: `{ studentId, periodId, risk, summary, recommendations[], modelVersion, generatedAt }`.
- Persistencia de cada predicción en MongoDB (`prediction_logs`) para trazabilidad/auditoría.

Datos que gestiona (ownership):
- Colección MongoDB: `prediction_logs`.

Dependencias:
- `analytics-service` (riesgo determinístico).
- `academic-service` (notas/materias del período).
- OpenAI API (`OPENAI_API_KEY`) — solo para redactar `summary` + `recommendations`.

API surface (resumen):
- `GET /api/v1/prediction/students/:studentId/periods/:periodId` — genera predicción + recomendaciones.
- `GET /api/v1/prediction/students/:studentId/history?limit=N` — historial de predicciones.

Persistencia:
- MongoDB (`prediction_logs`), sin Postgres ni Redis — el servicio es stateless respecto
  a cálculos, solo registra resultados.

Stack:
- NestJS (TypeScript) puro. Sin Python, sin runtime ML local — toda la "predicción" de
  riesgo es la fórmula determinística ya existente en analytics-service; lo único generativo
  es el texto de recomendaciones, delegado a OpenAI.
