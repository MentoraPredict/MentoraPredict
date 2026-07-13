# Use Case Specification — analytics-service

Formal, IEEE-style use case document for the application-layer use cases implemented in
`analytics-service`. This service owns academic risk analytics — computing per-student,
per-subject metrics (averages, compliance, attendance, trend, risk level), raising and
resolving alerts, and serving dashboards to admins, teachers, and students. It also hosts a
fully independent notifications sub-module responsible for creating, storing, and pushing
notifications, including real-time delivery over WebSocket (Socket.IO) and Expo push.

**Actors**
- **Student** — views their own metrics, risk, and notifications.
- **Teacher** — views subject-level metrics, alerts, and dashboards for their own subjects.
- **Admin** — views institution-wide dashboards and manages/resolves alerts.
- **System (internal)** — academic-service triggering recalculation after a grade or
  check-in change; prediction-service/analytics-service internal calls.

Total use cases in this service: **27** (21 core analytics + 6 in the notifications
sub-module).

--------------------------------------------------------------------
## Core Analytics Use Cases (21)
--------------------------------------------------------------------

## UC-ANLY-01: Calculate Student Average Grade

**Actor(s):** System (internal — invoked as a step of UC-ANLY-05)

**Trigger:** A grade recalculation is underway for a given student+subject+week.

**Preconditions:** Grade data for the student+subject is retrievable (directly persisted in
analytics-service's read model or fetched from academic-service).

**Main Flow:**
1. The system retrieves the student's recorded grades for the subject, weighted by
   evaluation weight.
2. The system checks the Redis cache (key pattern `metrics:<studentId>:<periodId>`, TTL
   300s) for a recent result.
3. If not cached, the system computes the weighted average grade and stores the result in
   Redis under the same key/TTL.
4. The computed average is returned to the caller (UC-ANLY-05).

**Alternate Flows / Exceptions:**
- **A1 — Cache hit:** step 3 is skipped; the cached value is returned directly, avoiding
  recomputation within the 300-second window.
- **A2 — No grades recorded yet:** the average is computed as undefined/zero, depending on
  business rule, and downstream risk classification treats it as insufficient data.

**Postconditions:** The Redis cache holds a fresh average value for this student/period for
up to 300 seconds.

--------------------------------------------------------------------

## UC-ANLY-02: Calculate Performance Trend Slope

**Actor(s):** System (internal — invoked as a step of UC-ANLY-05)

**Trigger:** A metrics recalculation needs the direction/steepness of a student's recent
performance trend for a subject.

**Preconditions:** A time series of recent grade/check-in data points exists for the
student+subject.

**Main Flow:**
1. The system collects the recent sequence of per-week performance data points.
2. The system invokes the WebAssembly-backed linear regression module
   (`linear-regression.wasm.ts`) to compute the trend slope.
3. The computed slope is returned to the caller (UC-ANLY-05) for use in risk
   classification (UC-ANLY-04).

**Alternate Flows / Exceptions:**
- **A1 — WASM module unavailable at runtime:** the system falls back to an equivalent
  pure-JavaScript implementation of the same linear regression formula, producing the same
  result without failing the calculation.
- **A2 — Insufficient data points (e.g., first week of the period):** the trend slope is
  reported as neutral/undefined rather than computed from too few points.

**Postconditions:** None beyond returning the value to the caller (pure calculation, no
persistence of its own).

--------------------------------------------------------------------

## UC-ANLY-03: Calculate Compliance Index

**Actor(s):** System (internal — invoked as a step of UC-ANLY-05)

**Trigger:** A metrics recalculation needs a compliance score derived from the student's
weekly check-in (task completion, attendance, study hours).

**Preconditions:** A `WeeklyCheckInEntity` for the current academic week exists (or is
absent, in which case compliance defaults to a "no data" state).

**Main Flow:**
1. The system reads the student's latest weekly check-in fields (taskCompletion,
   attendance, studyHours) as supplied by academic-service.
2. The system computes a normalized compliance index from these fields per the defined
   business formula.
3. The computed index is returned to the caller (UC-ANLY-05).

**Alternate Flows / Exceptions:**
- **A1 — No check-in submitted for the current week:** the compliance index is computed
  with a penalty/default-low value or flagged as missing data, per business rule.

**Postconditions:** None beyond returning the value to the caller.

--------------------------------------------------------------------

## UC-ANLY-04: Classify Risk Level

**Actor(s):** System (internal — invoked as the final step of UC-ANLY-05)

