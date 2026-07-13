# analytics-service

Owns academic risk analytics — computing per-student, per-subject metrics (averages, compliance, attendance, trend, risk level), raising and resolving alerts, and serving dashboards to admins, teachers, and students. It also hosts a fully independent notifications sub-module responsible for creating, storing, and pushing notifications (including real-time delivery over WebSocket and Expo push). It is arguably the most architecturally complex service in the monorepo, combining dual hexagonal modules, a WebAssembly-backed calculation, and a real-time channel.

## Tech stack

| Library | Version | Purpose |
|---|---|---|
| NestJS | 10.3.0 | Application framework |
| TypeORM | 0.3.20 | ORM for PostgreSQL |
| pg | — | PostgreSQL driver |
| @nestjs/mongoose | 10.0.4 | MongoDB integration |
| mongoose | — | MongoDB ODM |
| ioredis | — | Redis client — real, wired caching (see External integrations) |
| @nestjs/websockets, @nestjs/platform-socket.io, socket.io | 4.8.1 | Real-time notification delivery |
| class-validator, class-transformer | — | DTO validation |
| Jest | 29 | Testing |

Dockerfile is based on `node:22-alpine` and exposes port 3004.

Notable: `infrastructure/wasm/linear-regression.wasm.ts` is a WebAssembly-backed linear regression module used for trend slope calculation. It has its own `.spec.ts` test file and falls back to an equivalent pure-JS formula if WASM is unavailable at runtime.

## Layer structure

Two independent hexagonal modules live in this one service:

```
src/
  application/{dtos, ports/{input,output}, use-cases (+ __tests__)}
  domain/{entities, ports}
  infrastructure/{adapters, auth, cache, config, controllers, external(empty), guards, persistence, utils, wasm}
  notifications/                       <-- self-contained sub-module, own hexagonal layers
    application/{dtos, services, use-cases}
    domain/{entities, ports}
    infrastructure/{adapters, controllers, gateways, persistence}
```

The `notifications/` sub-tree is a second, fully independent hexagonal slice living inside analytics-service — not a separate microservice — wired directly into the single `AppModule`. See [../architecture/low-level-architecture.md](../architecture/low-level-architecture.md) for the general hexagonal pattern this module also follows.

## Domain entities

**Core analytics (6)**:

| Entity | Purpose |
|---|---|
| `AnalyticsEntity` | Unused skeleton placeholder — dead code, not wired into any use case. |
| `AlertEntity` | type, message, status, severity, subjectId/periodId, resolvedBy/resolvedAt. |
| `StudentMetricsEntity` | Per-student-per-period aggregate: subjectAverages, globalAverage, version. |
| `StudentSubjectMetricsEntity` | Per-student-per-subject-per-week snapshot: averageGrade, complianceIndex, attendanceRate, studyHours, comprehensionAvg, riskLevel, trendSlope. |
| `Enrollment` (interface) | Cross-service value object, not persisted here. |
| `Grade` (interface) | Cross-service value object, not persisted here. |

**Notifications sub-module (2)**:

| Entity | Purpose |
|---|---|
| `NotificationEntity` | recipientId, recipientRole, type, title, message, status, readAt, relatedAlertId/subjectId/studentId/periodId. |
| `DeviceTokenEntity` | userId, expoPushToken, platform. |

## Use cases

**Core (21)**, grouped:

- **Calculations**: calculate-average, calculate-trend, calculate-compliance, classify-risk, recalculate-student-metrics.
- **Alerts**: generate-alert, generate-alerts, get-alerts, get-subject-alerts, resolve-alert.
- **Metrics/read models**: get-aggregated-metrics, get-latest-subject-metric, get-student-subject-metrics, get-student-subjects-overview, get-subject-metrics-summary, get-subject-weekly-progress.
- **Risk**: get-risk-snapshot, get-subject-risk.
- **Dashboards**: get-admin-dashboard, get-student-dashboard, get-teacher-dashboard.

**Notifications sub-module (6)**: create-notification, get-my-notifications, mark-notification-read, mark-all-notifications-read, register-device-token, unregister-device-token.

## HTTP endpoints

Full endpoint reference with roles lives in [../api/api-contracts.md](../api/api-contracts.md) — this section only lists the controller files and route counts.

## External integrations

- **PostgreSQL** — metrics, alerts, notifications, device tokens.
- **MongoDB** — `dataset-version.schema.ts`, data versioning for ML-adjacent artifacts.
- **Redis** — real, wired caching. Key pattern `metrics:<studentId>:<periodId>`, TTL 300s, single consumer `CalculateAverageUseCase`. See [../database/database-architecture.md](../database/database-architecture.md) for the exact key layout.
- **WebAssembly** — `linear-regression.wasm.ts`, trend slope calculation.
- **Socket.io** — real-time notification push at `/api/socket.io`, JWT-authenticated on connect, room `user:{userId}`, event `notification:new`. Delivery channel only — Postgres remains the source of truth.
- **Expo push notifications** — `ExpoPushClient` implements `IPushNotificationClient`.
- **AcademicHttpClient** — calls academic-service.
- **PredictionHttpClient** — calls prediction-service.

## Environment variables

`ACADEMIC_SERVICE_URL`, `APP_PORT`, `CORS_ORIGINS`, `JWT_*`, `MONGO_*`, `NODE_ENV`, `POSTGRES_*`, `PREDICTION_SERVICE_URL`, `REDIS_*`, `RISK_CRITICAL_THRESHOLD`, `RISK_HIGH_THRESHOLD` (risk classification tuning), `SWAGGER_SERVER_URL`, `USER_SERVICE_URL`.

## Known issues / audit findings

- **RiskLevel enum mismatch**: the `RiskLevel` defined here (LOW/MEDIUM/HIGH/CRITICAL, 4 values) is the real, authoritative domain definition — but `packages/shared-types`' own `RiskLevel` enum only has 3 values (missing CRITICAL). See [../database/database-architecture.md](../database/database-architecture.md) and [../business/business-logic.md](../business/business-logic.md) for the full discrepancy note.
- **Kong rate-limiting incident**: this service was the site of a real production incident this cycle. Kong's rate-limiting shared a single bucket across every concurrent QA user because `KONG_TRUSTED_IPS` was never set, so Kong used nginx's own container IP as the "client IP" for every request instead of the real visitor's. analytics-service's notification and analytics routes were the ones most visibly affected, surfacing as 429s under normal multi-user load. The fix was applied at the infra layer — see [../infrastructure/kong-gateway.md](../infrastructure/kong-gateway.md) — not in this service's code.
