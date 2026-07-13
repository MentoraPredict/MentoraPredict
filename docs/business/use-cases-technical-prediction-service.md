# Use Case Specification — prediction-service

Formal, IEEE-style use case document for the application-layer use cases implemented in
`prediction-service`. Its single responsibility (per the service's own `BOUNDARY.md`) is to
combine the risk already computed by analytics-service (deterministic, RF-018) with
academic context from academic-service and produce, via OpenAI, a natural-language summary
and actionable recommendations. prediction-service never computes risk itself; OpenAI only
drafts text and recommendations, it does not decide risk levels.

**Actors**
- **Student** — requests predictions about their own academic risk.
- **Teacher** — views predictions for students in their subjects.
- **Admin** — views predictions across the institution.
- **System (internal)** — analytics-service triggering a deterministic recalculation after
  a risk change.

Total use cases in this service: **9**.

--------------------------------------------------------------------

## UC-PRED-01: Generate Global AI Prediction

**Actor(s):** Student (via UC-PRED-08), System (internal orchestration)

**Trigger:** A cooldown-gated request (UC-PRED-08) has been approved and must now produce
an AI-generated prediction covering the student's whole academic period.

**Preconditions:** A valid, non-cooled-down request context exists (validated by
UC-PRED-08). The student has at least one active enrollment for the current period.

**Main Flow:**
1. prediction-service calls analytics-service (`AnalyticsHttpClient`) to fetch the current
   deterministic risk snapshot across all of the student's subjects.
2. prediction-service calls academic-service (`AcademicHttpClient`) to fetch supporting
   academic context (e.g., syllabus topics, recent performance).
3. The combined risk snapshot and academic context are sent to the OpenAI API via
   `OpenAiRecommendationProvider`.
4. OpenAI returns a natural-language summary and a list of `RecommendationItem`s.
5. The system persists a `PredictionResult` (studentId, periodId, RiskSnapshot, summary,
   RecommendationItem[], modelVersion, generatedAt) and writes a full audit record to
   MongoDB (`prediction_logs`).
6. The system returns the natural-language summary and recommendations to the caller.

**Alternate Flows / Exceptions:**
- **A1 — analytics-service or academic-service unreachable:** the generation fails and no
  `PredictionResult` is persisted; the caller receives an error.
- **A2 — OpenAI API failure or timeout:** the generation fails; the attempt is still logged
  to `prediction_logs` for audit purposes where feasible.

**Postconditions:** A new `PredictionResult` exists in PostgreSQL and a corresponding audit
entry exists in MongoDB `prediction_logs`.

--------------------------------------------------------------------

## UC-PRED-02: Generate Per-Subject AI-Grounded Recommendation

**Actor(s):** Student (via UC-PRED-09), System (internal orchestration)

**Trigger:** A cooldown-gated per-subject request (UC-PRED-09) has been approved.

**Preconditions:** A valid, non-cooled-down request context exists for the given
student+subject pair. The student is actively enrolled in the target subject.

**Main Flow:**
1. prediction-service calls analytics-service for the deterministic risk snapshot scoped
   to the specific subject.
2. prediction-service calls academic-service for subject-specific context (syllabus
   topics, recent grades/check-ins).
3. The combined data is sent to OpenAI for a subject-scoped natural-language recommendation.
4. The result is persisted (Postgres, and audit-logged to MongoDB `prediction_logs`).
5. The system returns the subject-scoped recommendation.

**Alternate Flows / Exceptions:**
- **A1 — Student not enrolled in the target subject:** the request is rejected before
  calling OpenAI.
- **A2 — Upstream service failure:** same handling as UC-PRED-01/A1.

**Postconditions:** A subject-scoped AI recommendation is persisted and audit-logged.

--------------------------------------------------------------------

## UC-PRED-03: Recalculate Deterministic Per-Subject Prediction (System-Triggered)

**Actor(s):** System (internal — invoked by analytics-service as part of the recalculation
pipeline)

**Trigger:** analytics-service has just recalculated a student's subject metrics and risk
level (following a grade or check-in change) and calls prediction-service to refresh the
non-AI, rule-based per-subject prediction.

**Preconditions:** The caller holds a valid internal-scope JWT. A `StudentSubjectMetrics`
snapshot for the current academic week exists in analytics-service.

**Main Flow:**
1. analytics-service calls the internal recalculation endpoint with the student, subject,
   and period identifiers.
2. `InternalServiceGuard` verifies the `service:internal` scope.
3. prediction-service fetches the latest deterministic risk snapshot from analytics-service
   for that student+subject.
4. The system applies rule-based logic to derive `predictedRiskLevel`, `trendSlope`, and a
   short deterministic `recommendation` string (no OpenAI call involved).
5. The system upserts the `StudentSubjectPredictionEntity` for the current
   `academicWeek`/`academicYear`.

**Alternate Flows / Exceptions:**
- **A1 — No risk snapshot available yet for this student+subject:** the recalculation is
  skipped or deferred; no entity is written.

**Postconditions:** The `StudentSubjectPredictionEntity` for the current week reflects the
latest deterministic risk classification, independent of and faster than the AI-generated
flow (UC-PRED-01/02).

**Related:** downstream step of UC-7 (system-driven risk recalculation pipeline).

--------------------------------------------------------------------

## UC-PRED-04: Retrieve My Per-Subject Prediction

**Actor(s):** Student (own data only)

**Trigger:** The student opens a subject's dashboard/detail view.

**Preconditions:** The student is authenticated and enrolled in the subject.

**Main Flow:**
1. The student requests their own current prediction for a given subject.
2. `RolesGuard`/ownership logic scopes the query to the authenticated student's ID.
3. prediction-service fetches the latest `StudentSubjectPredictionEntity` for that
   student+subject+period.
4. The system returns the deterministic prediction (and, if available, the latest AI
   recommendation).

**Alternate Flows / Exceptions:**
- **A1 — No prediction computed yet:** the system returns an empty/placeholder state
  rather than an error, since UC-PRED-03 may not have run yet (e.g., no grades/check-ins
  recorded so far).

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-PRED-05: Retrieve a Specific Student's Per-Subject Prediction

**Actor(s):** Teacher (own subjects only), Admin (any subject)

**Trigger:** A teacher drills into a specific student's risk detail from their subject's
performance view (UC-9), or an admin inspects a student record.

**Preconditions:** The caller is authorized to view the target student's data (TEACHER must
own the subject; ADMIN unrestricted).

