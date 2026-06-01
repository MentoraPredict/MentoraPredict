# analytics-service

**MentoraPredict — MVP Backend**

## Description

Classifies student academic risk (Low/Medium/High — RF-018) and triggers early alerts (RF-021). Consumes prediction scores from prediction-service. Uses Redis cache.

## Architecture: Hexagonal (Ports & Adapters)

```
src/
├── domain/                  # Core business rules (no framework dependencies)
│   ├── entities/            # Domain entities
│   ├── value-objects/       # Immutable value types
│   └── services/            # Domain services
├── application/             # Use-cases and orchestration
│   ├── use-cases/           # One file per use-case
│   ├── dtos/                # Input/output data shapes
│   └── ports/               # Interfaces (input & output ports)
└── infrastructure/          # Adapters — framework, DB, HTTP, cache
    ├── controllers/         # NestJS REST controllers (primary adapters)
    ├── persistence/         # TypeORM repositories (secondary adapters)
    ├── cache/               # Redis adapter (if applicable)
    ├── external/            # Third-party API clients
    └── config/              # Environment & module config
```

## Status

> ⚠️ **Phase 0 — Structure only.**
> No business logic, no database connections, no endpoints implemented.
> All files are empty placeholders awaiting Sprint 1 implementation.

## Tech Stack

- **Runtime:** Node.js + NestJS
- **Language:** TypeScript
- **ORM:** TypeORM (PostgreSQL)
- **Auth:** JWT RS256 (via shared guards)
- **Docs:** Swagger / OpenAPI

## Getting Started

_Not available in this phase._
