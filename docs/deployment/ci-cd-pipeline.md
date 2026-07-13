# CI/CD Pipeline — Job-by-Job Detail

Detailed breakdown of the four workflow files in `.github/workflows/`. See [./README.md](./README.md) for the overall flow and [./environments.md](./environments.md) for operational instructions.

## `ci.yml`

Trigger: `pull_request` → branches `[QA, main, dev]`, types `[opened, synchronize, reopened]`.

| Job | Condition | Purpose |
|---|---|---|
| `commitlint` | `github.event_name == 'pull_request'` | Validates conventional-commit messages for all commits in the PR range |
| `validate` | `github.base_ref != 'dev'` | Full lint/build/test gate for PRs targeting QA or main |
| `detect-dev-changes` | `github.base_ref == 'dev'` | Path-based change detection, builds a dynamic matrix |
| `build-and-push-dev` | `needs: [commitlint, detect-dev-changes]`, `base_ref == 'dev' && has_changes` | Builds and pushes `dev-*` images for changed targets |

**commitlint** — runs `npx commitlint` over the PR's commit range against a long hardcoded allowlist of grandfathered non-conforming commit messages, filtered out via `grep -Fvx` / `grep -Ev` exclusions. Capped to the latest 40 commits in the PR's merge-base range (added because large promotion PRs would otherwise re-validate the entire historical range). Includes regex exemptions for recurring auto-generated subjects — e.g. `Release vX.Y.Z ...` and `Promote development to QA — release vX.Y.Z (#N)` — which don't follow `type(scope): subject` format, plus several one-off exact-match exemptions for specific historical commits that predate Conventional Commits enforcement in this repo.

**validate** — runs only for PRs targeting QA/main: `pnpm install --frozen-lockfile`, Turbo build cache, `pnpm lint`, `pnpm build`, `pnpm test`, a Gitleaks scan (`continue-on-error: true`), `pnpm list --depth=0`, and a step-summary table. This job does **not** run for PRs targeting `dev`.

**detect-dev-changes** — uses `dorny/paths-filter` over 9 path groups (5 services, web, landing, `infra/docker/**`, `packages/**`). If infra or packages changed, all 7 buildable targets are force-flagged true. Emits a dynamic JSON build matrix plus `has_changes`.

**build-and-push-dev** — matrix build per changed service/app; tags `dev-latest` and `dev-<short-sha>`; pushes to DockerHub via `docker/build-push-action@v6` with GHA layer caching scoped per service.

**Key nuance**: PRs into `dev` only get selective image builds/pushes — no lint/test/build gate runs at all for dev-targeted PRs. PRs into `QA`/`main` run the full `validate` job (lint/build/test/gitleaks) but build no images — image building for QA/main happens only in the CD workflows, on push, never in CI.

## `cd-qa.yml`

Trigger: `push` → branch `[QA]`. Concurrency group `qa-deploy` (cancel-in-progress).

| Job | Depends on | Condition | Purpose |
|---|---|---|---|
| `detect-changes` | — | — | Path-based change detection against `github.event.before` |
| `build-and-push` | `detect-changes` | matrix over `docker_matrix` | Builds and pushes `qa-*` images |
| `build-mobile-apk` | — | `mobile_changed` | Builds and publishes the QA Android APK |
| `build-desktop-app` | — | `desktop_changed` | Builds and publishes the QA Windows installer |
| `deploy-to-qa` | `[detect-changes, build-and-push]` | `has_changes && ref == QA` | Deploys to the EC2 QA host |
| `create-qa-release` | `deploy-to-qa` | `success` | Creates a `qa-v*` prerelease via `release.yml` |

**detect-changes** — pins `dorny/paths-filter`'s `base` explicitly to `github.event.before`, overriding the action's default push-inference. This was a real bug fixed this cycle: merge-commit pushes caused every filter to spuriously evaluate true; the fix was reproduced twice and verified via `git diff --stat` between old/new QA tips, confirming the actual file diff was small each time. Filters cover 5 services, web, landing, mobile (`apps/mobile/**`), desktop (`apps/desktop/**`, `apps/web/**`, the workflow file itself), kong (`infra/kong/**`, `infra/keys/**`), monitoring (`infra/monitoring/**`), infra (`infra/docker/**`), and packages. Infra/packages changes force-flag all docker-buildable services plus kong and monitoring true. Produces a full `matrix` (including a non-buildable `kong` "compose" type entry) and a filtered `docker_matrix` (docker-type only). `has_changes` is also forced true on monitoring-only changes, even though monitoring never appears in the matrix itself — otherwise a monitoring-only change would never trigger a deploy at all. This was also a real bug found and fixed this cycle.