**Trigger:** The average, trend, and compliance figures for a student+subject+week have
just been computed.

**Preconditions:** UC-ANLY-01, UC-ANLY-02, and UC-ANLY-03 have produced their outputs for
the same student+subject+week.

**Main Flow:**
1. The system combines average grade, attendance rate, compliance index, and trend slope
   using the configured thresholds (`RISK_HIGH_THRESHOLD`, `RISK_CRITICAL_THRESHOLD`).
2. The system assigns one of four risk levels: `LOW`, `MEDIUM`, `HIGH`, or `CRITICAL`.
3. The classified risk level is returned to the caller (UC-ANLY-05), which persists it as
   part of the `StudentSubjectMetricsEntity`.

**Alternate Flows / Exceptions:**
- **A1 — Borderline values at a threshold boundary:** classification is deterministic and
  based on configured numeric thresholds; no ambiguity is introduced by design.

**Postconditions:** None beyond returning the classification to the caller.

--------------------------------------------------------------------

## UC-ANLY-05: Recalculate Student Subject Metrics (System-Triggered Orchestration)

**Actor(s):** System (internal — triggered by academic-service)

**Trigger:** academic-service detects a grade change (UC-4) or a check-in submission
(UC-5) and calls `POST /internal/recalculate`.

**Preconditions:** The caller holds a valid internal-scope JWT. The affected student is
actively enrolled in the affected subject.

**Main Flow:**
1. `InternalServiceGuard` verifies the `service:internal` scope on the incoming call.
2. The system invokes UC-ANLY-01 (average), UC-ANLY-03 (compliance), and reads attendance
   rate, then UC-ANLY-02 (trend), for the current academic week.
3. The system invokes UC-ANLY-04 to classify the resulting risk level.
4. The system upserts a `StudentSubjectMetricsEntity` snapshot for this
   student+subject+week (averageGrade, complianceIndex, attendanceRate, studyHours,
   comprehensionAvg, riskLevel, trendSlope).
5. If the newly computed risk level is `MEDIUM` or higher, the system invokes UC-ANLY-06
   (Generate Risk Alert).
6. The system calls prediction-service internally to trigger UC-PRED-03 (deterministic
   per-subject recalculation) and fires a fire-and-forget AI recommendation refresh
   (UC-PRED-02).
7. The system invokes UC-ANLY-22 (Create Notification) for the affected student and/or
   teacher.

**Alternate Flows / Exceptions:**
- **A1 — Risk level unchanged and below MEDIUM:** step 5 is skipped, no alert is generated.
- **A2 — Downstream prediction-service call fails:** the metrics snapshot and any alert
  already persisted in steps 2–5 are unaffected; the prediction refresh is best-effort.

**Postconditions:** A fresh `StudentSubjectMetricsEntity` exists for the current week;
possibly a new `Alert`; possibly a refreshed prediction; a notification has been queued for
delivery.

**Related:** this is the core of UC-7 (system-driven risk recalculation pipeline),
[business-logic.md §4.1].

--------------------------------------------------------------------

## UC-ANLY-06: Generate Risk Alert (Single)

**Actor(s):** System (internal — invoked as a step of UC-ANLY-05)

**Trigger:** A student's risk level for a subject has just crossed into `MEDIUM` or higher.

**Preconditions:** A `StudentSubjectMetricsEntity` snapshot with `riskLevel >= MEDIUM` has
just been computed.

**Main Flow:**
1. The system checks whether an unresolved `Alert` already exists for this
   student+subject+risk-level combination, to avoid duplicate alerts.
2. If none exists, the system creates a new `AlertEntity` (type, message, severity mapped
   from risk level, subjectId, periodId, `status = OPEN`).
3. The alert is persisted in PostgreSQL and made available to UC-ANLY-08/09.

**Alternate Flows / Exceptions:**
- **A1 — An unresolved alert already exists for this condition:** no duplicate is created;
  the existing alert may be left as-is or have its severity updated if it worsened.

**Postconditions:** A new (or updated) `AlertEntity` exists with `status = OPEN`.

--------------------------------------------------------------------

## UC-ANLY-07: Generate Risk Alerts (Batch)

**Actor(s):** System (internal — e.g., a scheduled or bulk recalculation sweep)

**Trigger:** A batch operation needs to evaluate alert conditions across multiple
students/subjects at once, rather than one at a time as in UC-ANLY-06.

