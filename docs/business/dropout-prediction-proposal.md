# Dropout Prediction — Design Proposal (Not Implemented)

> **Status: proposal only.** Nothing described in this document exists in the codebase today. This is deliberately kept separate from [business-logic.md](./business-logic.md), [functional-requirements.md](./functional-requirements.md), and [use-cases.md](./use-cases.md) — those describe verified, running behavior; this describes a future capability, so it should never be read as current-state documentation. Produced from a dedicated audit run specifically to answer "does dropout prediction exist, and how could it be built correctly" — see the Sources section at the end for exactly what was checked.

## 1. Why this document exists

MentoraPredict's marketing copy (`PITCH-GUION.md`, `PRESENTACION.md`, and a static "+25% Retención académica" stat on the landing page) talks about reducing dropout. The audit behind this document confirmed that claim is **not backed by any implemented feature** — there is no dropout entity, use case, endpoint, or even a functional requirement (RF-001 through RF-025 cover none of this). This document defines, precisely, what would need to be true for that claim to become real.

## 2. The conceptual distinction that matters

MentoraPredict today measures **subject-level academic risk**: the probability a student fails one specific subject, computed weekly from grades, attendance, and compliance within a single academic period.

**Institutional dropout** is a different outcome entirely: a student abandoning their program/institution altogether, observable only *across* academic periods. `EnrollmentStatus.WITHDRAWN` — which already exists — is scoped to (student, subject, period); it means "this student left this one subject," not "this student left the institution." Conflating the two would be a real design mistake if this proposal is ever implemented.

## 3. The blocker that has to be solved before anything else

Dropout is, by definition, a pattern only observable over time: "enrolled in period N, not enrolled in period N+1." The audit confirmed:

- 8 academic periods exist in the schema (2025-A through 2028-B), but **100% of seeded enrollments, grades, and weekly check-ins live inside a single period** (2026-A, the only `ACTIVE` one). Both `FINISHED` periods (2025-A, 2025-B) are completely empty.
- `CalculateTrendUseCase` (the one genuine cross-period computation that already exists — see §5) already enforces a minimum of 3 `periodIds` for its regression to be meaningful. The same minimum would apply here.

**No dropout calculation — rule-based or ML — can be validated against today's data.** This isn't a logic problem, it's a data problem: at least 2-3 consecutive periods of real (or realistically-simulated) enrollment history must exist before any of the design below can be tested, not just implemented.

## 4. Existing signals inventory (what's already captured, unused for this purpose)

Nothing today combines these into a dropout signal, but nearly every relevant input already exists in the schema:

| Signal | Where it lives | Why it matters for dropout |
|---|---|---|
| Enrollment history across periods (`enrollments.periodId`, `IEnrollmentRepository.findByStudentId` — no period filter) | academic-service | The foundation: did the student enroll in the next period or not |
| Subject count per period | academic-service | A drop from, say, 5 subjects to 2 across periods is a classic precursor |
| Per-subject withdrawals (`WITHDRAWN`) accumulated within the current period | academic-service | Many withdrawals in one period often precedes leaving entirely |
| Global average per period + cross-period trend (`ASCENDING/STABLE/DESCENDING`, `CalculateTrendUseCase`) | analytics-service | The only cross-period computation that already exists and is wired to a live endpoint |
| Compliance index and attendance (weekly, aggregable to period level) | academic-service (`weekly_check_ins`) | Declining engagement within a period |
| Self-reported emotional state (`GREAT / GOOD / NEUTRAL / BAD / CRITICAL`) | academic-service (`weekly_check_ins`) | A direct wellbeing signal — in real dropout literature, socio-emotional factors weigh as much as academic ones |
| Frequency of HIGH/CRITICAL alerts | analytics-service | Sustained high-severity alerts correlate with eventual withdrawal |
| Teacher observations, especially type `BEHAVIORAL`/`ATTENDANCE` | academic-service (`teacher_observations`) | Qualitative early-warning signal, arguably more relevant to dropout than `ACADEMIC`/`PERFORMANCE` observation types |

## 5. What already exists and is the closest building block

`services/analytics-service/src/application/use-cases/calculate-trend.use-case.ts` (`CalculateTrendUseCase`, backing RF-016, `POST /api/v1/analytics/trend/:studentId?periodIds=...`):

- Takes a caller-supplied list of ≥3 `periodIds`.
- Pulls the student's `globalAverage` per period from `academic_metrics_snapshots`, defaulting missing periods to `0`.
- Runs the same WASM linear-regression module used for weekly trend, over the per-period averages.
- Classifies `ASCENDING / STABLE / DESCENDING` by slope threshold.
- Persists an audit record to the `dataset_versions` table (`DatasetVersionRepository`, `type: 'trend'`).