**build-and-push** — validates DockerHub secrets are present, runs a Trivy filesystem scan (HIGH/CRITICAL, `continue-on-error: true`), builds and pushes `qa-latest` + `qa-<short-sha>` tags via `docker/build-push-action@v6`.

**build-mobile-apk** — `environment: "QA enviroment"` (sic, real typo in the workflow file). Runs Expo prebuild for Android with Gradle caching, decodes the `ANDROID_KEYSTORE_BASE64` secret and validates it is a real keystore, injects a signing config block into `app/build.gradle`, runs `./gradlew assembleRelease`, uploads the artifact, then SCPs `MentoraPredict-qa.apk` plus a generated `mobile.json` manifest to `/opt/mentorapredict-downloads/mobile/` on the EC2 host via the `EC2_SSH_KEY` secret.

**build-desktop-app** — `runs-on: windows-latest`. Runs `pnpm package:qa` (electron-builder, via `apps/desktop/package.json`), uploads the `.exe` artifact, SCPs `MentoraPredict-Setup-qa.exe` plus a `desktop.json` manifest to `/opt/mentorapredict-downloads/desktop/`. Sets `MSYS_NO_PATHCONV=1` on the publish step — a real bug found and fixed this cycle: `windows-latest`'s `shell: bash` is Git Bash (MSYS2), which auto-rewrites any command-line argument that looks like a POSIX absolute path (e.g. `/downloads/...`) into a Windows path rooted at the Git install directory before `jq` ever sees it, corrupting the `downloadUrl` written into the manifest. The workflow file itself was also added to its own desktop path filter, so a CI-only fix like this one actually re-triggers a rebuild instead of sitting dormant until an unrelated file changes.

**deploy-to-qa** — `environment: "QA enviroment"`. Via `appleboy/ssh-action`, SSHes into `EC2_HOST` as user `ubuntu` and:
1. Clones/resets `/opt/mentorapredict` to `origin/QA`.
2. Writes `.env` from GitHub Secrets — Postgres, Redis, JWT, CORS, Mongo, Kong, OpenAI, Swagger, Microsoft OAuth, Frontend URL, Expo public vars, Supabase, Grafana root URL (JWT keys are re-base64-encoded).
3. Resolves `IMAGE_TAG=qa-<short-sha>`, falling back to `qa-latest` if that specific tag isn't pullable.
4. Starts `infra.yml`'s postgres + redis, waits for `pg_isready`.
5. Runs Docker cleanup: container prune, image prune (`--filter until=24h`), builder prune (180s timeout).
6. Selectively pulls and force-recreates only `$SERVICES_LIST` (the changed-services output) via `docker-compose.qa.yml`. This selectivity was itself a fix: an earlier version force-recreated every service on any change; a follow-up bug where an empty `SERVICES_LIST` force-recreated *all* services was also caught and fixed by guarding the pull/up commands to skip when the list is empty.
7. Runs `seed-loader` (`--abort-on-container-exit --exit-code-from seed-loader`).
8. Starts the monitoring stack (best-effort).
9. Final `docker system prune`.

**create-qa-release** — calls the reusable `release.yml` with `tag-prefix: qa-v`, `prerelease: true`.

## `cd-main.yml`

Trigger: `push` → `[main]`, tags `[v*]`, plus `workflow_dispatch`. Concurrency group `prod-deploy`.

Structurally identical to `cd-qa.yml` — same job names and shapes: `detect-changes` → `build-and-push` → `build-mobile-apk` / `build-desktop-app` → `deploy-to-prod` → `create-release`. Differences from QA:

| Aspect | QA | Production |
|---|---|---|
| Expo env vars | — | `EXPO_PUBLIC_API_ENV=prod`, `EXPO_PUBLIC_API_BASE_URL=https://mentorapredictprod.programacionwebuce.net/api` |
| Image tags | `qa-latest`, `qa-<short-sha>` | `main-latest`, `main-<short-sha>`, plus `type=semver,pattern=v{{version}}` |
| GitHub Environment | `"QA enviroment"` (sic) | `"Prod Enviroment"` (sic) |
| Seed-loader flags | `--abort-on-container-exit --exit-code-from seed-loader` | None — no exit-code gating on the prod seed-loader run (minor inconsistency between the two workflows, worth flagging) |
| Deploy target | `docker-compose.qa.yml`, resets to `origin/QA` | `docker-compose.prod.yml`, resets to `origin/main` |
| Mobile artifact | `MentoraPredict-qa.apk` | `MentoraPredict.apk` (no env suffix) |
| Desktop artifact | `MentoraPredict-Setup-qa.exe` | `MentoraPredict-Setup.exe` (no env suffix) |
| Release tag prefix | `qa-v`, `prerelease: true` | `v`, `prerelease: false` |