**Preconditions:** A set of `StudentSubjectMetricsEntity` snapshots is available for
evaluation.

**Main Flow:**
1. The system iterates over the provided set of metrics snapshots.
2. For each snapshot with `riskLevel >= MEDIUM`, the system applies the same
   duplicate-avoidance and creation logic as UC-ANLY-06.
3. The system returns a summary of alerts created/skipped.

**Alternate Flows / Exceptions:**
- **A1 — Empty input set:** the system returns immediately with no alerts created.

**Postconditions:** Zero or more new `AlertEntity` rows exist in PostgreSQL.

--------------------------------------------------------------------

## UC-ANLY-08: Retrieve Alerts

**Actor(s):** Student (own alerts), Admin (all alerts)

**Trigger:** The student views their risk/alerts panel, or the admin reviews recent alerts
on the admin dashboard (UC-10).

**Preconditions:** None beyond authentication.

**Main Flow:**
1. The caller requests alerts, optionally filtered by status (`OPEN`/`RESOLVED`) or
   severity.
2. Ownership/role checks scope the query (a student only ever sees their own alerts).
3. The system queries PostgreSQL for matching `AlertEntity` rows.
4. The system returns the collection, typically most-recent-first.

**Alternate Flows / Exceptions:**
- **A1 — No alerts found:** an empty list is returned.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-ANLY-09: Retrieve Subject Alerts

**Actor(s):** Teacher (own subjects), Admin (any subject)

**Trigger:** The teacher opens a subject's performance view (UC-9) to review outstanding
alerts for their students.

**Preconditions:** The caller is authorized for the target subject (TEACHER must own it).

**Main Flow:**
1. The caller requests alerts scoped to a specific subject.
2. `RolesGuard`/ownership checks authorize the request.
3. The system queries PostgreSQL for `AlertEntity` rows matching the subject.
4. The system returns the collection, including per-student detail.

**Alternate Flows / Exceptions:**
- **A1 — Teacher does not own the subject:** the request is rejected.
- **A2 — No alerts for this subject:** an empty list is returned.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-ANLY-10: Resolve Alert

**Actor(s):** Teacher (own subjects), Admin (any subject)

**Trigger:** The teacher (or admin) has addressed the situation behind an open alert and
marks it resolved, optionally with a note (UC-9).

**Preconditions:** The target `AlertEntity` exists and has `status = OPEN`. The caller is
authorized for the underlying subject.

**Main Flow:**
1. The caller submits a resolution request for a given alert, optionally including a note.
2. `RolesGuard`/ownership checks authorize the request.
3. The system sets `status = RESOLVED`, `resolvedBy = <caller id>`, `resolvedAt = now()` on
   the `AlertEntity`, and persists the note if provided.
4. The system returns the updated alert.

**Alternate Flows / Exceptions:**
- **A1 — Alert already resolved:** the request is rejected or treated as a no-op,
  depending on idempotency policy.
- **A2 — Caller not authorized for the underlying subject:** the request is rejected.

**Postconditions:** The alert no longer appears in the open-alerts views (UC-ANLY-08/09).

--------------------------------------------------------------------

## UC-ANLY-11: Retrieve Aggregated Metrics

**Actor(s):** Admin

**Trigger:** The admin dashboard (UC-10, UC-ANLY-19) needs institution-wide aggregate
figures.

**Preconditions:** None beyond authentication as ADMIN.

**Main Flow:**
1. The admin (or the dashboard use case internally) requests aggregated metrics, optionally
   scoped by period.
2. The system aggregates `StudentSubjectMetricsEntity`/`StudentMetricsEntity` rows across
   all subjects (counts by risk level, overall averages).
3. The system returns the aggregate figures.

**Alternate Flows / Exceptions:**
- **A1 — No data for the requested period:** zeros/empty aggregates are returned rather
  than an error.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-ANLY-12: Retrieve Latest Subject Metric Snapshot

**Actor(s):** Student, Teacher, Admin (per role-appropriate scope)

**Trigger:** A view needs only the most recent week's metrics for a student+subject,
rather than the full history (contrast with UC-ANLY-13).

**Preconditions:** At least one `StudentSubjectMetricsEntity` exists for the
student+subject.

**Main Flow:**
1. The caller requests the latest metric snapshot for a student+subject.
2. Ownership/role checks authorize the request.
3. The system queries PostgreSQL for the most recent `StudentSubjectMetricsEntity` row by
   week.
4. The system returns that single snapshot.

