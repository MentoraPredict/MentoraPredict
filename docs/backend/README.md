# Backend

MentoraPredict's backend is composed of 5 NestJS microservices, each built with hexagonal architecture, running behind a Kong API gateway. There is no message broker anywhere in the system — all inter-service communication is synchronous HTTP, authenticated with an internal JWT carrying `scope: "service:internal"`. The only exception is a single WebSocket (Socket.IO) channel from analytics-service that pushes real-time notifications to browser/desktop clients.

## Services

| Service | Port | Primary DB | Also uses | Use case count | Doc |
|---|---|---|---|---|---|
| auth-service | 3001 | Postgres (users) | Redis | 12 | [auth-service.md](./auth-service.md) |
| user-service | 3002 | Postgres (user_profiles) | Supabase Storage | 7 | [user-service.md](./user-service.md) |
| academic-service | 3003 | Postgres (12 entities) | MongoDB, Redis (dormant), Supabase | 69 | [academic-service.md](./academic-service.md) |
| analytics-service | 3004 | Postgres (5 entities) | MongoDB, Redis, WebSocket | 21 + 6 (notifications submodule) | [analytics-service.md](./analytics-service.md) |
| prediction-service | 3006 | Postgres (1 entity) | MongoDB, OpenAI API | 9 | [prediction-service.md](./prediction-service.md) |

## Shared conventions across all 5 services

- **Hexagonal layering** — `application` / `domain` / `infrastructure` per service, ports and adapters. See [../architecture/low-level-architecture.md](../architecture/low-level-architecture.md) for the pattern explanation; individual service docs only note deviations from it.
- **Auth** — JWT RS256 verified at the Kong gateway, plus a per-service `RolesGuard` for endpoint-level authorization.
- **Internal endpoints** — service-to-service routes live under `/internal` and are protected by an `InternalServiceGuard` that requires a JWT with `scope: "service:internal"`.
- **Logging** — structured JSON logging via `@mentorapredict/shared-logger`, the only shared package with real consumers across the monorepo. See [./shared-packages.md](./shared-packages.md).
- **API docs** — every service self-documents with Swagger at `/api/v1/<domain>/docs`.
- **Health** — every service exposes `GET /health`.

## Cross-service HTTP call graph

All internal calls authenticate via a JWT bearer token with `scope: "service:internal"`, verified by each service's `InternalServiceGuard`, and are additionally IP-restricted at Kong so they are only reachable from inside the Docker network. No message broker exists (no Kafka/RabbitMQ) — every inter-service link below is synchronous HTTP.

| Caller | Client class | Target | Target env var |
|---|---|---|---|
| auth-service | `UserProfileHttpClient` | user-service | `USER_SERVICE_URL` |
| user-service | `AuthHttpClient`, `AuthSyncClient` | auth-service | `AUTH_SERVICE_URL` |
| user-service | `AcademicStatusHttpClient` | academic-service | `ACADEMIC_SERVICE_URL` |
| user-service | `NotificationHttpClient` | analytics-service (notifications submodule) | `ANALYTICS_SERVICE_URL` |
| academic-service | `AnalyticsHttpClient`, `NotificationHttpClient` | analytics-service | `ANALYTICS_SERVICE_URL` |
| academic-service | `UserProfileAdapter`, `UserRoleHttpAdapter` | user-service | `USER_SERVICE_URL` |
| analytics-service | `AcademicHttpClient` | academic-service | `ACADEMIC_SERVICE_URL` |
| analytics-service | `PredictionHttpClient` | prediction-service | `PREDICTION_SERVICE_URL` |
| prediction-service | `AcademicHttpClient` | academic-service | `ACADEMIC_SERVICE_URL` |
| prediction-service | `AnalyticsHttpClient` | analytics-service | `ANALYTICS_SERVICE_URL` |
| prediction-service | `OpenAiRecommendationProvider` | OpenAI API (external) | `OPENAI_API_KEY` |

The one non-HTTP channel is the analytics-service Socket.IO gateway, which pushes notification events to connected clients — it is a delivery channel only, not a source of truth (Postgres remains authoritative).

## Further reading

- [./shared-packages.md](./shared-packages.md) — state of `packages/*` and which ones are actually consumed.
- [../api/api-contracts.md](../api/api-contracts.md) — full endpoint reference across all services, with roles.
- [../database/database-architecture.md](../database/database-architecture.md) — schemas, entities, and cross-database layout.
