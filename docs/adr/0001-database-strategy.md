# ADR 0001 — Database Strategy

Status: Proposed — partially superseded

> **Update:** MongoDB was dropped from the stack. Teacher observations, prediction audit logs and dataset versions now live in PostgreSQL tables (using `jsonb` for the schema-loose parts), so the only data stores in use are PostgreSQL and Redis. The text below is kept as the original historical record; see [../database/database-architecture.md](../database/database-architecture.md) for the current state.

Context

- The system needs both relational and document storage: relational for canonical domains (users, academic records) and document store for AI artifacts, models metadata, and feature stores.

Decision

- Use PostgreSQL as primary relational DB (ACID guarantees) for user, academic, metrics data.
- Use MongoDB for prediction-service to store prediction outputs, generated recommendation plans, feature snapshots, session artifacts, and non-relational documents.
- Use Redis for caching, short-lived refresh token store, and rate limiting.

Consequences

- Backups and restore procedures need to cover both Postgres and Mongo.

Notes

- Use separate Postgres schemas per bounded context (e.g., `user_service`, `academic_service`).
- Ensure network policies in production limit DB access to relevant services only.