**Alternate Flows / Exceptions:**
- **A1 — No snapshot exists yet:** the system returns a "no data" response rather than an
  error.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-ANLY-13: Retrieve Student Subject Metrics History

**Actor(s):** Student (own history), Teacher (own subjects), Admin

**Trigger:** A student, teacher, or admin views a trend chart of weekly metrics over the
period.

**Preconditions:** None beyond authentication and authorization for the target student.

**Main Flow:**
1. The caller requests the full weekly metrics history for a student+subject+period.
2. Ownership/role checks authorize the request.
3. The system queries PostgreSQL for all `StudentSubjectMetricsEntity` rows matching the
   student+subject+period, ordered by week.
4. The system returns the ordered time series.

**Alternate Flows / Exceptions:**
- **A1 — No history yet:** an empty list is returned.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-ANLY-14: Retrieve Student Subjects Overview

**Actor(s):** Student (own overview)

**Trigger:** The student opens their main dashboard (UC-ANLY-20) and needs a single-screen
summary of risk across all enrolled subjects.

**Preconditions:** The student holds at least one active enrollment.

**Main Flow:**
1. The student requests their subjects overview.
2. The system retrieves the latest `StudentSubjectMetricsEntity` for each of the student's
   active enrollments.
3. The system returns a per-subject summary (risk level, average, trend direction).

**Alternate Flows / Exceptions:**
- **A1 — No active enrollments:** an empty overview is returned.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-ANLY-15: Retrieve Subject Metrics Summary

**Actor(s):** Teacher (own subjects), Admin

**Trigger:** The teacher opens a subject's performance view (UC-9) and needs a
class-wide summary rather than per-student detail.

**Preconditions:** The caller is authorized for the target subject.

**Main Flow:**
1. The caller requests the metrics summary for a subject.
2. `RolesGuard`/ownership checks authorize the request.
3. The system aggregates the latest `StudentSubjectMetricsEntity` rows for all students
   enrolled in the subject (class average, risk-level distribution).
4. The system returns the summary.

**Alternate Flows / Exceptions:**
- **A1 — No enrolled students with computed metrics yet:** an empty/zeroed summary is
  returned.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-ANLY-16: Retrieve Subject Weekly Progress

**Actor(s):** Teacher, Admin

**Trigger:** A view needs a week-over-week progression chart for an entire subject (as
opposed to a single student, UC-ANLY-13).

**Preconditions:** The caller is authorized for the target subject.

**Main Flow:**
1. The caller requests weekly progress data for a subject over the period.
2. `RolesGuard`/ownership checks authorize the request.
3. The system aggregates `StudentSubjectMetricsEntity` rows by week across all enrolled
   students (e.g., weekly class average, weekly risk distribution).
4. The system returns the ordered weekly series.

**Alternate Flows / Exceptions:**
- **A1 — No data for some weeks (e.g., before the subject started):** those weeks are
  omitted or reported with null values, per the API contract.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-ANLY-17: Retrieve Student Risk Snapshot

**Actor(s):** Student (own), System (internal — consumed by prediction-service via
`AnalyticsHttpClient`)

**Trigger:** The student's dashboard needs a current risk summary, or prediction-service
needs the deterministic risk input for UC-PRED-01/02.

**Preconditions:** At least one `StudentSubjectMetricsEntity` exists for the student.

**Main Flow:**
1. The caller (human or internal service) requests the current risk snapshot for a
   student, optionally scoped to a subject.
2. Ownership checks (for human callers) or `InternalServiceGuard` (for internal callers)
   authorize the request.
3. The system compiles the current risk levels across the student's subjects from the
   latest `StudentSubjectMetricsEntity` rows.
4. The system returns the risk snapshot.

**Alternate Flows / Exceptions:**
- **A1 — No metrics computed yet:** the snapshot reflects an "insufficient data" state
  rather than a false `LOW` risk.

**Postconditions:** None (read-only operation); this is the authoritative, deterministic
risk source that prediction-service treats as ground truth (never recomputed there).

--------------------------------------------------------------------

## UC-ANLY-18: Retrieve Subject Risk Distribution

**Actor(s):** Teacher (own subjects), Admin

**Trigger:** The teacher's subject view (UC-9) needs a breakdown of how many enrolled
students fall into each risk level.

**Preconditions:** The caller is authorized for the target subject.

