# Shared packages

Documents the real, current state of `packages/*` — most of these are scaffolded but not yet integrated into any service or app.

| Package | What it is | Consumers |
|---|---|---|
| `@mentorapredict/shared-logger` | NestJS/pino logging module: `createLoggerModule` factory, correlation-id middleware/context, log path redaction (`redact-paths.ts`), re-exports `Logger` from `nestjs-pino`. Compiled (has `dist/`). | **All 5 backend services** — the only shared package with real consumers found in any package.json. |
| `@mentorapredict/shared-types` | Pure TS types/enums/DTOs/interfaces intended to be shared across services: `Role`, `RiskLevel`, `AcademicTrend`, `EnrollmentStatus`, `ServiceStatus`, `IngestionFormat` enums; `PaginatedResponse`, `ApiResponse`, `ErrorResponse`, `HealthCheckResponse`, `JwtPayload` interfaces; pagination/base-entity DTOs; API/Redis-key constants. Governed by the "RNF-034 golden rule": zero business logic. | **None currently** — not referenced in any service or app package.json dependencies; scaffolded but not yet wired in. Each service currently re-declares its own local types instead. Note: this package's own `RiskLevel` enum has only 3 values, while the real analytics-service domain uses 4 (missing CRITICAL) — a real inconsistency, documented in [../database/database-architecture.md](../database/database-architecture.md) and [../business/business-logic.md](../business/business-logic.md) as well. |
| `@mentorapredict/shared-utils` | Pure helper functions: pagination, date, correlation-id, anonymization, and API-response-shaping utilities. Depends on `shared-types`. | **None currently** — no consumers found. |
| `@mentorapredict/shared-config` | Shared config interfaces (`DatabaseConfig`, `JwtConfig`, `ServiceUrls`, `AppConfig`) and a common env-validation schema. | **None currently** — no consumers found; each service currently hand-rolls its own `ConfigModule`/env parsing under `infrastructure/config`. |
| `@mentorapredict/hooks` | Empty scaffold — package.json build script is just `echo Hooks package - implement after`; no `src/` directory exists yet. | None (not implemented). |
| `@mentorapredict/services` | Empty scaffold — same echo-placeholder pattern, no `src/`. | None (not implemented). |
| `@mentorapredict/ui` | Empty scaffold — same pattern, no `src/`. Presumably intended as a shared React component library for `apps/web` and `apps/desktop`. | None (not implemented). |

## Frontend consumption

The frontend apps (`apps/web`, `apps/mobile`, `apps/desktop`, `apps/landing`) also do not currently depend on any of `shared-types`, `shared-utils`, `shared-config`, `hooks`, `services`, or `ui` per their package.json dependency lists.

These packages appear to be forward-scaffolded per `packages/shared-packages-design.yaml` but not yet integrated anywhere in the codebase. This should be read as planned/in-progress infrastructure rather than dead weight — it is an intentional design direction that just hasn't been executed yet. RNF-034, RNF-035, RNF-038, and RNF-042 all reference these packages' intended role; see [../business/non-functional-requirements.md](../business/non-functional-requirements.md).

## See also

- [./README.md](./README.md) — backend overview and per-service doc index.
- [../database/database-architecture.md](../database/database-architecture.md) — full RiskLevel enum discrepancy note.
