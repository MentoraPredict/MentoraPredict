# Monitoring Stack

Documents `infra/monitoring/` in full, including a known operational gap.

Related: [../architecture/high-level-architecture.md](../architecture/high-level-architecture.md), [./docker-compose.md](./docker-compose.md), [./kong-gateway.md](./kong-gateway.md), [../deployment/environments.md](../deployment/environments.md).

## Services (`docker-compose.monitoring.yml`)

| Service | Image | Limits (CPU/Mem) | Port binding | Notes |
|---|---|---|---|---|
| node-exporter | prom/node-exporter:v1.7.0 | 0.05 / 96M | `127.0.0.1:9100:9100` (loopback-only) | mounts `/proc`, `/sys`, `/` read-only |
| cadvisor | gcr.io/cadvisor/cadvisor:v0.49.1 | 0.20 / 192M | `127.0.0.1:8080:8080` (loopback-only) | `security_opt: apparmor:unconfined`, `cap_add: SYS_ADMIN, SYS_TIME`, mounts rootfs/docker/disk read-only |
| grafana | grafana/grafana:10.4.2 | 0.30 / 320M | `127.0.0.1:3000:3000` (loopback-only) | `user: "472:472"`; only reachable via Kong's `/grafana` route or an SSH tunnel, never exposed directly |

Grafana environment:

| Variable | Value | Purpose |
|---|---|---|
| `GF_INSTALL_PLUGINS` | `grafana-piechart-panel` | |
| `GF_AUTH_ANONYMOUS_ENABLED` | `false` | |
| `GF_SERVER_ROOT_URL` / `GF_SERVER_SERVE_FROM_SUB_PATH` | environment hostname / `true` | matches Kong's `/grafana` prefix rewrite |
| `GF_SECURITY_ALLOW_EMBEDDING` | `true` | |
| `GF_SECURITY_COOKIE_SAMESITE` | `none` | |
| `GF_SECURITY_COOKIE_SECURE` | `true` | fixed a real bug this cycle — see timeline below |

Volumes: `grafana_data`, `./grafana/provisioning:/etc/grafana/provisioning:ro`, `./grafana/dashboards:/etc/grafana/dashboards:ro`.

## Known gap: no metrics backend wired up

There is **no Prometheus service** anywhere in `docker-compose.monitoring.yml` or elsewhere in `infra/`. `grafana/provisioning/datasources/datasources.yml` is literally:

```yaml
datasources: []
```

Consequently:

- cAdvisor and node-exporter currently have nothing scraping or storing their metrics.
- Grafana has zero datasources configured.
- The 3 dashboard JSONs described below are provisioned into Grafana but are **functionally non-operational** — there is no datasource for them to query.

### Also orphaned: Alertmanager

`infra/monitoring/alerts/alertmanager.yml` and `infra/monitoring/alerts/entrypoint.sh` exist — the entrypoint performs `__SMTP_FROM__` / `__SMTP_HOST__` / `__SMTP_TLS__` / `__EMAIL_TO__` `sed` substitution and then `exec alertmanager` — but **no alertmanager service is defined in any compose file**. These files are not referenced by any compose or build configuration found in the repository. Alerting configuration appears prepared but is not currently deployed.

## Dashboard provisioning

`grafana/provisioning/dashboards/dashboards.yml`: file-based provider, folder `MentoraPredict`, path `/etc/grafana/dashboards`, `updateIntervalSeconds: 30`, `allowUiUpdates: true`.

| Dashboard file | Title | Panels |
|---|---|---|
| `container-health.json` | Container Health | Running/Stopped Containers, Container Restarts (24h), Container List, CPU/Memory Usage per Container, Container Network I/O, CPU/Memory Over Time |
| `infrastructure-overview.json` (uid `infrastructure-overview`) | Infrastructure Overview | CPU/Memory/Disk Usage, System Uptime, CPU/Memory Over Time, Network Traffic, Load Average, Disk I/O, Running Processes, Open File Descriptors |
| `service-health.json` | Service Health | Total Containers, Containers with CPU>50%/Memory>500MB, Host CPU/Memory/Disk Usage, Container CPU/Memory Usage Over Time, Container Network I/O, Container List |

