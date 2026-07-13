# MentoraPredict

AI-powered early academic-risk detection platform. MentoraPredict tracks student performance across enrolled subjects, computes a deterministic risk classification from grades/attendance/compliance, and layers an AI-generated (OpenAI) natural-language summary and recommendation plan on top — so teachers and admins can intervene before a student loses a subject, and students get actionable feedback mid-semester.

---

## Documentation

Full technical documentation lives in [`docs/`](./docs/), organized by topic:

| Section | Contents |
|---|---|
| [`docs/business/`](./docs/business/) | Domain model, actors, business rules ([business-logic.md](./docs/business/business-logic.md)); functional ([functional-requirements.md](./docs/business/functional-requirements.md)) and non-functional ([non-functional-requirements.md](./docs/business/non-functional-requirements.md)) requirement catalogs (RF-/RNF-); role-by-role scenarios ([use-cases.md](./docs/business/use-cases.md)) |
| [`docs/architecture/`](./docs/architecture/) | System context, request flow, and the reasoning behind the shape of the system ([high-level-architecture.md](./docs/architecture/high-level-architecture.md)); the hexagonal pattern every backend service follows ([low-level-architecture.md](./docs/architecture/low-level-architecture.md)) |
| [`docs/backend/`](./docs/backend/README.md) | The 5 NestJS microservices — tech stack, entities, use cases, endpoints, integrations per service |
| [`docs/frontend/`](./docs/frontend/README.md) | The 4 client apps (web, landing, mobile, desktop) — tech stack, structure, routing |
| [`docs/database/`](./docs/database/database-architecture.md) | PostgreSQL/MongoDB/Redis split, real entity-to-table mapping, seed data, known gaps |
| [`docs/api/`](./docs/api/api-contracts.md) | Full endpoint reference (route, method, required role) per service |
| [`docs/infrastructure/`](./docs/infrastructure/) | Docker Compose topology, Kong API Gateway routing/rate-limiting, monitoring stack |
| [`docs/deployment/`](./docs/deployment/README.md) | CI/CD pipeline detail ([ci-cd-pipeline.md](./docs/deployment/ci-cd-pipeline.md)) and step-by-step local/QA/production deployment ([environments.md](./docs/deployment/environments.md)) |

This documentation set was produced by a full code-level audit (not copied from design docs) — where the running code disagrees with an older design artifact (`contracts/openapi-contracts.yaml`, `data-models/data-models.yaml`, prior `docs/*.md`), the docs above say so explicitly rather than silently picking one.

## Architecture at a glance

```
Client apps (web / landing / mobile / desktop)
              │  same REST API for all 4, no client-specific backend
              ▼
   Cloudflare → nginx → Kong (JWT, CORS, rate limiting)
              │
   ┌──────────┼──────────┬──────────┬──────────┐
   ▼          ▼          ▼          ▼          ▼
auth-svc   user-svc  academic-svc analytics-svc prediction-svc
 :3001       :3002       :3003        :3004         :3006
   │          │           │            │             │
   └──────────┴─────┬─────┴─────┬──────┴─────────────┘
                     ▼           ▼
               PostgreSQL   MongoDB Atlas   Redis
```

5 independent NestJS microservices in hexagonal architecture, no message broker (synchronous internal HTTP only, authenticated via a `service:internal`-scoped JWT), behind a single Kong gateway. Full detail: [docs/architecture/high-level-architecture.md](./docs/architecture/high-level-architecture.md).

## Monorepo structure

