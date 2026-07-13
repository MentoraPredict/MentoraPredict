# Non-Functional Requirements (RNF-)

> Same methodology as [functional-requirements.md](./functional-requirements.md): reconstructed by grepping the codebase for `RNF-0\d\d`, no canonical spec exists. Only the codes actually referenced in code are listed — there are real gaps in the numbering (e.g. no RNF-001, RNF-003 through RNF-005, RNF-007 through RNF-033, RNF-036/037, RNF-041 anywhere in code).

| Code | Requirement | Where enforced |
|---|---|---|
| RNF-002 | Password hashing with bcrypt, cost factor ≥ 12 | `services/auth-service/src/infrastructure/config/bcrypt.adapter.ts` (`SALT_ROUNDS = 12`) |
| RNF-006 | Rate limiting / brute-force protection on login | Two independent layers: Kong `rate-limiting` plugin (`auth-login` route, 5 req/min, `limit_by: ip`) + an application-level check in `login-user.use-case.ts` before touching the DB |
| RNF-034 | "Golden rule" for shared packages: `shared-types`/`shared-config`/`shared-utils` contain **zero business logic**, only types/enums/DTOs/pure helpers/config | `packages/shared-packages-design.yaml`. **Note**: enforced by convention/design intent, not by a lint rule — see [../backend/shared-packages.md](../backend/shared-packages.md) for the current (mostly unused) state of these packages |
| RNF-035 | Pagination: default page size 20, hard cap 25 per page | `packages/shared-types/src/dtos/pagination-query.dto.ts`, `packages/shared-types/src/constants/api.constants.ts` — **not consumed by any service today** (each service currently implements its own pagination DTO independently; see shared-packages.md) |
| RNF-038 | Distributed tracing — every service-to-service HTTP call carries a correlation ID | `packages/shared-utils/src/correlation/correlation.util.ts` (design intent) — the **actually running** implementation is `@mentorapredict/shared-logger`'s `AsyncLocalStorage`-based correlation context + `x-correlation-id`/`X-Correlation-ID` header, wired into all 5 services' `main.ts`, plus Kong's global `correlation-id` plugin as the origination point |
| RNF-039 | API documentation via Swagger/OpenAPI, generated per service | Every service's `main.ts` sets up `@nestjs/swagger` at `/api/v1/<domain>/docs` (or `/api/docs`) |
| RNF-040 | Full traceability/audit trail of every AI prediction and generated recommendation | `prediction-service`'s `prediction_logs` MongoDB collection — every generation (student-triggered or internally-triggered) is persisted, never just returned and discarded |
| RNF-042 | PII anonymization before sending student data to prediction/analytics services | `packages/shared-utils/src/anonymization/anonymize.util.ts` (design intent) — **not verified as wired into any actual cross-service call** during this audit; the internal HTTP clients between services pass structured DTOs (studentId, grades, topics) without an explicit anonymization step observed in the adapters. Flagged as a gap to verify, not confirmed compliant.

## Additional non-functional characteristics observed (not RNF-coded, but worth documenting)

These don't have an explicit RNF- code anywhere in the code but are real, implemented, and load-bearing operational properties discovered during the infrastructure audit — see [../infrastructure/](../infrastructure/) for detail:

- **Resource limits per container**: every service in every environment has explicit CPU/memory limits (e.g., academic-service 0.35 CPU / 512M in dev, 448M in QA/prod) — see [../infrastructure/docker-compose.md](../infrastructure/docker-compose.md).
- **Kong-level rate limiting on every JWT-protected route**: 300 req/min per authenticated consumer on `user-routes`/`academic-routes`/`analytics-routes`/`notifications-routes`/`prediction-routes`; additionally a QA/prod-only nginx-level `limit_req_zone` (30 req/s per IP) sits in front of Kong. See [../infrastructure/kong-gateway.md](../infrastructure/kong-gateway.md).
- **Graceful degradation on MongoDB unavailability**: `lazyConnection: true` + a bound error listener on every Mongo-consuming service, so an unreachable Atlas cluster degrades specific features (observations, audit logs, prediction history) instead of crashing the whole service. See [../database/database-architecture.md](../database/database-architecture.md).
- **No database migrations**: schema is created purely via TypeORM `synchronize` (`true` outside `NODE_ENV=production`, `false` in production with **no migration mechanism to replace it**) — a real production-readiness gap, not a designed non-functional guarantee. Documented as a known gap rather than a met requirement.
- **Health checks on every service**: `GET /health` per service (checks its own DB/cache dependencies), used by Docker Compose `healthcheck` directives and container orchestration (`depends_on: condition: service_healthy`).
- **Structured JSON logging with secret redaction**: `@mentorapredict/shared-logger` (nestjs-pino) across all 5 backend services and a parallel structured console logger on the web frontend, both correlation-ID-aware.

## Known gaps

- Several RNF codes referenced by `data-models.yaml`/`contracts/openapi-contracts.yaml` (e.g. around encryption at rest, backup/recovery, SLA/uptime targets) were searched for and **not found** anywhere in actual code — either never implemented or never given an RNF code in the first place. Not listed above since this catalog only includes codes that are actually grounded in code.
- RNF-042 (PII anonymization) is the one requirement in this list flagged as **design intent only, not confirmed implemented** — worth a follow-up audit specifically tracing whether `academic-service`'s outbound calls to `analytics-service`/`prediction-service` actually strip PII, or send raw student records.
