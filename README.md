# MentoraPredict — Backend Monorepo

**Universidad Central del Ecuador · Programación Web · 2026**

> ⚠️ **Phase 0: Skeleton Only** — No business logic, no database connections, no functional endpoints exist in this phase. All files are structural placeholders for Sprint 1 implementation.

---

## Overview

MentoraPredict is an intelligent academic analytics system that analyzes student performance, calculates risk scores, and generates personalized recommendations to prevent academic failure at UCE.

---

## Monorepo Structure (Turborepo)

```
mentorapredict/
├── apps/
│   ├── auth-service/          NestJS — Authentication, JWT RS256, RBAC (RF-001–005)
│   ├── user-service/          NestJS — User profiles & role management (RF-014)
│   ├── academic-service/      NestJS — Faculties, subjects, grades, evaluations (RF-006–013)
│   ├── metrics-service/       NestJS — Average, trend, compliance index (RF-015–017) + Redis
│   ├── prediction-service/    Python/FastAPI — ML models, risk score (RF-019)
│   ├── recommendation-service/ NestJS — OpenAI improvement plans (RF-020, RF-022)
│   └── analytics-service/     NestJS — Risk classification, early alerts (RF-018, RF-021) + Redis
├── packages/
│   ├── shared/                Shared DTOs, interfaces, guards, utils
│   ├── tsconfig/              Shared TypeScript base config
│   └── eslint-config/         Shared ESLint rules
├── infra/
│   ├── docker/                Dockerfiles (future)
│   └── k8s/                   Kubernetes manifests (future)
├── .github/workflows/         CI/CD pipeline (future)
├── docker-compose.yml         Local dev environment (future)
├── turbo.json                 Turborepo pipeline config
└── package.json               Root workspace config
```

---

## Architecture: Hexagonal (Ports & Adapters)

Each microservice follows the same internal structure:

```
src/
├── domain/          Pure business rules — no framework, no I/O
├── application/     Use-cases, DTOs, port interfaces
└── infrastructure/  Controllers (REST), persistence, cache, external APIs
```

The **domain** layer has zero dependencies on NestJS, TypeORM, or any framework. The **infrastructure** layer implements the ports defined in the **application** layer.

---

## Microservices Summary

| Service | Runtime | RF Coverage | Redis |
|---|---|---|---|
| auth-service | NestJS | RF-001–005 | ✅ (sessions) |
| user-service | NestJS | RF-014 | — |
| academic-service | NestJS | RF-006–013 | — |
| metrics-service | NestJS | RF-015–017 | ✅ (dashboard cache) |
| prediction-service | Python/FastAPI | RF-019 | — |
| recommendation-service | NestJS | RF-020, RF-022 | — |
| analytics-service | NestJS | RF-018, RF-021 | ✅ (alert cache) |

---

## What is NOT implemented in this phase

- No business logic of any kind
- No database schemas or connections (PostgreSQL, MongoDB, Redis)
- No REST endpoints or controllers
- No ML models or AI integrations
- No CI/CD pipeline logic
- No Docker/Kubernetes configuration

---

## Getting Started

_Not available in Phase 0. See individual service READMEs for planned setup._

---

## Conventional Commits Reference

```
feat(scope): description      # New feature
fix(scope): description       # Bug fix
chore(scope): description     # Non-functional (deps, config)
docs(scope): description      # Documentation
build(scope): description     # Build system / tooling
ci(scope): description        # CI/CD changes
refactor(scope): description  # Code restructure, no behavior change
test(scope): description      # Test-related
```