This is real, production, cross-*academic-period* (semester-level) code — the strongest existing foundation to build on. Its real limitations for this purpose: it's caller-driven (no auto-discovery of a student's period history), it only aggregates `globalAverage` (not enrollment counts, compliance, alerts, or emotional state), and it classifies *performance trend*, not dropout risk — it produces no alert, no persisted student-level risk record, no notification.

## 6. Proposed operational definition of the event

> A **dropout event** for a student is: an `ACTIVE` enrollment in period N, and **zero enrollments of any status** in period N+1, confirmed a reasonable window after period N+1 has started (e.g. 2 weeks in) — so "hasn't enrolled yet" isn't misread as "isn't going to."

This is a retrospective label — exactly what you'd need recorded before you could ever validate a predictive score against real outcomes.

## 7. Proposed calculation method

With ~50 seeded students, there is nowhere near enough historical data to train a real statistical model (logistic regression, gradient boosting, etc. need hundreds to thousands of labeled dropout/non-dropout cases to avoid overfitting). The right approach — and the one consistent with how the rest of this system already works — is a **rule-based, weighted composite score**, not a trained ML model:

- Declining average across 2+ consecutive periods (high weight)
- Falling compliance/attendance period-over-period
- Reduced subject count period-over-period
- Accumulated per-subject withdrawals within the current period
- Sustained `BAD`/`CRITICAL` self-reported emotional state across several weeks
- Frequency of `HIGH`/`CRITICAL` alerts within the period
- Recent teacher observations of type `BEHAVIORAL`/`ATTENDANCE`

Each signal normalized and weighted into a 0–100 score — the same shape as the existing per-subject `risk_score`, just aggregated at **student-period** granularity instead of student-subject-week.

This keeps faith with the system's existing design principle, stated explicitly elsewhere in this doc set: **risk is deterministic and auditable first; AI only explains it afterward.** A dropout score should follow the same rule, not become the one place in the system where a black-box model decides something consequential.

## 8. Proposed architecture fit

- A new use case in **analytics-service** (the natural owner — it already owns risk and trend): e.g. `CalculateDropoutRiskUseCase`, run at the **close of each period**, not on the existing real-time weekly pipeline — the "did they re-enroll" signal can only be confirmed once the next period has actually started.
- A new table analogous to `academic_risk` but at student-period granularity (e.g. `student_dropout_risk`), generating an **institutional** alert (for ADMIN, not just the student's teacher).
- **prediction-service** would follow the exact pattern it already uses for academic risk: take the deterministic score, ask OpenAI to draft an explanation and a retention-focused recommendation. Same "deterministic risk first, AI-generated text second" boundary already enforced for subject-level prediction.

## 9. Honest limitations

- Nothing here can be empirically validated against today's single-period seed data. The logic can be built; it cannot be proven to work without real multi-period history.
- Real-world dropout-prediction literature leans heavily on factors this system's data model **does not capture at all**: socioeconomic status, scholarship/financial-aid standing, employment, commute/modality (in-person vs. remote), first-generation-university status. Adding these would be a genuine scope expansion — from an academic data domain into a socioeconomic one — not just a new query over existing tables.
- The system today is subject-centric by design. A real dropout capability needs a longitudinal, student-centric view that doesn't exist as a first-class concept in the current data model.

## 10. Prerequisites before implementation should start

1. Seed (or collect) realistic enrollment, grade, and check-in data across at least 3 consecutive academic periods, including some students who genuinely stop enrolling, so the composite score's weights can be sanity-checked against known outcomes.
2. Decide, with the institution, whether socioeconomic/administrative data is in scope — if yes, this becomes a data-model expansion project before it becomes an analytics project.
3. Extend `functional-requirements.md`'s catalog with real RF codes for this feature once it's greenlit, so it stops being marketing language unbacked by a requirement.

## Sources

This proposal is grounded in a dedicated codebase audit that checked: `EnrollmentEntity`/`EnrollmentRepository` (academic-service) for cross-period query support; `database/seeds/postgres/03_academicPeriods.sql` and `05_enrollments.sql` for the real seeded period/enrollment distribution; `UserProfileEntity`/`UserEntity` status fields (user-service, auth-service) for any academic-standing concept beyond account activation; a repo-wide grep for cross-period aggregation logic, landing on `CalculateTrendUseCase` as the only real match; and a repo-wide, case-insensitive grep for `dropout|desercion|deserción|retention|abandono|retención` across `contracts/openapi-contracts.yaml`, `data-models/data-models.yaml`, and all application code, which returned no hits outside of static marketing copy.
