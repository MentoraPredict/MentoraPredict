# High-Level Architecture

> System context, request flow, and the technology choices behind them. For per-service internals, see [low-level-architecture.md](./low-level-architecture.md) and [../backend/](../backend/). For deployment topology, see [../infrastructure/](../infrastructure/) and [../deployment/](../deployment/).

## 1. System context

```
                              ┌──────────────┐
                              │  Cloudflare  │  (TLS termination, DDoS/edge cache,
                              │  (QA / prod) │   CF-Connecting-IP header)
                              └──────┬───────┘
                                     │
                              ┌──────▼───────┐
                              │    nginx     │  (per-app container: web, landing)
                              │ SPA fallback │  real-client-IP mapping, static caching,
                              │ /api reverse │  nginx-level rate limit (30 r/s/IP)
                              │    proxy     │
                              └──────┬───────┘
                                     │ /api/*
                              ┌──────▼───────┐
                              │  Kong 3.6    │  JWT verification, CORS, per-consumer
                              │ (gateway)    │  rate limiting, correlation-id injection
                              └──────┬───────┘
              ┌──────────┬──────────┼──────────┬──────────┐
              ▼          ▼          ▼          ▼          ▼
        auth-service user-service academic- analytics- prediction-
          :3001        :3002    service:3003 service:3004 service:3006
              │          │          │          │          │
              └──────────┴────┬─────┴────┬─────┴──────────┘
                               ▼          ▼
                         PostgreSQL   MongoDB Atlas   Redis
                        (mentorapredict) (mentorapredict_nosql)
```

Client applications — the React web app, the Astro landing page, the Expo mobile app, and the Electron desktop app — all talk to the **same** public API surface behind Kong. There is no client-specific backend; the desktop and mobile apps hit the exact same REST endpoints as the web app (desktop via a custom `mentorapredict://` protocol wrapping the same web bundle, mobile via its own thin service layer calling the identical routes).

## 2. Why this shape

- **Microservices over a monolith**: each of the 5 backend services owns one bounded context (see [business-logic.md](../business/business-logic.md) §1) with its own controllers/use-cases/persistence, deployed and scaled independently. They share a Postgres *instance* (not schema-per-service — see [../database/database-architecture.md](../database/database-architecture.md) for the gap this creates) but each owns a disjoint set of tables.
- **Kong as the single entry point**: centralizes JWT verification, CORS, and rate limiting so individual services don't reimplement them — each service still re-validates roles (`RolesGuard`) since Kong only proves *authentication*, not *authorization*.
- **Synchronous HTTP for service-to-service calls, no message broker**: every cross-service call (e.g. academic-service → analytics-service after a grade change) is a direct authenticated HTTP request (`scope: service:internal` JWT), not an event published to a queue. This is simple and traceable (single correlation ID threads the whole call chain) but means a downstream service outage can propagate as a synchronous failure — there's no buffering/retry-queue layer. Acceptable at current scale; worth revisiting if inter-service call volume grows.
- **WebSocket only for one thing**: Socket.IO exists solely to push `notification:new` events to already-authenticated browser/desktop sessions in real time. It is not used for any other realtime feature, and mobile bypasses it entirely in favor of Expo push notifications.
- **Postgres for records, MongoDB for logs/free-form data, Redis for ephemeral state**: relational academic data (grades, enrollments, evaluations) lives in Postgres because it's inherently structured and relationally constrained; MongoDB holds append-mostly, schema-loose data (teacher observations, AI prediction audit logs, dataset versioning); Redis holds short-lived state (refresh tokens, login throttling counters, a narrow metrics cache) that's fine to lose on restart.

## 3. Request flow (typical authenticated GET)

1. Client sends `GET https://mentorapredict{qa|prod}.programacionwebuce.net/api/v1/analytics/students/me/subjects/overview` with `Authorization: Bearer <JWT>`.
2. Cloudflare terminates TLS, forwards to the EC2 origin with `CF-Connecting-IP` set to the real visitor IP.
3. nginx (the `web` container) matches `location /api/`, sets `X-Real-IP` from `$real_client_ip` (derived from `CF-Connecting-IP`, falling back to `$remote_addr`), applies its own 30 req/s-per-IP limit, and reverse-proxies to `http://kong:8000`.
4. Kong matches the `analytics-routes` route, runs the `jwt` plugin (verifies the RS256 signature against the shared public key), runs `rate-limiting` (300 req/min, keyed by the JWT's consumer — not IP), injects/forwards `X-Correlation-ID`, and proxies to `http://analytics-service:3004`.
5. analytics-service's `JwtAuthGuard` re-validates the token, `RolesGuard` checks the `@Roles('STUDENT')` decorator against the JWT's role claim, and the request reaches `GetStudentSubjectsOverviewUseCase`.
6. The use case queries Postgres (via its repository ports) and returns a JSON response, which flows back through Kong → nginx → Cloudflare → client, each hop preserving the same `X-Correlation-ID` for tracing (see structured-logging notes in [../backend/README.md](../backend/README.md)).

## 4. Environments and where they live

| Environment | Domain | Deployed by | Branch |
|---|---|---|---|
| dev (local) | `localhost` | `docker-compose.dev.yml`, built from source | `dev` |
| QA | `mentorapredictqa.programacionwebuce.net` | `.github/workflows/cd-qa.yml` | `QA` |
| prod | `mentorapredictprod.programacionwebuce.net` | `.github/workflows/cd-main.yml` | `main` / `v*` tags |

Full detail: [../deployment/environments.md](../deployment/environments.md).

## 5. Known architectural gaps (audit findings)

- **No schema-per-service in Postgres**: all 5 services connect to the same `mentorapredict` database and default `public` schema — logical separation only, not enforced at the DB level. `docs/adr/0001-database-strategy.md` originally recommended schema-per-service; this was never implemented.
- **No migration system**: schema is created via TypeORM `synchronize`, disabled in production with nothing replacing it — see [../database/database-architecture.md](../database/database-architecture.md).
- **Monitoring stack incomplete**: Grafana + cAdvisor + Node Exporter are deployed, but Grafana has **zero datasources configured** and there is no Prometheus (or equivalent) scraping/storing the exporters' metrics — the provisioned dashboards currently have no data source. See [../infrastructure/monitoring.md](../infrastructure/monitoring.md).
- **`packages/shared-types` / `shared-utils` / `shared-config` are scaffolded but unused** — every service currently hand-rolls its own types/pagination/config instead of consuming these packages, and where they diverge (e.g. `RiskLevel`), the shared package is the stale one. See [../backend/shared-packages.md](../backend/shared-packages.md).
