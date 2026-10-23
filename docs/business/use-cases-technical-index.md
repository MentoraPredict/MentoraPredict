# Use Case Specification — MentoraPredict (Full Technical Catalog)

Formal, IEEE-style use case document covering all application-layer use cases implemented
across MentoraPredict's 5 backend microservices. Each use case is specified with: Actor(s),
Trigger, Preconditions, Main Flow, Alternate Flows/Exceptions, and Postconditions.

This catalog complements (does not replace) the narrative, business-level use case document
(13 cross-cutting use cases, UC-1 through UC-13) already produced for this project — this
document instead formalizes the full technical inventory of use-case classes at the
application layer of each microservice.

## Files in this catalog

| # | File | Service | Use cases | ID range |
|---|---|---|---|---|
| 1 | [use-cases-technical-auth-service.md](./use-cases-technical-auth-service.md) | auth-service | 12 | UC-AUTH-01 – UC-AUTH-12 |
| 2 | [use-cases-technical-user-service.md](./use-cases-technical-user-service.md) | user-service | 7 | UC-USER-01 – UC-USER-07 |
| 3 | [use-cases-technical-prediction-service.md](./use-cases-technical-prediction-service.md) | prediction-service | 9 | UC-PRED-01 – UC-PRED-09 |
| 4 | [use-cases-technical-analytics-service.md](./use-cases-technical-analytics-service.md) | analytics-service | 27 | UC-ANLY-01 – UC-ANLY-27 |
| 5 | [use-cases-technical-academic-service-part1.md](./use-cases-technical-academic-service-part1.md) | academic-service (1/2) | 29 | UC-ACAD-01 – UC-ACAD-29 |
| 6 | [use-cases-technical-academic-service-part2.md](./use-cases-technical-academic-service-part2.md) | academic-service (2/2) | 39 | UC-ACAD-30 – UC-ACAD-68 |

**Total: 123 formally specified use cases** (68 of the 69 academic-service use cases
named in the source technical inventory are individually specified; see the note at the
top of file 5 regarding the one-unit rounding discrepancy in the original count).

## Actors across the system

- **Student** — enrolled student, primary consumer of risk/prediction feedback.
- **Teacher** — owns subjects, records grades, writes observations, manages syllabus.
- **Admin** — manages the institution's academic catalog and users.
- **System (internal)** — automated cross-service triggers (recalculation, sync,
  eligibility checks), authenticated via a `service:internal`-scoped JWT and enforced by
  each service's `InternalServiceGuard`.

## Reading order recommendation

For a first read, follow the natural user journey rather than the file order:
1. `use-cases-technical-auth-service.md` (UC-AUTH-01/02) — how a user gets in.
2. `use-cases-technical-user-service.md` — how their profile is managed.
3. `use-cases-technical-academic-service-part1.md` + `part2.md` — the academic domain
   (catalog, enrollments, grades, check-ins) that everything else is built on.
4. `use-cases-technical-analytics-service.md` — how academic activity turns into risk
   metrics, alerts, and notifications (see UC-ANLY-05 for the central recalculation
   pipeline).
5. `use-cases-technical-prediction-service.md` — how risk becomes an AI-generated
   recommendation.

## Related documentation

- [use-cases.md](./use-cases.md) — the narrative, business-level use cases (UC-1–UC-13)
  this catalog complements.
- [functional-requirements.md](./functional-requirements.md) — RF-XXX requirement IDs
  referenced throughout.
- [business-logic.md](./business-logic.md) — the detailed business rules behind the
  recalculation pipeline (UC-ANLY-05) and other cross-cutting flows.
