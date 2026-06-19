# metrics-service

**MentoraPredict MVP Backend** | Port: 3004 | Runtime: NestJS/TypeScript

## Coverage

RF-015–017

## Description

Computes academic average, trend, and compliance index. Caches in Redis.

## Hexagonal Architecture

```
src/
├── domain/                  # Core business rules — zero framework dependencies
│   ├── entities/            # Domain entities (plain TS classes / Python dataclasses)
│   ├── value-objects/       # Immutable value types
│   └── services/            # Domain services (pure logic)
├── application/             # Use-cases — orchestrate domain + call ports
│   ├── use-cases/           # One file per use-case
│   ├── dtos/                # Input/output data transfer objects
│   └── ports/
│       ├── input/           # Primary ports — interfaces that controllers call
│       └── output/          # Secondary ports — interfaces that adapters implement
└── infrastructure/          # Adapters — framework, DB, HTTP, cache, external APIs
    ├── controllers/         # REST controllers (primary adapters)
    ├── persistence/         # TypeORM/Mongo repositories (secondary adapters)
    ├── cache/               # Redis adapter (if applicable)
    ├── external/            # Third-party API clients (OpenAI, etc.)
    └── config/              # Environment config & NestJS module setup
```

## Status

> ⚠️ **Skeleton only** — no business logic, no DB connections, no endpoints.
> Implementation starts in Sprint 1.

## Getting Started

_Not available in this phase. See root `docker-compose.yml` for infra._
