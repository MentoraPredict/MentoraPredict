# user-service

Owns the user profile aggregate — the extended, mutable identity data (bio, avatar, cedula, status) that sits alongside the auth-service credential record and is consumed by every other service that needs to display or authorize against a user.

## Tech stack

| Library | Version | Purpose |
|---|---|---|
| NestJS | 10.3.0 | Application framework |
| TypeORM | 0.3.20 | ORM for PostgreSQL |
| pg | — | PostgreSQL driver |
| @nestjs/axios, axios | — | HTTP clients to other services |
| @supabase/supabase-js | 2.45.4 | Supabase Storage for avatars |
| multer | — | File upload handling |
| class-validator, class-transformer | — | DTO validation |
| Jest | 29 | Testing |

No Redis dependency. Dockerfile is based on `node:22-alpine`, creates an `uploads/avatars` directory, and exposes port 3002.

## Layer structure

```
src/
  application/{dtos, ports/{input,output}, use-cases (+ __tests__)}
  domain/{entities, ports}
  infrastructure/{adapters, auth, cache, config, controllers, external(empty), filters, guards, persistence, storage}
```

Standard hexagonal structure per [../architecture/low-level-architecture.md](../architecture/low-level-architecture.md), with two deviations from auth-service's layout: a `domain/ports` folder in addition to `application/ports`, and an `infrastructure/storage` folder for avatar upload utilities.

## Domain entities

| Entity | Purpose |
|---|---|
| `UserEntity` (user.entity.ts) | Unused skeleton placeholder — dead code, not wired into any use case. |
| `UserProfileEntity` (user-profile.entity.ts) | The real aggregate: id, photo, bio, cedula, authProvider, role, status, deletedAt, createdAt/updatedAt, avatarUrl. |

## Use cases

create-user-profile, get-user, update-user, soft-delete-user, list-users, upload-avatar, delete-avatar.

7 use cases total.

## HTTP endpoints

Full endpoint reference with roles lives in [../api/api-contracts.md](../api/api-contracts.md) — this section only lists the controller files and route counts.

## External integrations

- **PostgreSQL** — `user_profiles` table.
- **Supabase Storage** (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`) alongside a local disk fallback (`UPLOADS_DIR`) for avatar images.
- **AuthHttpClient**, **AuthSyncClient** — call auth-service.
- **AcademicStatusHttpClient** — calls academic-service to check deactivation eligibility before a soft-delete.
- **NotificationHttpClient** — calls analytics-service (notifications submodule).

## Environment variables

`APP_PORT`, `AUTH_SERVICE_URL`, `CORS_ORIGINS`, `JWT_*`, `NODE_ENV`, `POSTGRES_*`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`, `SWAGGER_SERVER_URL`, `UPLOADS_DIR`.

## Known issues / audit findings

`SupabaseImageStorageAdapter`'s constructor previously called `createClient('', '')` when the Supabase env vars were empty, which throws synchronously and crashed the entire service at boot. This has been fixed: the adapter now logs a warning at startup when credentials are missing and defers the throw to the actual upload call, so the service starts normally and only fails on an actual avatar upload attempt.
