# WebAssembly

MentoraPredict uses WebAssembly (WASM) in two independent places:

| Runtime | Module | Purpose |
| --- | --- | --- |
| Analytics service (Node.js) | Linear regression | Calculates academic trend slope and intercept |
| Web browser | Confetti particle engine | Updates animation physics for the course progress chart |

The backend module produces academic data. The browser module is a visual enhancement and does not affect grades, risk, or predictions.

## Academic trend in analytics-service

The adapter is located at:

```text
services/analytics-service/src/infrastructure/wasm/
├── linear-regression.wasm.ts
└── linear-regression.wasm.spec.ts
```

`linearRegression(values)` computes the accumulated values in TypeScript and passes them to the embedded WASM function:

```text
n, sumX, sumY, sumXY, sumXX -> WASM -> slope, intercept
```

The precompiled bytes are embedded in the TypeScript module, so the service does not require Rust, AssemblyScript, or a WASM compiler at build or runtime. The module instance is cached after its first load.

### Consumers

- `CalculateTrendUseCase` calculates a trend across at least three academic periods.
- `GetStudentSubjectMetricsUseCase` calculates the weekly trend for one student's subject when at least three metric records exist.

Classification uses the same thresholds:

| Slope | Classification |
| --- | --- |
| Greater than `0.5` | `ASCENDING` |
| Less than `-0.5` | `DESCENDING` |
| Otherwise | `STABLE` |

The period-based operation is exposed through:

```http
POST /api/v1/analytics/trend/:studentId?periodIds=id1,id2,id3
```

The authenticated student dashboard consumes weekly metrics through:

```http
GET /api/v1/analytics/students/me/subjects/:subjectId/metrics
```

That response includes the metric page and a nullable trend summary:

```json
{
  "data": [],
  "trend": {
    "slope": 0.75,
    "intercept": 12.5,
    "classification": "ASCENDING",
    "weeksAnalyzed": 4
  }
}
```

### Availability fallback

If the Node.js runtime cannot instantiate WebAssembly, the adapter caches that result and uses the equivalent TypeScript formula. The API contract remains unchanged, so WASM availability cannot take analytics-service offline.

## Web integration

`apps/web/src/services/course-analytics.service.ts` reads the backend trend summary. It adds two projected points to the student progress series using:

```text
projected average = intercept + slope × future week
```

Projected values are limited to the valid `0–20` grade range. `CourseProgressChart` then displays:

- the historical average as a solid line;
- the two projected points as a dashed line;
- an ascending, stable, or descending trend badge.

This projection is derived in the frontend from regression coefficients calculated by backend WASM. The frontend does not recalculate the regression.

## Browser confetti module

The browser also has a separate WASM module:

```text
apps/web/src/utils/wasm/
├── confetti-particles.c
├── confetti-particles-bytes.ts
└── confetti-particles.compiled-evidence.wasm
```

The C source exports linear memory, `get_particles_ptr`, and `step`. Its compiled bytes are embedded in `confetti-particles-bytes.ts` to avoid a runtime request for a `.wasm` asset and to keep Vite imports predictable.

`WasmConfettiBurst` stores up to 512 particles in WASM linear memory. On each animation frame, WASM updates position, velocity, gravity, and remaining life; React and Canvas handle spawning and rendering. The engine is loaded once and reused.

`CourseProgressChart` triggers the effect automatically once for an ascending trend. A user can replay it with the **Calculated with WebAssembly** control for any available classification.

If browser WASM is unavailable, `loadConfettiEngine()` returns `null` and the animation is skipped. The chart and all academic information remain usable.

## Data flow

```text
Academic metrics
  -> analytics-service regression WASM
  -> trend summary API response
  -> web service adds projected points
  -> CourseProgressChart renders trend
  -> browser confetti WASM animates particles when triggered
```

## Verification

Run from the repository root in Git Bash:

```bash
pnpm --filter @mentorapredict/analytics-service test -- --runInBand src/infrastructure/wasm/linear-regression.wasm.spec.ts
pnpm --filter @mentorapredict/analytics-service test -- --runInBand src/application/use-cases/__tests__/calculate-trend.use-case.spec.ts
pnpm --filter @mentorapredict/analytics-service build
pnpm --filter @mentorapredict/web build
```

For a manual web check, open a student course with at least three weekly metric records. Confirm the trend badge and dashed projection appear, and verify that an ascending trend triggers the full-screen confetti effect without changing chart data.

## Scope

WASM currently does not handle authentication, persistence, HTTP requests, weighted averages, compliance, risk classification, or AI recommendations. The regression module only supplies trend coefficients, while the browser module only advances animation physics.

See also [Web Architecture](./WEB_ARCHITECTURE.md) and [Web Technologies](./WEB_TECHNOLOGIES.md).
