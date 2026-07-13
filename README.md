# MentoraPredict

![MentoraPredict Banner](/assets/mentorapredict-banner.jpg)

AI-Powered Academic Success and Student Retention Platform

Predict academic risk, generate personalized recommendations, and empower educational institutions through intelligent analytics.

---

## What is MentoraPredict?

MentoraPredict tracks student performance across enrolled subjects, computes a deterministic risk classification from grades, attendance, and compliance data, and layers an AI-generated natural-language summary and recommendation plan on top. The goal: teachers and admins intervene before a student loses a subject, and students get actionable feedback mid-semester.

The system solves three core problems:

- **Early detection** -- Identifies at-risk students before it is too late, using a transparent classification model rather than opaque predictions.
- **Actionable intelligence** -- Generates subject-specific recommendation plans via OpenAI, so every stakeholder knows what to do next.
- **Unified access** -- A single REST API serves four client applications (web, mobile, desktop, landing), making the platform available anywhere.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | NestJS 10/11, TypeScript, TypeORM (PostgreSQL), Mongoose (MongoDB Atlas), ioredis (Redis) |
| Frontend (web) | React 19, Vite 8, React Router 7, TanStack Query 5, Zustand 5, Tailwind 4 |
| Landing | Astro 5, Contentful CMS, Tailwind 4 |
| Mobile | Expo SDK 54, React Native 0.81, Expo Router 6 |
| Desktop | Electron 37, wraps the web application |
| API Gateway | Kong 3.6 -- JWT (RS256), CORS, per-consumer rate limiting |
| Databases | PostgreSQL 16, MongoDB Atlas, Redis 7 |
| AI | OpenAI API (prediction-service only) |
| Infra | Docker Compose, nginx, Cloudflare |
| CI/CD | GitHub Actions |
| Monorepo | Turborepo, pnpm workspaces |

## Project Modules

### Client Applications

| Module | Path | Description |
|---|---|---|
| **Web** | `apps/web/` | Primary SPA -- student, teacher, and admin dashboards |
| **Landing** | `apps/landing/` | Public marketing page built with Astro |
| **Mobile** | `apps/mobile/` | Android companion app built with Expo/React Native |
| **Desktop** | `apps/desktop/` | Windows desktop installer built with Electron |

### Backend Services

| Service |  Description |
|---|---|
| **auth-service** |  Credentials, JWT (RS256), OAuth (Microsoft) |
| **user-service** |  User profiles, avatars |
| **academic-service** |  Faculties, careers, periods, subjects, enrollments, grades, check-ins |
| **analytics-service** |  Risk classification, alerts, dashboards, WebSocket notifications |
| **prediction-service** |  AI-generated summaries and recommendations via OpenAI |

### Shared Packages

| Package | Status | Description |
|---|---|---|
| `shared-logger` | Active | Structured logging (pino-based, used by all services) |
| `shared-types` | Scaffolded | Shared TypeScript type definitions |
| `shared-utils` | Scaffolded | Shared utility functions |
| `shared-config` | Scaffolded | Shared configuration |
| `ui` | Scaffolded | Shared UI components |
| `hooks` | Scaffolded | Shared React hooks |
| `services` | Scaffolded | Shared service utilities |

## Architecture

```
Client apps (web / landing / mobile / desktop)
              |
              v
   Cloudflare -> nginx -> Kong (JWT, CORS, rate limiting)
              |
   +----------+----------+----------+----------+
   v          v          v          v          v
auth-svc  user-svc  academic-svc analytics-svc prediction-svc
 :3001     :3002      :3003        :3004        :3006
   |         |          |            |            |
   +---------+----+-----+-----+-----+------------+
                    v           v
              PostgreSQL   MongoDB Atlas   Redis
```

Five independent NestJS microservices in hexagonal architecture, no message broker (synchronous internal HTTP only, authenticated via a `service:internal`-scoped JWT), behind a single Kong gateway. See [docs/architecture/](./docs/architecture/) for details.

## Prerequisites

- [Node.js](https://nodejs.org/) v20 or later
- [pnpm](https://pnpm.io/) v11 (`npm install -g pnpm@11`)
- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- [Git](https://git-scm.com/)

Optional (for mobile builds):
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Java JDK 17+ and Android SDK (for local Android builds)

Optional (for desktop builds):
- Windows 10/11 (Electron target)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/mentorapredict.git
cd mentorapredict

# Install dependencies
pnpm install

# Configure environment
cp infra/.env.example infra/.env
# Edit infra/.env and fill in the required values (JWT keys, OPENAI_API_KEY, MONGO_URL, etc.)
bash infra/kong/generate-kong-keys.sh

# Start the full stack (builds every service, seeds the database)
docker compose --env-file infra/.env -f infra/docker/docker-compose.dev.yml up -d --build

# Verify
curl http://localhost:8000/health
```

For the complete step-by-step guide, including seed login credentials, QA/production deployment procedures, and troubleshooting: [docs/deployment/environments.md](./docs/deployment/environments.md).

## Documentation

Full technical documentation lives in [`docs/`](./docs/), organized by topic:

| Section | Description |
|---|---|
| [`docs/business/`](./docs/business/) | Domain model, actors, business rules, functional and non-functional requirements |
| [`docs/architecture/`](./docs/architecture/) | System context, request flow, hexagonal pattern explanation |
| [`docs/backend/`](./docs/backend/) | The 5 NestJS microservices -- tech stack, entities, use cases, endpoints |
| [`docs/frontend/`](./docs/frontend/) | The 4 client apps -- tech stack, structure, routing |
| [`docs/database/`](./docs/database/) | PostgreSQL/MongoDB/Redis split, entity mapping, seed data |
| [`docs/api/`](./docs/api/) | Full endpoint reference per service |
| [`docs/infrastructure/`](./docs/infrastructure/) | Docker Compose topology, Kong API Gateway, monitoring |
| [`docs/deployment/`](./docs/deployment/) | CI/CD pipeline detail and deployment procedures |
| [`docs/adr/`](./docs/adr/) | Architecture Decision Records |

## Environments

| Environment | Domain | Branch | Deploy |
|---|---|---|---|
| Local | `localhost` | `dev` | Manual |
| QA | `mentorapredictqa.programacionwebuce.net` | `QA` | Automatic on push |
| Production | `mentorapredictprod.programacionwebuce.net` | `main` / `v*` tag | Automatic on push/tag |

## Contributing

We welcome contributions. Please read the [Contributing Guide](./CONTRIBUTING.md) before submitting a PR.

- **Branching**: `main` <- `QA` <- `dev` <- `feature/*` / `fix/*` / `chore/*`
- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/), enforced by commitlint
- **Before opening a PR**: `pnpm lint && pnpm build && pnpm test`

## License

This project is private and proprietary.
