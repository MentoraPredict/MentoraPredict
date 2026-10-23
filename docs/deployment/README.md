# Deployment & CI/CD

MentoraPredict ships to three deploy targets — dev, QA, and production — driven entirely by GitHub Actions. There is no manual deploy step for QA or production beyond pushing to the right branch (or, for production, pushing a `v*` tag or triggering the workflow by hand). All automation lives in `.github/workflows/`; the repo has no `CODEOWNERS`, no Dependabot config, and no issue/PR templates — `.github/` contains only the four workflow files described below.

## Deploy flow

```
dev branch (PR merge) ──▶ ci.yml (build-and-push-dev job) ──▶ dev-* tagged images
                                                                (no live deploy target — dev-setup.sh
                                                                 is the manual/host-side apply mechanism)

QA branch (push)      ──▶ cd-qa.yml   ──▶ qa-* tagged images ──▶ EC2 QA host   ──▶ mentorapredictqa.programacionwebuce.net
                                       ──▶ qa-v* prerelease tag

main branch (push/tag/dispatch) ──▶ cd-main.yml ──▶ main-*/semver images ──▶ EC2 prod host ──▶ mentorapredictprod.programacionwebuce.net
                                                 ──▶ v* release tag
```

## Workflows

| Workflow | Trigger | Deploys to |
|---|---|---|
| `ci.yml` | `pull_request` → `[QA, main, dev]` | Nowhere — validates PRs; only dev-targeted PRs also push `dev-*` images |
| `cd-qa.yml` | `push` → `[QA]` | QA environment |
| `cd-main.yml` | `push` → `[main]`, tags `[v*]`, `workflow_dispatch` | Production environment |
| `release.yml` | `workflow_call` only (called by `cd-qa.yml` / `cd-main.yml`) | N/A — creates a GitHub Release + tag |

## Architecture notes

- No container orchestrator is in use (no Swarm, no Kubernetes). Deployment is a git clone/reset of `/opt/mentorapredict` on the target EC2 host, `.env` generation from GitHub Secrets, and `docker compose up` run directly on that host.
- There is no blue-green or canary deployment. Changed services are pulled and force-recreated in place.
- QA and production share the same deploy mechanism and script shape. They differ only in source branch, image tag prefix, and target hostname.

## See also

- [./ci-cd-pipeline.md](./ci-cd-pipeline.md) — job-by-job detail of all four workflows.
- [./environments.md](./environments.md) — how to run and deploy to each environment (local, QA, production).
- [../infrastructure/docker-compose.md](../infrastructure/docker-compose.md) — compose file structure and services.
- [../infrastructure/kong-gateway.md](../infrastructure/kong-gateway.md) — API gateway configuration.
- [../architecture/high-level-architecture.md](../architecture/high-level-architecture.md) — overall system architecture.