**Main Flow:**
1. The caller requests the risk distribution for a subject.
2. `RolesGuard`/ownership checks authorize the request.
3. The system counts enrolled students by current risk level (`LOW`/`MEDIUM`/`HIGH`/
   `CRITICAL`) using the latest `StudentSubjectMetricsEntity` per student.
4. The system returns the distribution.

**Alternate Flows / Exceptions:**
- **A1 — No students with computed metrics yet:** a zeroed distribution is returned.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-ANLY-19: Retrieve Admin Dashboard

**Actor(s):** Admin

**Trigger:** The admin opens the institution-wide dashboard (UC-10).

**Preconditions:** The caller holds the ADMIN role.

**Main Flow:**
1. The admin requests the admin dashboard data.
2. `RolesGuard` verifies the ADMIN role.
3. The system composes the response from UC-ANLY-11 (aggregated metrics), UC-ANLY-08
   (recent alerts), and active-user counts (via user-service data already synchronized or
   requested internally).
4. The system returns the consolidated dashboard payload.

**Alternate Flows / Exceptions:**
- **A1 — Partial data unavailable (e.g., no alerts yet):** the corresponding dashboard
  section renders empty rather than failing the whole request.

**Postconditions:** None (read-only, composite operation).

--------------------------------------------------------------------

## UC-ANLY-20: Retrieve Student Dashboard

**Actor(s):** Student

**Trigger:** The student logs in and lands on their personal dashboard.

**Preconditions:** The student holds at least one active enrollment for the current period.

**Main Flow:**
1. The student requests their dashboard data.
2. The system composes the response from UC-ANLY-14 (subjects overview), UC-ANLY-08
   (own alerts), and the latest global prediction summary (via prediction-service, where
   available).
3. The system returns the consolidated dashboard payload.

**Alternate Flows / Exceptions:**
- **A1 — No enrollments yet:** the dashboard renders an empty/onboarding state.

**Postconditions:** None (read-only, composite operation).

--------------------------------------------------------------------

## UC-ANLY-21: Retrieve Teacher Dashboard

**Actor(s):** Teacher

**Trigger:** The teacher logs in and lands on their personal dashboard.

**Preconditions:** The teacher owns at least one subject.

