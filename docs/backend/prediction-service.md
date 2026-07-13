# prediction-service

Owns AI-assisted academic risk predictions and recommendations. It never computes risk itself: it combines the risk already calculated by analytics-service with academic context from academic-service and produces natural-language summaries and recommendations via OpenAI.

The service's own `BOUNDARY.md` states its single responsibility explicitly:

> "Responsabilidad única (SRP): combinar el riesgo académico ya calculado por analytics-service (RF-018, determinístico) con el contexto académico del estudiante (academic-service) y producir, vía OpenAI, un resumen en lenguaje natural + un plan de recomendaciones accionables. prediction-service nunca calcula el riesgo por su cuenta: siempre lo consume de analytics-service. OpenAI solo redacta texto y recomendaciones; no decide niveles de riesgo."

## Tech stack

| Library | Version | Purpose |
|---|---|---|
| NestJS | 10.3.0 | Application framework |
| TypeORM | 0.3.20 | ORM for PostgreSQL |
| pg | — | PostgreSQL driver |
| @nestjs/mongoose | 10.0.4 | MongoDB integration |
| mongoose | — | MongoDB ODM |
| class-validator, class-transformer | — | DTO validation |
| Jest | 29 | Testing |

No Redis dependency. OpenAI integration is done via a custom provider class that calls the REST API directly — there is no official `openai` npm package listed in dependencies. Dockerfile is based on `node:22-alpine` and exposes port 3006. package.json description: "Risk-based predictions with OpenAI-generated recommendations."

## Layer structure

The leanest layer structure of the 5 services:

```
src/
  application/{dtos, ports/{input,output}, use-cases (+ __tests__)}
  domain/{entities, ports}
  infrastructure/{adapters, auth, config, controllers, guards, persistence, utils}
```

No `cache/`, `external/`, or `storage/` folders, unlike the other services. See [../architecture/low-level-architecture.md](../architecture/low-level-architecture.md) for the general hexagonal pattern.

## Domain entities

| Entity | Purpose |
|---|---|
| `PredictionResult` (prediction-result.entity.ts) | The AI-generated global prediction: studentId, periodId, RiskSnapshot (interface), summary, RecommendationItem[] (interface), modelVersion, generatedAt, optional subjectId. |
| `StudentSubjectPredictionEntity` | The rule-based per-subject prediction: studentId, subjectId, periodId, academicWeek/Year, status, predictedRiskLevel, trendSlope, recommendation, computedAt. |

## Use cases

generate-prediction (global AI prediction: risk from analytics-service + OpenAI summary/recommendations), generate-subject-prediction (per-subject AI-grounded recommendation), recalculate-subject-prediction (deterministic per-subject recalculation, triggered internally), get-my-subject-prediction, get-student-subject-prediction, list-subject-predictions (per-subject reads), get-prediction-history (global history), request-student-prediction, request-subject-prediction (on-demand, rate-limited to 1/hour).

9 use cases total.

## HTTP endpoints

Full endpoint reference with roles lives in [../api/api-contracts.md](../api/api-contracts.md) — this section only lists the controller files and route counts.

## External integrations

- **PostgreSQL** — `StudentSubjectPredictionEntity` only.
- **MongoDB** — `prediction-log.schema.ts`, an audit log of AI generations.
- **OpenAI API** — `OpenAiRecommendationProvider` implements `IAiRecommendationProvider` (env `OPENAI_API_KEY`, `OPENAI_MODEL`).
- **AcademicHttpClient** — calls academic-service for syllabus topics used as AI context.
- **AnalyticsHttpClient** — calls analytics-service for the deterministic risk snapshot. Risk is never computed by prediction-service itself, only consumed — this is a core architectural boundary, documented in the service's own `BOUNDARY.md`.

## Environment variables

`ACADEMIC_SERVICE_URL`, `ANALYTICS_SERVICE_URL`, `APP_PORT`, `CORS_ORIGINS`, `JWT_*`, `MONGO_*`, `NODE_ENV`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `POSTGRES_*`, `SWAGGER_SERVER_URL`.

## Known issues / audit findings

- **Orphaned Python stub files**: two files exist under `src/application/ports/` — `i_predict_use_case.py` and `i_prediction_log_repository.py` — left over from an early design iteration. The service's own `BOUNDARY.md` explicitly states: "Stack: NestJS (TypeScript) puro. Sin Python ni runtime ML local." (pure TypeScript NestJS, no Python or local ML runtime). The actual implementation is 100% TypeScript/NestJS as documented above; these two `.py` files reflect no active functionality and should eventually be deleted as cleanup.
- **Incomplete health check**: `GET /health` only reports MongoDB status despite this service also using PostgreSQL — an inconsistency worth fixing, since the other 4 services check connectivity to all of their databases.
