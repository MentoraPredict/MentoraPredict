# MentoraPredict — Backend Monorepo

**Universidad Central del Ecuador · Programación Web · 2026**
**Phase 1 — Contracts, Data Models & Infra Design**

---

## Overview

MentoraPredict is an intelligent academic analytics system that predicts student failure risk, classifies academic risk levels, and generates personalized improvement plans using ML and OpenAI GPT.

---

## Monorepo Structure

```
mentorapredict/
├── services/                        All backend microservices
│   ├── auth-service/         :3001  NestJS — RF-001–005
│   ├── user-service/         :3002  NestJS — RF-014
│   ├── academic-service/     :3003  NestJS — RF-006–013
│   ├── metrics-service/      :3004  NestJS — RF-015–017
│   ├── analytics-service/    :3005  NestJS — RF-018,RF-021,RF-023–025
│   ├── prediction-service/   :3006  Python/FastAPI — RF-019
│   └── recommendation-service/:3007 NestJS — RF-020,RF-022
├── packages/
│   ├── shared-types/                Enums, interfaces, constants, DTOs
│   ├── shared-config/               Config shape interfaces
│   └── shared-utils/                Pure utility functions
├── infra/
│   ├── docker-compose.yml           PostgreSQL + MongoDB + Redis
│   └── .env.example                 All required env variables
├── contracts/
│   └── openapi-contracts.yaml       Full API contract design
├── data-models/
│   └── data-models.yaml             PostgreSQL DER + MongoDB + Redis design
├── packages/
│   └── shared-packages-design.yaml  Shared packages specification
├── sprint-plan/
│   └── sprint-plan-and-checklist.yaml Sprint plan + validation checklist
├── turbo.json
└── package.json
```

---

## Architecture: Hexagonal (Ports & Adapters)

```
┌──────────────────────────────────────────┐
│               domain/                    │  ← Pure business rules, no framework
│  entities/  value-objects/  services/    │
├──────────────────────────────────────────┤
│             application/                 │  ← Use-cases, orchestration
│  use-cases/   dtos/   ports/             │
│               ├── input/  (interfaces)   │
│               └── output/ (interfaces)   │
├──────────────────────────────────────────┤
│            infrastructure/               │  ← Adapters: NestJS, TypeORM, Redis
│  controllers/ persistence/ cache/        │
│  external/    config/                    │
└──────────────────────────────────────────┘
```

**Rule:** Dependencies point inward only. `domain` knows nothing about NestJS or TypeORM. `infrastructure` implements ports defined in `application`.

---

## Quick Start (Infra Only)

```bash
# 1. Copy environment variables
cp infra/.env.example .env

# 2. Start datastores
npm run infra:up
# → PostgreSQL :5432 | MongoDB :27017 | Redis :6379

# 3. Optional: start UI tools
docker compose -f infra/docker-compose.yml --profile tools up -d
# → Mongo Express :8082 | Redis Commander :8081

# 4. Verify health
docker compose -f infra/docker-compose.yml ps
```

---

## Data Stack

| Store | Purpose | Port |
|---|---|---|
| PostgreSQL 16 | Relational data (users, grades, enrollments, risk) | 5432 |
| MongoDB 7 | AI logs, GPT plans, ingestion jobs, audit trail | 27017 |
| Redis 7.2 | Sessions, metrics cache, dashboard cache | 6379 |

---

## Tech Stack

| Layer | Technology |
|---|---|
| NestJS services | Node.js 20 + NestJS 10 + TypeScript 5 |
| ORM | TypeORM + PostgreSQL |
| ML service | Python 3.11 + FastAPI + scikit-learn |
| Auth | JWT RS256 (asymmetric keys) |
| Cache | Redis via ioredis |
| AI | OpenAI GPT-4o |
| Monorepo | Turborepo + npm workspaces |
| Containers | Docker + Docker Compose |

---

## Phase Status

| Phase | Status |
|---|---|
| Phase 0: Skeleton | ✅ Done |
| Phase 1: Contracts + Data Models + Infra | ✅ Done |
| Phase 2: Sprint 1 — Auth + User | 🔲 Pending |
| Phase 3: Sprint 2 — Academic Core | 🔲 Pending |
| Phase 4: Sprint 3 — Metrics + Analytics | 🔲 Pending |
| Phase 5: Sprint 4 — Prediction + Recommendations | 🔲 Pending |
| Phase 6: Sprint 5 — Dashboards + Hardening | 🔲 Pending |

---

## Shared Packages Rules (RNF-034)

Packages may contain: **types, enums, interfaces, pure functions, config shapes**.
Packages must NOT contain: **business logic, DB queries, HTTP calls, framework code**.
