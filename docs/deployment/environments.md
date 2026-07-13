# Environments — Local, QA, and Production

Practical, step-by-step guide to running and deploying MentoraPredict in each environment. For the underlying pipeline mechanics, see [./ci-cd-pipeline.md](./ci-cd-pipeline.md); for the high-level flow, see [./README.md](./README.md).

## Overview

| Environment | Domain | Branch | Deploy trigger | Compose files |
|---|---|---|---|---|
| Local (dev) | `localhost` | `dev` | Manual (`dev-setup.sh` or `docker compose up`) | `docker-compose.dev.yml` (self-contained, includes Postgres/Redis) |
| QA | `mentorapredictqa.programacionwebuce.net` | `QA` | Automatic on push | `docker-compose.infra.yml` + `docker-compose.qa.yml` |
| Production | `mentorapredictprod.programacionwebuce.net` | `main` / `v*` tag | Automatic on push/tag, or manual `workflow_dispatch` | `docker-compose.infra.yml` + `docker-compose.prod.yml` |

## Local development — step by step

**Prerequisites**: Node.js 22.x, pnpm, Docker + Docker Compose, git, openssl.

```bash
# 1. Install JS dependencies
pnpm install

# 2. Copy and fill environment templates
cp infra/.env.example infra/.env
# edit infra/.env — fill in at minimum: JWT keys (or generate below), OPENAI_API_KEY if testing predictions,
# MONGO_URL (Atlas), SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY if testing image uploads

# 3. Generate a local JWT RS256 keypair (writes into infra/keys/)
bash infra/kong/generate-kong-keys.sh

# 4. Start the full stack (builds every service from source)
docker compose --env-file infra/.env -f infra/docker/docker-compose.dev.yml up -d --build

# 5. Seed the database (the seed-loader service in the compose file does this automatically on `up`,
#    but can be re-run standalone)
docker compose --env-file infra/.env -f infra/docker/docker-compose.dev.yml up seed-loader

# 6. Verify
docker compose -f infra/docker/docker-compose.dev.yml ps   # all services should be "healthy"
curl http://localhost:8000/health                           # Kong → auth-service health route
```

**Alternative**: `bash infra/scripts/dev-setup.sh` automates all of the above end-to-end. It's intended for a fresh EC2/dev host but works locally too — see [../infrastructure/monitoring.md](../infrastructure/monitoring.md) for exactly what it does step by step.

**Seed login credentials** once seeded (see [../database/database-architecture.md](../database/database-architecture.md) for the full list): e.g. `student001@mentorapredict.edu.ec` / `MP123456789`.

**Access points** once running:

| Service | URL |
|---|---|
| Kong proxy | `http://localhost:8000` |
| Kong admin | `http://localhost:8001` |
| Web app | `http://localhost:${WEB_PORT:-3000}` |
| Landing | `http://localhost:${LANDING_PORT:-4321}` |
| Konga (profile `tools`) | `http://localhost:1337` |
| Redis Commander (profile `tools`) | `http://localhost:8081` |

**Monitoring stack locally** (optional):

```bash
docker compose -f infra/monitoring/docker-compose.monitoring.yml --project-name mentorapredict up -d
```

Note: Grafana currently has no datasource configured (see [../infrastructure/monitoring.md](../infrastructure/monitoring.md)), so dashboards won't show data even running locally.

## QA — automatic deploy, verification, and manual intervention

QA deploys automatically on every push to the `QA` branch via `cd-qa.yml` — there is normally no manual step. To promote `dev` → `QA`, open a PR from `dev` into `QA` (this triggers `ci.yml`'s full `validate` job) and merge it.

### Manual re-apply

To manually re-apply the current QA state on the EC2 host (e.g. after an env var change that Compose didn't pick up automatically), SSH in and run:

```bash
cd /opt/mentorapredict
docker compose --env-file .env -f infra/docker/docker-compose.qa.yml --project-name mentorapredict up -d
# to force a specific service even if Compose doesn't detect a diff:
docker compose --env-file .env -f infra/docker/docker-compose.qa.yml --project-name mentorapredict up -d --force-recreate <service-name>
```

Monitoring stack, same pattern:

```bash
docker compose --env-file .env -f infra/monitoring/docker-compose.monitoring.yml --project-name mentorapredict up -d --force-recreate grafana
```

### Logs and health

```bash
docker logs mp_kong
docker logs mp_<service>
docker compose -f infra/docker/docker-compose.qa.yml ps
```

### Verifying a deploy landed

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://mentorapredictqa.programacionwebuce.net/health   # expect 200
git -C /opt/mentorapredict log -1                                                                  # check the deployed commit
```

## Production — deploy and safety notes

Production deploys automatically on push to `main` (normally via merging a `QA` → `main` release PR), on pushing a `v*` tag, or via manual `workflow_dispatch` from the GitHub Actions UI. It uses the same underlying mechanism as QA — `cd-main.yml` mirrors `cd-qa.yml` job-for-job (see [./ci-cd-pipeline.md](./ci-cd-pipeline.md)) — targeting `docker-compose.prod.yml` and the prod EC2 host/domain instead.

**Before promoting to production**: confirm any environment variables that changed for QA have also been added to the `cd-main.yml` `.env`-generation step if they're new. This was a real gap found this cycle — a Grafana env var was added to QA's deploy script but not prod's, meaning a fix that worked on QA would have silently failed on prod. Also confirm required secrets exist in the `"Prod Enviroment"` GitHub environment (same secret names as QA's `"QA enviroment"`, scoped separately).

### Manual re-apply

Identical in shape to QA's, just with `docker-compose.prod.yml`, run from the prod host's `/opt/mentorapredict`.

### Rollback

There is no automated rollback mechanism. Either:
- Revert the merge commit on `main` and let `cd-main.yml` redeploy the reverted state, or
- Manually check out a prior commit on the EC2 host and re-run `docker compose up -d` with the previous image tag.

## Required secrets (GitHub Actions)

Names only — values are scoped per environment (`"QA enviroment"` / `"Prod Enviroment"` GitHub Environments), with separate values for QA vs prod even though the names match.

| Category | Secret names |
|---|---|
| DockerHub | `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN` |
| EC2 access | `EC2_HOST`, `EC2_SSH_KEY` |
| Database | `POSTGRES_*`, `REDIS_PASSWORD`, `MONGO_URL` |
| Auth | `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY` |
| OAuth | `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_TENANT_ID` |
| AI | `OPENAI_API_KEY` |
| Storage | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| Mobile signing | `ANDROID_KEYSTORE_BASE64` (+ keystore password secrets) |
| CMS | `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ACCESS_TOKEN` |
| Monitoring | `GRAFANA_ADMIN_USER`, `GRAFANA_ADMIN_PASSWORD` |

## See also

- [./README.md](./README.md) — deploy flow overview.
- [./ci-cd-pipeline.md](./ci-cd-pipeline.md) — job-by-job workflow detail.
- [../infrastructure/docker-compose.md](../infrastructure/docker-compose.md)
- [../infrastructure/kong-gateway.md](../infrastructure/kong-gateway.md)
- [../architecture/high-level-architecture.md](../architecture/high-level-architecture.md)
