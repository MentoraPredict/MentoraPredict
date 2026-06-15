# ADR 0001 — Database Strategy

Status: Proposed

Context
- The system needs both relational and document storage: relational for canonical domains (users, academic records) and document store for AI artifacts, models metadata, and feature stores.

Decision
- Use PostgreSQL as primary relational DB (ACID guarantees) for user, academic, metrics data.
- Use MongoDB for prediction-service and recommendation-service to store model outputs, feature vectors, session artifacts, and non-relational documents.
- Use Redis for caching, short-lived refresh token store, and rate limiting.

Consequences
- Developers must maintain migration scripts for Postgres (Flyway or TypeORM migrations).
- Backups and restore procedures need to cover both Postgres and Mongo.

Notes
- Use separate Postgres schemas per bounded context (e.g., `user_service`, `academic_service`).
- Ensure network policies in production limit DB access to relevant services only.
