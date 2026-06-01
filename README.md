<<<<<<< HEAD
# MentoraPredict

![MentoraPredict Banner](/assets/mentorapredict-banner.jpg)

  AI-Powered Academic Success and Student Retention Platform

  Predict academic risk, generate personalized recommendations, and empower educational institutions through intelligent analytics.

=======
# MentoraPredict — Backend Monorepo

**Universidad Central del Ecuador · Programación Web · 2026**

> ⚠️ **Phase 0: Skeleton Only** — No business logic, no database connections, no functional endpoints exist in this phase. All files are structural placeholders for Sprint 1 implementation.
>>>>>>> feature/PWMP-59-Design-system-architecture-Hexagonal

---

## Overview

<<<<<<< HEAD
MentoraPredict is an AI-powered educational platform designed to help educational institutions identify students at risk of academic failure or dropout before critical intervention opportunities are missed.

The platform combines predictive analytics, recommendation systems, academic intelligence, and performance monitoring to transform educational data into actionable insights for students, teachers, and administrators.

By leveraging modern cloud-native technologies and artificial intelligence, MentoraPredict aims to improve student retention, support academic success, and enable data-driven decision-making across educational organizations.

---

## Problem Statement

Educational institutions generate large volumes of academic data, yet identifying at-risk students often remains a reactive process.

As a result, institutions face challenges such as:

* High dropout rates
* Delayed academic interventions
* Limited visibility into student performance trends
* Lack of personalized academic guidance
* Difficulty measuring the effectiveness of support programs

MentoraPredict addresses these challenges through predictive analytics, intelligent recommendations, and early warning capabilities.

---

## System Objective

The primary objective of MentoraPredict is to provide an intelligent academic support platform capable of:

* Predicting dropout risk before critical academic decline occurs
* Generating personalized study recommendations
* Supporting educators through actionable analytics
* Improving institutional retention strategies
* Enabling proactive academic intervention

---

## Architecture Overview

MentoraPredict follows a microservices-based architecture deployed through containerized services.

The platform is organized into three primary layers:

### Frontend Layer

Provides user-facing applications for different platforms:

* Web Application (React)
* Mobile Application (React Native)
* Desktop Application (Electron)

### Backend Layer

Business capabilities are implemented through independent microservices:

* Authentication and authorization
* Academic management
* User management
* Metrics and reporting
* Recommendations
* Predictions and analytics

### Intelligence & Analytics Layer

Responsible for processing educational data and generating insights through:

* Predictive models
* Recommendation engines
* Academic analytics
* Performance indicators

### API Gateway

All client applications communicate through a centralized API Gateway.

The API Gateway is responsible for:

* Request routing
* Authentication validation
* Service discovery
* Cross-cutting concerns
* API aggregation

---

## Core Platform Capabilities

### Early Risk Detection

Identify students at risk of academic failure or dropout using predictive models.

### Personalized Recommendations

Generate study plans and academic recommendations tailored to individual student needs.

### Academic Analytics

Provide actionable metrics and dashboards for teachers and administrators.

### Intelligent Course Suggestions

Recommend academic paths based on performance history and learning trends.

### Early Alert System

Notify stakeholders when intervention opportunities are detected.

---

## Monorepo Structure

MentoraPredict uses a Turborepo-based monorepo architecture.

```text
mentorapredict/
│
├── apps/
│   ├── web/
│   ├── mobile/
│   ├── desktop/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── user-service/
│   ├── academic-service/
│   ├── metrics-service/
│   ├── prediction-service/
│   ├── recommendation-service/
│   └── analytics-service/
│
├── packages/
│   ├── ui/
│   ├── types/
│   ├── utils/
│   ├── services/
│   ├── hooks/
│   └── config/
│
├── docs/
├── assets/
├── .github/
├── turbo.json
└── README.md
```

### Apps

Contains deployable applications and microservices.

### Packages

Contains reusable shared code used across multiple applications and services.

---

## Technology Stack

### Frontend

| Technology   | Version |
| ------------ | ------- |
| React        | 18.x    |
| React Native | 0.73.x  |
| Electron     | 27.x    |
| TypeScript   | 5.x     |

### Backend

| Technology | Version |
| ---------- | ------- |
| NestJS     | 11.x    |
| FastAPI    | 0.115.x |
| Node.js    | 22.x    |
| Python     | 3.12.x  |

### Data & Caching

| Technology | Version |
| ---------- | ------- |
| PostgreSQL | 15.x    |
| MongoDB    | 6.x     |
| Redis      | 7.x     |

### Infrastructure

| Technology     | Version |
| -------------- | ------- |
| Docker         | 28.x    |
| Docker Compose | Latest  |
| AWS EC2        | Managed |
| Turborepo      | 2.x     |

### CI/CD

| Technology     | Purpose                                      |
| -------------- | -------------------------------------------- |
| GitHub Actions | Continuous Integration & Deployment (Future) |

---

## Prerequisites

Before working with the project, ensure the following software is installed:

* Node.js 22.x or later
* pnpm 10.x or npm
* Docker
* Docker Compose
* Python 3.12.x
* Git

---

## Installation & Local Development

> Setup instructions will be provided once the first functional services are available.

Future documentation will include:

```bash
pnpm install
pnpm dev
```

as well as instructions for:

* Dependency installation
* Local environment configuration
* Running the monorepo
* Docker-based development
* Turborepo workflows

---

## Environment Variables

Each service maintains its own environment configuration.

Environment templates will be provided through:

```text
.env.example
```


Sensitive information must never be committed to source control.

---

## Architecture Flow

The platform follows a gateway-centric communication model.

```text
Frontend Applications
        │
        ▼
    API Gateway
        │
        ▼
  Microservices Layer
        │
        ▼
 Databases & Analytics
```

### Request Flow

1. Users interact with Web, Mobile, or Desktop applications.
2. Requests are sent to the API Gateway.
3. The API Gateway validates authentication and routes requests.
4. Microservices process business operations independently.
5. Services communicate with their respective databases.
6. Prediction and recommendation services generate intelligent insights.
7. Responses are returned through the API Gateway.

### Containerization

All applications and services are intended to run inside Docker containers to ensure environment consistency across development and deployment stages.

---

## Contributing

We welcome contributions from all project members.

### Branch Strategy

The project follows a simplified GitFlow model.

Main branches:

```text
main
qa
```

Working branches:

```text
feature/*
bugfix/*
hotfix/*
chore/*
docs/*
```

### Commit Convention

The project follows Conventional Commits.

Examples:

```bash
feat(auth): implement JWT authentication

fix(api): resolve enrollment validation error

docs(readme): update project overview
```

### Development Guidelines

* Keep services independent and loosely coupled
* Follow established coding standards
* Create Pull Requests for all changes
* Keep documentation updated
* Reuse shared packages whenever possible

---

## Vision

MentoraPredict aims to empower educational institutions through predictive analytics, intelligent recommendations, and proactive academic support.

By transforming educational data into actionable insights, the platform seeks to improve student outcomes, strengthen retention strategies, and enable evidence-based decision-making at every level of the institution.
=======
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
>>>>>>> feature/PWMP-59-Design-system-architecture-Hexagonal