**Main Flow:**
1. The caller requests the prediction for a specific student+subject.
2. `RolesGuard` and subject-ownership checks authorize the request.
3. prediction-service fetches the corresponding `StudentSubjectPredictionEntity`.
4. The system returns the prediction data.

**Alternate Flows / Exceptions:**
- **A1 — Teacher does not own the subject:** the request is rejected.
- **A2 — No prediction computed yet:** same handling as UC-PRED-04/A1.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-PRED-06: List Per-Subject Predictions

**Actor(s):** Teacher, Admin

**Trigger:** A teacher opens the subject-wide risk overview (UC-9) and needs predictions
across all enrolled students, or an admin reviews predictions at scale.

**Preconditions:** The caller is authorized to view the target subject(s).

**Main Flow:**
1. The caller requests the list of predictions for a subject (optionally filtered by risk
   level or academic week).
2. `RolesGuard`/ownership checks authorize and scope the request.
3. prediction-service queries PostgreSQL for all matching `StudentSubjectPredictionEntity`
   rows.
4. The system returns the collection, typically ordered by risk severity.

**Alternate Flows / Exceptions:**
- **A1 — No predictions exist yet for the subject:** an empty list is returned.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-PRED-07: Retrieve Global Prediction History

**Actor(s):** Student (own history), Teacher/Admin (per role-appropriate scope)

**Trigger:** The student (or an authorized staff member) wants to see how the AI-generated
global prediction has evolved over time for a given period.

**Preconditions:** At least one `PredictionResult` exists for the target student/period.

**Main Flow:**
1. The caller requests the prediction history for a student and period.
2. Ownership/role checks authorize the request.
3. prediction-service queries PostgreSQL for all `PredictionResult` rows matching the
   student/period, ordered by `generatedAt`.
4. The system returns the chronological list of past global predictions.

**Alternate Flows / Exceptions:**
- **A1 — No prior predictions exist:** an empty list is returned.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-PRED-08: Request On-Demand Global Prediction (Cooldown-Gated)

**Actor(s):** Student

**Trigger:** The student clicks "generate prediction" for their whole academic period.

**Preconditions:** The student holds at least one active enrollment for the current period.

**Main Flow:**
1. The student submits a request for a new global prediction.
2. prediction-service checks whether at least 1 hour has elapsed since the student's last
   global prediction request (cooldown tracked per student).
3. If the cooldown has elapsed, the system invokes UC-PRED-01 (Generate Global AI
   Prediction) and returns its result.

**Alternate Flows / Exceptions:**
- **A1 — Cooldown not yet elapsed:** the request is rejected without calling OpenAI; the
  response includes the remaining wait time, which the frontend displays to the student.

**Postconditions:** On success, identical to UC-PRED-01's postconditions, plus the
cooldown timer is reset for this student.

**Related endpoint:** on-demand global prediction request endpoint (rate-limited, 1/hour
per student).

--------------------------------------------------------------------

## UC-PRED-09: Request On-Demand Per-Subject Prediction (Cooldown-Gated)

**Actor(s):** Student

**Trigger:** The student clicks "generate prediction" for a single subject.

**Preconditions:** The student is actively enrolled in the target subject.

**Main Flow:**
1. The student submits a request for a new per-subject prediction.
2. prediction-service checks whether at least 1 hour has elapsed since the last request for
   this specific student+subject pair (cooldown tracked independently from the global
   cooldown in UC-PRED-08).
3. If the cooldown has elapsed, the system invokes UC-PRED-02 (Generate Per-Subject
   AI-Grounded Recommendation) and returns its result.

**Alternate Flows / Exceptions:**
- **A1 — Cooldown not yet elapsed for this student+subject pair:** the request is rejected
  without calling OpenAI; the response includes the remaining wait time.

**Postconditions:** On success, identical to UC-PRED-02's postconditions, plus the
per-subject cooldown timer is reset.

**Related endpoint:** on-demand per-subject prediction request endpoint (rate-limited,
1/hour per student+subject).
