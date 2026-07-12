# ADR 0004 — NestJS v10/v11 Version Mismatch: Workaround in shared-logger, Root Cause Unresolved

Status: Accepted (workaround only — root cause still open)

Context
- `academic-service` runs `@nestjs/common@^11.1.24` (and matching `@nestjs/core`, `@nestjs/config`, `@nestjs/swagger`, `@nestjs/typeorm`, TypeScript `^6.0.3`), while the other 4 services (`auth-service`, `user-service`, `analytics-service`, `prediction-service`) all run `@nestjs/common@^10.3.0`. This split predates the structured-logging work and its origin (an intentional early upgrade vs. an accidental one) is not documented anywhere in the repo.
- While building `packages/shared-logger` (a workspace package consumed by all 5 services to standardize `nestjs-pino`-based JSON logging and correlation-id propagation), `createLoggerModule()`'s return type and `attachCorrelationIdHeader()`'s parameter type were originally annotated against `@nestjs/common`'s `DynamicModule` / `INestApplication`. Building `academic-service` failed with a real, non-spurious TypeScript error: `DynamicModule` from `@nestjs/common@10.4.22` is not structurally assignable to `DynamicModule` from `@nestjs/common@11.1.27` (their `imports` array element unions differ enough that TS rejects the assignment).
- A separate, related pnpm-hoisting issue surfaced during the same work: `@nestjs/common@10.4.22` itself resolved to two distinct instances across the workspace (pnpm forks a package's virtual-store entry per unique peer-dependency resolution), which also produced cross-instance nominal type errors unrelated to the v10/v11 split. That part was fixed by not importing `@nestjs/common` types into `shared-logger`'s public API at all — see Decision below.

Decision
- `packages/shared-logger`'s public functions avoid nominally typing against `@nestjs/common`:
  - `createLoggerModule(serviceName: string): any` — returns `nestjs-pino`'s `LoggerModule.forRoot(...)` result, but with an explicit `any` return type so consumers on either NestJS major version can assign it into their own `@Module({ imports: [...] })` without a structural mismatch.
  - `attachCorrelationIdHeader(app: AppWithMiddleware)` — takes a minimal duck-typed interface (`{ use(fn): unknown }`) instead of `INestApplication`, since that's the only method actually used.
- This makes the package buildable and usable from both NestJS v10 and v11 services today, at the cost of losing compile-time type safety on those two call sites (a typo in the returned module shape, or passing something without `.use()`, would only surface at runtime).
- The underlying question — why `academic-service` is on a different NestJS major version than its siblings, and whether the other 4 should be upgraded to v11 or `academic-service` downgraded to v10 — was **not** investigated or decided as part of this work. It was out of scope for a logging migration and deserves its own audit (breaking changes between Nest v10→v11, TypeScript 5→6 compatibility across the monorepo, etc.).

Consequences
- `shared-logger` will keep working across a v10/v11 split indefinitely, so this is not a blocker for anything downstream.
- Type safety on `createLoggerModule`'s return value is gone; if `nestjs-pino`'s `LoggerModule.forRoot()` API changes shape in a future version bump, nothing in this package will catch it at compile time — only a runtime failure in one of the 5 services would.
- If/when the NestJS version split is resolved (all services on the same major), the `any`/duck-typed signatures in `shared-logger` can be tightened back to real `@nestjs/common` types — this should be revisited at that point, not left as permanent style.
- No other workaround was made elsewhere in the codebase for this version split; it only became visible because `shared-logger` is the first workspace package with a public API surface shared by all 5 services.

Notes
- Recommended follow-up (not scheduled): audit why `academic-service` diverged to NestJS v11 / TypeScript 6, and decide whether to align all 5 services on one major version. This ADR exists to make that decision discoverable later, not to make it now.
