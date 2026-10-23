# auth-service

Owns identity and credential management for MentoraPredict: user registration, login, session/token lifecycle, password recovery, OAuth login, and the authoritative role/status record consumed by every other service.

## Tech stack

| Library | Version | Purpose |
|---|---|---|
| NestJS | 10.3.0 | Application framework |
| TypeORM | 0.3.20 | ORM for PostgreSQL |
| pg | 8.11.5 | PostgreSQL driver |
| ioredis | 5.3.2 | Redis client — refresh tokens, login-attempt rate limiting |
| passport, passport-jwt, @nestjs/jwt | — | JWT RS256 authentication |
| bcryptjs | — | Password hashing (cost factor 12, RNF-002) |
| class-validator, class-transformer | — | DTO validation |
| @nestjs/throttler | 5.1.1 | Rate limiting |
| nestjs-pino, @mentorapredict/shared-logger | — | Structured logging |
| Jest, ts-jest | 29 | Testing |

Dockerfile is based on `node:22-alpine` and exposes port 3001.

## Layer structure

```
src/
  application/{dtos, ports/{input,output}, use-cases (+ __tests__)}
  domain/{entities, value-objects}
  infrastructure/{adapters, auth, cache, config, controllers, external(empty), filters, guards, persistence}
```

Standard hexagonal structure per [../architecture/low-level-architecture.md](../architecture/low-level-architecture.md). `infrastructure/external` exists but is empty — external HTTP clients live under `infrastructure/adapters` instead.

## Domain entities

| Entity | Purpose |
|---|---|
| `AuthEntity` (auth.entity.ts) | Unused skeleton placeholder — dead code, not wired into any use case. |
| `UserEntity` (user.entity.ts) | The real user aggregate: id, email, passwordHash, role, isActive, isVerified, createdAt/updatedAt, firstName, lastName, authProvider (LOCAL/OAuth). |

## Use cases

**Core auth flows**: register-user, login-user, logout-user, refresh-token, forgot-password, reset-password, oauth-login.

**Internal/admin user lookups & sync**: get-auth-user, get-auth-users-by-ids, search-auth-users, update-user, sync-auth-user — consumed by other services and by `InternalUsersController`.

12 use cases total.

## HTTP endpoints

Full endpoint reference with roles lives in [../api/api-contracts.md](../api/api-contracts.md) — this section only lists the controller files and route counts.

## External integrations

- **PostgreSQL** — `users` table, the source of truth for identity.
- **Redis (ioredis)** — refresh token storage, login-attempt throttling.
- **EmailAdapter** — sends password reset emails.
- **MicrosoftOAuthClient** — Azure AD OAuth login.
- **UserProfileHttpClient** — calls user-service to create the profile row immediately after registration.
- **InternalServiceGuard** — verifies the `scope: "service:internal"` JWT on internal endpoints.

## Environment variables

`APP_PORT`, `CORS_ORIGINS`, `FRONTEND_URL`, `JWT_PRIVATE_KEY`/`_PATH`, `JWT_PUBLIC_KEY`/`_PATH`, `JWT_SECRET`, `MICROSOFT_CLIENT_ID`/`SECRET`/`TENANT_ID`, `NODE_ENV`, `POSTGRES_HOST`/`PORT`/`USER`/`PASSWORD`/`DB`, `REDIS_HOST`/`PORT`/`PASSWORD`, `SWAGGER_SERVER_URL`.

## Known issues / audit findings

No issues specific to this service beyond the unused `AuthEntity` skeleton noted above, which follows the same dead-code pattern found in the other services (see [./academic-service.md](./academic-service.md), [./analytics-service.md](./analytics-service.md), [./user-service.md](./user-service.md)).