All panels are provisioned but currently have no data source to render from (see gap above).

## Grafana reverse-proxy fix timeline

A sequence of related but distinct bugs were found and fixed this cycle while getting Grafana to work correctly behind Kong's `/grafana` route. Documented as a timeline since each fix addressed a genuinely separate root cause:

1. **Root cause 1 — wrong root URL, public port binding.** `GF_SERVER_ROOT_URL` was hardcoded to `http://localhost:3000` instead of the real QA domain plus the `/grafana` sub-path. Fixed by setting it correctly and enabling `GF_SERVER_SERVE_FROM_SUB_PATH`. Separately, the port binding was `0.0.0.0` (publicly reachable outside the reverse proxy) and was restricted to `127.0.0.1` only.
2. **Root cause 2 — CSRF rejection on datasource queries.** Fixing `root_url` alone wasn't sufficient: Grafana 10's CSRF middleware separately rejects datasource-query POSTs with "403 origin not allowed" unless `GF_SECURITY_CSRF_TRUSTED_ORIGINS` is explicitly set. Fixed by adding it. While investigating, it was discovered that neither `cd-qa.yml` nor `cd-main.yml` ever actually wrote `GRAFANA_ROOT_URL` / `GRAFANA_TRUSTED_ORIGIN` into the `.env` file each workflow generates — both environments were silently relying on the compose file's QA-matching default, meaning prod would have been broken too. Fixed by hardcoding both variables per-environment into each workflow's `.env` generation step.
3. **Root cause 3 — embedding/cross-site cookies.** Landed as a real git merge conflict against fix #2 (both changes were kept — non-conflicting env var keys): `GF_SECURITY_ALLOW_EMBEDDING=true` and `GF_SECURITY_COOKIE_SAMESITE=none`, needed for iframe-embedding and cross-site cookie scenarios.
4. **Root cause 4 — session cookie silently dropped.** `SameSite=None` requires `Secure` — the two are independent settings, and `Secure` was missing. This broke login itself, not just embedding: every modern browser silently drops `SameSite=None` cookies without `Secure`, so login appeared to succeed but the session never actually persisted. Confirmed via the raw `Set-Cookie` header on a live login request. Fixed by adding `GF_SECURITY_COOKIE_SECURE=true`.

Access to Grafana is exclusively via Kong's `/grafana` route — the loopback-bound port means there is no direct external access. This is intentional network isolation, not an oversight.

## `infra/scripts/`

| Script | Purpose |
|---|---|
| `dev-setup.sh` | End-to-end bootstrap for a fresh EC2/dev host. Preflight-checks docker, compose v2, git, openssl, and that `infra/.env` exists. Clones or `git reset --hard origin/dev` into `/opt/mentorapredict`. Generates RSA keys via `generate-keys.sh` if absent. Tears down existing project containers. Starts postgres + redis and polls `pg_isready`. Builds and starts the 5 app services + web + kong (`--build`). Runs seed-loader (force-recreate). Starts the monitoring stack best-effort (`|| echo skip`). Prunes Docker artifacts older than 24h. Prints service status and access endpoints: Kong proxy (8000), Kong admin (8001), Konga (1337), Redis Commander (8081) |
| `run-seeds.sh` | Idempotent Postgres seed runner. Waits for `pg_isready`, ensures a `seed_history` table exists, then for every `*.sql` file under `$SEEDS_DIR` computes a sha256 checksum and skips files whose checksum already matches what's recorded (unless `SEED_FORCE_RUN=true`); otherwise runs the file and upserts its checksum. See [../database/database-architecture.md](../database/database-architecture.md) for the actual seed file list this runs |
