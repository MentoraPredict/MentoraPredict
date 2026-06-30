# analytics-service

**MentoraPredict Backend** | Port: 3004 | Runtime: NestJS/TypeScript

## Coverage

RF-015 to RF-018, RF-021, RF-023 to RF-025.

## Description

Owns academic analytics for MentoraPredict: student averages, trends,
compliance calculations, risk classification, early alerts, dashboards, and
aggregated metrics. It consumes canonical academic data from
`academic-service` and persists derived metric snapshots in `student_metrics`.

## Metrics Endpoints

- `GET /api/v1/analytics/metrics/overview`
- `GET /api/v1/analytics/metrics/users/:userId`
- `GET /api/v1/analytics/metrics/subjects/:subjectId`

Each endpoint accepts an optional `periodId` query parameter when the caller
needs period-specific metrics. Without `periodId`, analytics returns the latest
available metric snapshots per student.

## Hexagonal Architecture

```text
src/
├── domain/                  # Core business rules
├── application/             # Use-cases and ports
└── infrastructure/          # Controllers, persistence, cache, HTTP adapters
```