Both mobile and desktop artifacts publish to the same `/opt/mentorapredict-downloads/{mobile,desktop}` paths, differentiated only by filename.

## `release.yml`

Reusable workflow (`workflow_call` only — not directly triggerable).

**Inputs**: `tag-prefix` (string), `prerelease` (bool), `release-name` (string).
**Permissions**: `contents: write`, `issues: read`.

Single job **create-release**, via `actions/github-script`:
1. Finds the last matching tag (`git describe --tags --match "<prefix>*"`).
2. Diffs `git log lastTag..HEAD`.
3. Extracts PR numbers referenced in commit subjects.
4. Fetches each PR's labels to detect breaking/feature labels.
5. Computes the next semver: major bump on breaking, minor on feature, else patch.
6. Aborts if the computed tag already exists.
7. Creates the git tag and a GitHub Release (`generate_release_notes: true`, `draft: false`) with a body noting the deployed commit SHA.

## Contentful build args

Both `cd-qa.yml` and `cd-main.yml`'s `build-and-push` job pass `CONTENTFUL_SPACE_ID` and `CONTENTFUL_ACCESS_TOKEN` as Docker build-args to the landing image build, matching what `ci.yml`'s dev build already did. Without these, the landing Dockerfile silently falls back to static images instead of fetching dynamic Contentful content. This was a real gap found and fixed this cycle — the two CD workflows were initially missing these build-args entirely.

## Registries and artifacts

### Docker images

DockerHub image naming: `${DOCKERHUB_USERNAME}/<service-name>:<tag>` for all 7 buildable targets: `auth-service`, `user-service`, `academic-service`, `analytics-service`, `prediction-service`, `web`, `landing`.

| Environment | Tags |
|---|---|
| dev | `dev-latest`, `dev-<sha>` |
| QA | `qa-latest`, `qa-<sha>` |
| prod | `main-latest`, `main-<sha>`, `v{{semver}}` |

Dockerfiles for `web`/`landing` are multi-stage (`node:22-alpine` deps → builder, `nginx:alpine` runner), with pnpm-workspace-filtered builds. `landing` additionally takes the Contentful build-args above plus `PUBLIC_WEB_APP_URL`.

### Desktop/mobile installer publishing

Target directory on EC2: `/opt/mentorapredict-downloads`, with `mobile/` and `desktop/` subdirectories (created and chowned to `ubuntu` before SCP).

| Environment | Mobile artifact | Desktop artifact |
|---|---|---|
| QA | `mobile/MentoraPredict-qa.apk` | `desktop/MentoraPredict-Setup-qa.exe` |
| Production | `mobile/MentoraPredict.apk` | `desktop/MentoraPredict-Setup.exe` |

Manifest JSONs (`mobile.json`, `desktop.json`) live at the `/opt/mentorapredict-downloads/` root, one shape for both mobile/desktop and both environments:

```json
{
  "environment": "qa" | "prod",
  "downloadUrl": "/downloads/<mobile|desktop>/<filename>",
  "buildUrl": "<GH Actions run URL>",
  "version": "<from package.json>",
  "updatedAt": "<ISO8601 UTC>"
}
```

`downloadUrl` is deliberately relative (same-origin behind Kong/nginx). It is served by the web nginx container, which bind-mounts `/opt/mentorapredict-downloads:/usr/share/nginx/html/downloads`, exposed at nginx's `location /downloads/` block (`Access-Control-Allow-Origin: *` for the Electron app's `mentorapredict://` origin — see [../infrastructure/kong-gateway.md](../infrastructure/kong-gateway.md) and [../frontend/desktop.md](../frontend/desktop.md)).

Desktop packaging is invoked via `apps/desktop/package.json` scripts: `package:qa`, `package:prod`, `package:local`.

## See also

- [./README.md](./README.md) — deploy flow overview.
- [./environments.md](./environments.md) — operational guide per environment.
- [../infrastructure/docker-compose.md](../infrastructure/docker-compose.md)
- [../infrastructure/kong-gateway.md](../infrastructure/kong-gateway.md)
- [../architecture/high-level-architecture.md](../architecture/high-level-architecture.md)
