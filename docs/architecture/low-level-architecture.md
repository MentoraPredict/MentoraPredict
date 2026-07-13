# Low-Level Architecture — Hexagonal Pattern

> How each backend service is internally structured. For the system-wide picture, see [high-level-architecture.md](./high-level-architecture.md). For the concrete entity/use-case/endpoint inventory per service, see [../backend/](../backend/).

## 1. The pattern, explained once

All 5 backend services (`auth-service`, `user-service`, `academic-service`, `analytics-service`, `prediction-service`) follow the same **hexagonal architecture** (ports & adapters), implemented as a 3-layer folder convention under each service's `src/`:

```
src/
├── domain/            # Enterprise business rules — no framework/library dependencies
│   ├── entities/       # Plain domain entities (not the TypeORM/Mongoose classes)
│   ├── value-objects/   # (where present) immutable domain concepts
│   └── ports/           # (where present) domain-level interfaces
├── application/        # Application business rules — orchestrates domain + ports
│   ├── use-cases/        # One class per business operation (the real unit of behavior)
│   ├── dtos/              # Input/output shapes for use cases
│   └── ports/
│       ├── input/          # Interfaces use cases expose (rarely used directly)
│       └── output/         # Interfaces use cases depend on (repositories, external clients)
└── infrastructure/     # Frameworks & drivers — the only layer that knows about NestJS/TypeORM/HTTP
    ├── controllers/       # NestJS REST controllers — thin, delegate straight to a use case
    ├── persistence/       # TypeORM repositories implementing the output ports (Postgres)
    ├── adapters/           # HTTP clients calling other services, and other outbound adapters
    ├── guards/              # JwtAuthGuard, RolesGuard, InternalServiceGuard
    ├── auth/                 # JWT strategy/config
    ├── config/                # Env var loading/validation
    └── (storage/ wasm/ cache/ utils/ external/ — present in some services, see below)
```

**Dependency rule**: `infrastructure` depends on `application` depends on `domain` — never the reverse. A use case in `application/use-cases/` never imports a NestJS decorator or a TypeORM class directly; it depends on an *output port interface* (e.g. `IStudentSubjectMetricsRepository`), and `infrastructure/persistence/` provides the concrete TypeORM implementation, wired together in each service's `app.module.ts` via Nest's DI (`{ provide: 'IStudentSubjectMetricsRepository', useClass: StudentSubjectMetricsRepository }`).

**Controllers are intentionally thin**: every controller method's body is close to `return this.someUseCase.execute(...)` — validation lives in DTOs (`class-validator` decorators), authorization lives in guards, and business logic lives entirely in the use case. This is why the endpoint tables in [../api/api-contracts.md](../api/api-contracts.md) can be read directly off controller decorators with confidence that they reflect real behavior.

## 2. Where services deviate from the base pattern

Not all 5 services have identical folder sets — real, observed differences:

| Service | Extra folders vs. the base pattern | Why |
|---|---|---|
| user-service | `infrastructure/storage/` | Avatar upload handling (Supabase Storage adapter + disk fallback) |
| academic-service | `infrastructure/storage/`, `infrastructure/utils/` | Subject/topic file uploads; misc academic-domain helpers (largest service, 69 use cases) |
| analytics-service | `infrastructure/wasm/`, plus a **second, fully independent hexagonal slice** at `src/notifications/` (own `domain/application/infrastructure`) | WASM-backed linear regression for trend calculation; notifications is a self-contained bounded context living inside this service rather than a 6th microservice |
| prediction-service | Leanest — no `cache/`, `external/`, or `storage/` folders | No Redis dependency, no file uploads; it only calls out to academic-service, analytics-service, and OpenAI |

Every service also has an unused **skeleton placeholder entity** matching the service's own name (e.g. `AuthEntity` in auth-service, `AcademicEntity` in academic-service) — dead scaffold code (`// TODO: define properties`) left over from initial bootstrap, never deleted, never referenced by any use case. Mentioned here so it isn't mistaken for a real domain concept when reading the entity list in each service's doc.

## 3. Internal vs. public controllers

Every service exposes at least two controller groups, distinguished by guard:

- **Public/JWT-protected controllers** (`JwtAuthGuard` + `RolesGuard`) — the routes end users hit through Kong, gated by role.
- **Internal controllers** (`InternalServiceGuard`, path suffix `/internal`) — service-to-service only, verified via a signed JWT carrying `scope: "service:internal"`, additionally IP-restricted at the Kong layer (`ip-restriction` plugin, allowing only `127.0.0.1`/`172.16.0.0/12`, i.e. only reachable from inside the Docker network, never from the public internet even with a valid token).
- Some services also expose an **uploads controller** (fully public, unauthenticated) that serves previously-uploaded static files (avatars, subject images) by filename, with UUID-format validation to prevent path traversal.

## 4. Cross-cutting infrastructure every service shares

- **`@mentorapredict/shared-logger`**: the only shared package with real consumers (all 5 services) — `nestjs-pino` wrapper providing JSON logging, secret redaction, and the `AsyncLocalStorage` correlation context that lets an outbound HTTP adapter read the *inbound* request's correlation ID without it being threaded through every function signature.
- **Health checks**: every service exposes `GET /health`, checking whatever it actually depends on (Postgres always; +Redis for auth-service/analytics-service; +MongoDB for academic/analytics/prediction-service). One inconsistency found: prediction-service's health check only reports MongoDB status despite also using Postgres.
- **Swagger**: every service self-documents at `/api/v1/<domain>/docs` via `@nestjs/swagger`, generated from the same decorators that define the routes — this is the most trustworthy live API reference, more so than any static doc (including this one, which should be cross-checked against it periodically).

## 5. Frontend architecture pattern (for comparison)

`apps/web` follows **atomic design** (atoms → molecules → organisms → templates → pages), a completely different pattern from the backend's hexagonal layering — full detail in [../frontend/web.md](../frontend/web.md). The two patterns don't need to mirror each other; hexagonal serves backend testability/framework-independence, atomic design serves frontend component reuse/composition.