```
mentorapredict/
├── apps/
│   ├── web/          React 19 SPA — primary client (student/teacher/admin dashboards)
│   ├── landing/       Astro 5 — public marketing page
│   ├── mobile/        Expo/React Native — companion Android app
│   └── desktop/       Electron — packaged Windows installer wrapping apps/web
├── services/
│   ├── auth-service/       Credentials, JWT, OAuth
│   ├── user-service/       Profiles, avatars
│   ├── academic-service/   Faculties/careers/periods/subjects/enrollments/grades/check-ins (largest, 69 use cases)
│   ├── analytics-service/  Risk classification, alerts, dashboards, notifications (WebSocket + push)
│   └── prediction-service/ AI-generated summaries/recommendations (OpenAI, never computes risk itself)
├── packages/          Shared logging (in real use) + shared types/utils/config/ui (scaffolded, not yet consumed)
├── infra/
│   ├── docker/         Compose files per environment (dev/qa/prod/infra)
│   ├── kong/            API Gateway declarative config
│   ├── monitoring/       Grafana + cAdvisor + Node Exporter
│   └── scripts/          Dev bootstrap, seed runner
├── database/           Postgres seed SQL (11 files) + seed-runner Dockerfile
├── docs/               Full documentation (see table above)
├── contracts/          Historical OpenAPI design draft (superseded by docs/api/)
├── data-models/        Historical data-model design draft (superseded by docs/database/)
└── .github/workflows/  ci.yml, cd-qa.yml, cd-main.yml, release.yml
```

## Technology stack

| Layer | Technology |
|---|---|
| Backend | NestJS 10/11, TypeScript, TypeORM (PostgreSQL), Mongoose (MongoDB Atlas), ioredis (Redis) |
| Frontend (web) | React 19, Vite 8, React Router 7, TanStack Query 5, Zustand 5, Tailwind 4, Storybook 10 |
| Frontend (other clients) | Astro 5 (landing), Expo/React Native (mobile), Electron 37 (desktop) |
| API Gateway | Kong 3.6 — JWT (RS256), CORS, per-consumer rate limiting |
| Databases | PostgreSQL 16, MongoDB Atlas, Redis 7 |
| AI | OpenAI API (prediction-service only — consumes risk from analytics-service, never computes it) |
| Infra | Docker Compose (no orchestrator), nginx, Cloudflare (QA/prod) |
| CI/CD | GitHub Actions — `ci.yml`, `cd-qa.yml`, `cd-main.yml`, `release.yml` |
| Monorepo tooling | Turborepo, pnpm workspaces |

Full per-app/service tech stack with exact versions: [docs/backend/README.md](./docs/backend/README.md), [docs/frontend/README.md](./docs/frontend/README.md).

## Quick start (local development)

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp infra/.env.example infra/.env   # fill in JWT keys, OPENAI_API_KEY, MONGO_URL, etc.
bash infra/kong/generate-kong-keys.sh

# 3. Start the full stack (builds every service from source, seeds the database)
docker compose --env-file infra/.env -f infra/docker/docker-compose.dev.yml up -d --build

# 4. Verify
curl http://localhost:8000/health
```

Full step-by-step guide (including QA/production deploy procedures and seed login credentials): [docs/deployment/environments.md](./docs/deployment/environments.md).

## Environments

| Environment | Domain | Branch | Deploy |
|---|---|---|---|
| Local | `localhost` | `dev` | Manual (`docker compose up` / `dev-setup.sh`) |
| QA | `mentorapredictqa.programacionwebuce.net` | `QA` | Automatic on push (`cd-qa.yml`) |
| Production | `mentorapredictprod.programacionwebuce.net` | `main` / `v*` tag | Automatic on push/tag, or manual dispatch (`cd-main.yml`) |

## Contributing

- **Branching**: `main` (production) ← `QA` ← `dev` ← `feature/*` / `fix/*` / `chore/*`. Promotion happens via PR (`dev` → `QA` → `main`).
- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/), enforced by `commitlint` on every PR. Scope must be one of the values in `.commitlintrc.json`'s `scope-enum`.
- **Before opening a PR**: `pnpm lint && pnpm build && pnpm test` (same gate `ci.yml`'s `validate` job runs for PRs into `QA`/`main`).
- Keep documentation in [`docs/`](./docs/) updated alongside code changes — this doc set is meant to track real code state, not go stale like its predecessors did.
