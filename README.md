# MentoraPredict

![MentoraPredict Banner](/assets/mentorapredict-banner.jpg)

  AI-Powered Academic Success and Student Retention Platform

  Predict academic risk, generate personalized recommendations, and empower educational institutions through intelligent analytics.


---

## Overview

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

---

### Turborepo Configuration

The monorepo is configured with Turborepo and pnpm workspaces.

| Item | Status |
|------|--------|
| Turborepo initialization | ✅ Completed |
| `turbo.json` configuration | ✅ Configured |
| Workspaces definition | ✅ Active |
| Global scripts | ✅ Available |
| Apps structure | ✅ 11 apps detected |
| Packages structure | ✅ 9 packages detected |

### Available Scripts

From the repository root:

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all dependencies |
| `pnpm dev` | Start all services in development mode |
| `pnpm build` | Build all projects |
| `pnpm lint` | Run linting across all projects |
| `pnpm clean` | Remove builds and caches |

### Workspace Structure

**Applications (11):**
- `apps/web` - Frontend placeholder (React)
- `apps/mobile` - Frontend placeholder (React Native)
- `apps/desktop` - Frontend placeholder (Electron)
- `apps/api-gateway` - API Gateway placeholder
- `apps/auth-service` - NestJS (pending implementation)
- `apps/user-service` - NestJS (pending implementation)
- `apps/academic-service` - NestJS (pending implementation)
- `apps/metrics-service` - NestJS (pending implementation)
- `apps/prediction-service` - Python/FastAPI (pending implementation)
- `apps/recommendation-service` - NestJS (pending implementation)
- `apps/analytics-service` - NestJS (pending implementation)

**Shared Packages (9):**
- `packages/ui` - React UI components
- `packages/types` - TypeScript types
- `packages/utils` - Common utilities
- `packages/services` - Shared services
- `packages/hooks` - React hooks
- `packages/config` - Global configurations
- `packages/shared` - DTOs and interfaces
- `packages/shared-config` - Shared configs
- `packages/shared-types` - Shared types
- `packages/shared-utils` - Shared utilities
- `packages/eslint-config` - ESLint configuration
- `packages/tsconfig` - TypeScript configuration

### Validation Results

| Command | Result |
|---------|--------|
| `pnpm install` | ✅ 17 workspaces detected |
| `pnpm build` | ✅ Executes successfully |
| `pnpm dev` | ✅ All services start |
| `pnpm lint` | ✅ Executes successfully |

> **Note for Windows developers:** Scripts use Unix commands (`rm -rf`). Use Git Bash or WSL for local development.