**Main Flow:**
1. The teacher requests their dashboard data.
2. The system composes the response from UC-ANLY-15 (per-subject metrics summaries across
   the teacher's owned subjects) and UC-ANLY-09 (open alerts across those subjects).
3. The system returns the consolidated dashboard payload.

**Alternate Flows / Exceptions:**
- **A1 — Teacher owns no subjects yet:** the dashboard renders an empty state.

**Postconditions:** None (read-only, composite operation).

--------------------------------------------------------------------
## Notifications Sub-Module Use Cases (6)
--------------------------------------------------------------------

The notifications sub-module is a self-contained hexagonal slice inside analytics-service
(own `application`/`domain`/`infrastructure` layers), wired into the same `AppModule`. It
is the delivery mechanism for alerts and other system events, over both a persisted
Postgres record and a real-time Socket.IO/Expo push channel.

## UC-ANLY-22: Create Notification

**Actor(s):** System (internal — invoked as the final step of UC-ANLY-05, or by other
flows such as UC-11's deactivation notice)

**Trigger:** A business event has occurred that a specific user (student, teacher, or
admin) should be informed of (e.g., a new alert, a deactivation notice).

**Preconditions:** The recipient user exists.

**Main Flow:**
1. The triggering use case (e.g., UC-ANLY-05) calls the notification creation logic with a
   recipient, type, title, and message, plus optional related-entity IDs
   (relatedAlertId/subjectId/studentId/periodId).
2. The system persists a new `NotificationEntity` in PostgreSQL with `status = UNREAD`.
3. The system looks up any registered `DeviceTokenEntity` rows for the recipient and
   dispatches a push notification via `ExpoPushClient` (mobile) and/or emits a
   `notification:new` Socket.IO event to room `user:{recipientId}` (web/desktop).
4. The operation completes; Postgres remains the source of truth regardless of whether the
   real-time/push delivery succeeds.

**Alternate Flows / Exceptions:**
- **A1 — Recipient has no registered device token and no active Socket.IO connection:**
  the notification is still persisted and will be visible the next time the recipient
  fetches UC-ANLY-23; no delivery failure blocks persistence.
- **A2 — Expo push delivery fails (e.g., invalid/expired token):** the failure is logged;
  the Postgres record is unaffected.

**Postconditions:** A new `NotificationEntity` exists with `status = UNREAD`; best-effort
real-time delivery has been attempted.

--------------------------------------------------------------------

## UC-ANLY-23: Retrieve My Notifications

**Actor(s):** Student, Teacher, Admin (any authenticated role, own notifications only)

**Trigger:** The user opens the notification bell dropdown (UC-12). The unread count is
fetched eagerly on every page load; the full read/unread history is fetched lazily, only
the first time the dropdown is opened, to reduce request volume.

**Preconditions:** None beyond authentication.

**Main Flow:**
1. The client requests the caller's notifications (optionally an unread-count-only variant
   for the eager badge fetch, and a full-list variant for the lazy dropdown fetch).
2. The system scopes the query to `recipientId = <caller id>`.
3. The system queries PostgreSQL for matching `NotificationEntity` rows, ordered
   most-recent-first.
4. The system returns the notifications (or just the unread count, depending on the
   requested variant).

**Alternate Flows / Exceptions:**
- **A1 — No notifications exist:** an empty list / zero count is returned.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-ANLY-24: Mark Notification as Read

**Actor(s):** Student, Teacher, Admin (own notifications only)

**Trigger:** The user clicks/opens an individual notification in the dropdown (UC-12).

**Preconditions:** The target `NotificationEntity` belongs to the caller and currently has
`status = UNREAD`.

**Main Flow:**
1. The caller requests that a specific notification be marked read.
2. Ownership checks confirm the notification belongs to the caller.
3. The system sets `status = READ` and `readAt = now()` on the `NotificationEntity`.
4. The system returns the updated notification; the client decrements the unread badge
   count.

**Alternate Flows / Exceptions:**
- **A1 — Notification does not belong to the caller:** the request is rejected.
- **A2 — Already read:** treated as an idempotent no-op.

**Postconditions:** The notification's `status` is `READ` and will no longer count toward
the unread badge (UC-ANLY-23).

--------------------------------------------------------------------

## UC-ANLY-25: Mark All Notifications as Read

**Actor(s):** Student, Teacher, Admin (own notifications only)

**Trigger:** The user clicks "mark all as read" in the notification dropdown (UC-12).

**Preconditions:** None beyond authentication; the operation is meaningful even if zero
notifications are currently unread.

**Main Flow:**
1. The caller requests that all of their notifications be marked read.
2. The system updates every `NotificationEntity` with `recipientId = <caller id>` and
   `status = UNREAD` to `status = READ`, `readAt = now()`.
3. The system returns a success confirmation; the client resets the unread badge to zero.

**Alternate Flows / Exceptions:**
- **A1 — No unread notifications exist:** the operation completes as a no-op.

**Postconditions:** No unread notifications remain for the caller.

--------------------------------------------------------------------

## UC-ANLY-26: Register Push Notification Device Token

**Actor(s):** Student, Teacher, Admin (mobile app, via Expo)

**Trigger:** The mobile app obtains an Expo push token on startup/login and registers it
with the backend so push notifications can be delivered to that device.

**Preconditions:** The caller is authenticated. A valid Expo push token has been obtained
client-side.

**Main Flow:**
1. The mobile client submits its Expo push token and platform (iOS/Android) via the
   register-device-token endpoint.
2. The system upserts a `DeviceTokenEntity` (userId, expoPushToken, platform), replacing
   any prior token for the same device/user if applicable.
3. The system returns a success confirmation.

**Alternate Flows / Exceptions:**
- **A1 — Token already registered for this user/device:** treated as an idempotent update
  rather than a duplicate insert.

**Postconditions:** A `DeviceTokenEntity` exists for the user, enabling delivery in
UC-ANLY-22 step 3.

--------------------------------------------------------------------

## UC-ANLY-27: Unregister Push Notification Device Token

**Actor(s):** Student, Teacher, Admin (mobile app, via Expo)

**Trigger:** The user logs out of the mobile app, or push permissions are revoked, and the
device token should no longer receive notifications.

**Preconditions:** A `DeviceTokenEntity` exists for the caller's device.

**Main Flow:**
1. The mobile client requests removal of its device token via the unregister-device-token
   endpoint.
2. The system deletes the matching `DeviceTokenEntity`.
3. The system returns a success confirmation.

**Alternate Flows / Exceptions:**
- **A1 — Token does not exist (already unregistered):** treated as an idempotent no-op.

**Postconditions:** The device no longer receives Expo push notifications; future
UC-ANLY-22 deliveries for this user fall back to Socket.IO (if connected) or persisted-only
delivery.
