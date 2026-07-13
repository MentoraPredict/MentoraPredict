# Docker Compose Layer

MentoraPredict runs on 4 Docker Compose files under `infra/docker/`. All 4 declare `deploy.resources.limits` (CPU/memory), but these are only enforced under a Swarm-compatible engine — under plain `docker compose` (which is what every environment actually uses) they are advisory only. This caveat applies uniformly across all 4 files below.

Related: [../architecture/high-level-architecture.md](../architecture/high-level-architecture.md), [../deployment/environments.md](../deployment/environments.md), [../backend/README.md](../backend/README.md).

## `docker-compose.infra.yml` — shared DB layer (QA + prod)

Provides the Postgres and Redis instances shared by QA and prod. Not used in dev, where Postgres/Redis are bundled directly into `docker-compose.dev.yml`.

| Service | Image | Container | Limits (CPU/Mem) | Port | Volume | Notes |
|---|---|---|---|---|---|---|
| postgres | postgres:16-alpine | mp_postgres | 0.75 / 768M | `${POSTGRES_PORT:-5432}:5432` | postgres_data:/var/lib/postgresql/data | restart unless-stopped, healthcheck `pg_isready` |
| redis | redis:7.2-alpine | mp_redis | 0.25 / 192M | 6379 | redis_data | `--requirepass`, `--maxmemory 256mb --maxmemory-policy allkeys-lru` |
| redis-commander (profile `tools`) | rediscommander/redis-commander:latest | — | 0.15 / 192M | 8081 | — | `depends_on: redis` (healthy) |

## `docker-compose.dev.yml` — full local stack, built from source

**Defining trait**: every service is built from source (`build: context: ../.., dockerfile: services/*/Dockerfile` or `apps/*/Dockerfile`) — no images are pulled. This is the single biggest structural difference from QA/prod.

Network: `mp_network` (bridge, created in this file).
Volumes: `postgres_data` (mp_dev_postgres_data), `redis_data` (mp_dev_redis_data), `academic_uploads_data`, `user_uploads_data`.

13 services total:

| Service | Image / Build | Limits (CPU/Mem) | Port | Notes |
|---|---|---|---|---|
| postgres | postgres:16-alpine | 0.75 / 768M | dev-scoped volume | |
| redis | redis:7.2-alpine | 0.25 / 192M | dev-scoped volume | |
| redis-commander (profile `tools`) | rediscommander/redis-commander | 0.15 / 192M | | |
| kong | kong:3.6 | 0.35 / 384M | 8000, 8001 | declarative mode, custom entrypoint, `depends_on: web: condition: service_started`, `restart: true` |
| konga (profile `tools`) | pantsel/konga:0.14.9 | 0.25 / 256M | 1337 | admin UI, `depends_on: kong` (healthy) |
| auth-service | build | 0.5 / 384M | 3001:3001 | Microsoft OAuth env vars, JWT keys, healthcheck `wget /health`, start_period 90s |
| user-service | build | 0.25 / 384M | 3002:3002 | Supabase storage envs, uploads volume |
| academic-service | build | 0.35 / 512M | 3003:3003 | Mongo, `INTERNAL_API_KEY`, uploads volume |
| analytics-service | build | 0.35 / 640M | 3004:3004 | Mongo, `RISK_HIGH/CRITICAL_THRESHOLD`, `INTERNAL_API_KEY` |
| prediction-service | build | 0.35 / 512M | 3006:3006 | OpenAI keys; only Postgres+Mongo, no Redis |
| web | build (apps/web/Dockerfile) | 0.20 / 192M | `${WEB_PORT:-3000}:80` | |
| landing | build (apps/landing/Dockerfile) | 0.25 / 128M | `${LANDING_PORT:-4321}:80` | |
| seed-loader | build (database/Dockerfile.seed) | 0.25 / 256M | — | `restart: "no"`, `depends_on`: all 4 core services healthy + postgres |

All services use `logging: json-file, max-size: 10m, max-file: 3`; most set `init: true`; healthcheck grace periods are long (start_period ~90s), sized for cold local builds.

## `docker-compose.qa.yml` — prebuilt images, selective deploy target

Volumes: `academic_uploads_data`, `user_uploads_data` (both `mp_qa_...`). Network: external.

| Service | Image | Limits (CPU/Mem) | Exposure | Notes |
|---|---|---|---|---|
| kong | kong:3.6 | 0.35 / 320M | 8000/8001 | `restart: always`; **web depends on kong** here (reversed vs dev) |
| konga (profile `tools`) | pantsel/konga:0.14.9 | 0.25 / 256M | 1337 | |
| auth-service | `${DOCKERHUB_USERNAME}/auth-service:${IMAGE_TAG:-qa-latest}` (pulled) | 0.5 / 320M | expose 3001 (no host port) | `restart: always`; `MICROSOFT_REDIRECT_URI`/`FRONTEND_URL` hardcoded to `mentorapredictqa.programacionwebuce.net` |
| user-service | pulled image | 0.25 / 320M | expose 3002 | |
| academic-service | pulled image | 0.35 / 448M | expose 3003 | |
| analytics-service | pulled image | 0.35 / 512M | expose 3004 | |
| prediction-service | pulled image | 0.35 / 448M | expose 3006 | |
| web | pulled image | 0.25 / 128M | expose 80 | volume `/opt/mentorapredict-downloads:/usr/share/nginx/html/downloads` (CD publishes installers here via SCP); `depends_on: kong` |
| landing | pulled image | 0.25 / 128M | expose 80 | |
| seed-loader | **still builds** from `database/Dockerfile.seed` (not pulled) | — | — | `restart: "no"`, `depends_on`: 4 services healthy |

All application services are `expose`-only — no host ports are published; only Kong/nginx can reach them directly. Healthchecks use `retries: 3`, `start_period: 15s` (vs dev's 12 retries / 90s), reflecting the assumption that prebuilt images start faster than cold local builds.

## `docker-compose.prod.yml`

Structurally identical to `docker-compose.qa.yml` — same services, same resource limits, same expose-only pattern, same `/opt/mentorapredict-downloads` volume mount on `web`. Differences are limited to:

| Aspect | QA | Prod |
|---|---|---|
| Volume names | prefixed `mp_qa_*` | unprefixed `mp_academic_uploads_data`, `mp_user_uploads_data` |
| Default `IMAGE_TAG` | `qa-latest` | `main-latest` |
| `SWAGGER_SERVER_URL` / `MICROSOFT_REDIRECT_URI` / `FRONTEND_URL` | `mentorapredictqa.programacionwebuce.net` | `mentorapredictprod.programacionwebuce.net` |

No functional differences in CPU/memory limits or replica counts between QA and prod — the two environments are resource-identical, differentiated only by image tag, hostname, and environment values. No compose file defines replica counts anywhere (single instance per service; no Swarm/replica directives).

## Summary comparison

| Aspect | dev | QA | prod |
|---|---|---|---|
| Image source | built from source | pulled from DockerHub (`qa-*` tags) | pulled from DockerHub (`main-*`/`v*` tags) |
| Postgres/Redis | bundled in the same compose file | separate `docker-compose.infra.yml` | separate `docker-compose.infra.yml` |
| Host port exposure | published (e.g. `3001:3001`) | expose-only, no host ports (behind Kong/nginx) | expose-only, no host ports |
| Restart policy | `unless-stopped` | `always` | `always` |
| Healthcheck retries / start_period | 12 / 90s | 3 / 15s | 3 / 15s |
| Downloads volume mount on `web` | not present | `/opt/mentorapredict-downloads` | `/opt/mentorapredict-downloads` |
