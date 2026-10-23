# Kong API Gateway

Documents `infra/kong/kong-template.yml` and `infra/kong/entrypoint.sh`, the source of truth for routing, auth enforcement, and rate limiting across all services.

Related: [../architecture/high-level-architecture.md](../architecture/high-level-architecture.md), [./docker-compose.md](./docker-compose.md), [../backend/README.md](../backend/README.md).

## Templating mechanism (`entrypoint.sh`)

Kong's declarative config is not rendered with `envsubst` — it uses a hand-rolled, `sed`-based two-step substitution (`#!/bin/sh`, `set -e`):

1. **Resolve JWT keys.** If `$JWT_PUBLIC_KEY` / `$JWT_PRIVATE_KEY` env vars are set, base64-decode them into `/tmp/public.pem` / `/tmp/private.pem`. Otherwise, fall back to `/secrets/public.pem` / `/secrets/private.pem` (mounted volume). If neither source is available, the script warns and continues.
2. **Inject the public key into the template.** The public key PEM is indented with `sed 's/^/          /'` into `/tmp/indented_key.pem`, then a `sed '/__JWT_PUBLIC_KEY__/r file'` read-insert appends its content, followed by deletion of the placeholder line, writing the result to `/etc/kong/kong.yml`. If no key is available at all, the template is copied through unmodified — JWT verification will fail in that case.
3. **Substitute the upstream port.** `sed -i "s/__WEB_UPSTREAM_PORT__/${WEB_UPSTREAM_PORT:-80}/g"` replaces the web upstream port placeholder.
4. **Start and supervise Kong.** `kong start` daemonizes and returns immediately (it forks). The script then polls `kong health` every 5s in an infinite loop, and exits `1` the first time that check fails.

This exit-on-failure poll loop is intentional and fixes a real historical incident: `kong start` forks and returns immediately, so the entrypoint used to just `sleep infinity` afterward. If Kong was OOM-killed after startup, the container's process (the sleeping shell) kept running, so `docker ps` reported the container as `Up` indefinitely while Kong itself was dead inside — restart policies never triggered because the container never exited. The health-poll loop makes the container exit when Kong dies, so `restart: always`/`unless-stopped` actually recovers it.

## Global plugins

| Plugin | Configuration |
|---|---|
| `cors` | Broad origin allowlist (localhost variants, `mentorapredict://app`, `"null"`, QA/prod hostnames); methods GET/POST/PUT/DELETE/PATCH/OPTIONS; headers Accept/Authorization/Content-Type/X-Correlation-ID; `credentials: true` |
| `correlation-id` | Header `X-Correlation-ID`, generator `uuid`, `echo_downstream: true` |

**Consumer**: `mentorapredict-api`, with `jwt_secrets: [{ key: mentorapredict, algorithm: RS256, rsa_public_key: __JWT_PUBLIC_KEY__ }]` — the placeholder is filled in by `entrypoint.sh` at container start.

## Routes

| Service | Upstream | Route | Path | regex_priority | Plugins |
|---|---|---|---|---|---|
| auth-service | `http://auth-service:3001` | auth-login | `/api/v1/auth/login` | 200 | rate-limiting: minute=5, policy=local, limit_by=ip |
| | | auth-logout | `/api/v1/auth/logout` | 150 | jwt (key_claim_name=iss, claims_to_verify=[exp]); rate-limiting: minute=300, limit_by=consumer |
| | | auth-internal-routes | `/api/v1/auth/internal` | 200 | ip-restriction: allow 127.0.0.1, 172.16.0.0/12 |
| | | auth-routes | `/api/v1/auth` | 100 | rate-limiting: minute=100, limit_by=ip |
| health-service | `http://auth-service:3001` | health-route | `/health` | 100 | none |
| user-service | `http://user-service:3002` | user-docs | `/api/v1/users/docs` | 200 | none |
| | | user-internal-routes | `/api/v1/users/internal` | 200 | ip-restriction |
| | | user-uploads | `/api/v1/users/uploads` (GET) | 200 | none |
| | | user-routes | `/api/v1/users` | 100 | jwt; rate-limiting minute=300 limit_by=consumer |
| academic-service | `http://academic-service:3003` | academic-docs | `/api/v1/academic/docs` | 200 | none |
| | | academic-internal-routes | `/api/v1/academic/internal` | 200 | ip-restriction |
| | | academic-uploads | `/api/v1/academic/uploads` (GET) | 200 | none |
| | | academic-routes | `/api/v1/academic` | 100 | jwt; rate-limiting minute=300 limit_by=consumer |
| analytics-service | `http://analytics-service:3004` | analytics-docs | `/api/v1/analytics/docs` | 200 | none |
| | | analytics-internal-routes | `/api/v1/analytics/internal` | 200 | ip-restriction |
| | | analytics-routes | `/api/v1/analytics` | 100 | jwt; rate-limiting minute=300 limit_by=consumer |
| | | notifications-internal-routes | `/api/v1/notifications/internal` | 200 | ip-restriction |
| | | notifications-routes | `/api/v1/notifications` | 100 | jwt; rate-limiting minute=300 limit_by=consumer |
| | | analytics-socket-io | `/api/socket.io` | 200 | none — Socket.IO handshake auth is carried client-side and verified by `NotificationsGateway` itself, not by Kong's JWT plugin |
| prediction-service | `http://prediction-service:3006` | prediction-docs | `/api/v1/prediction/docs` | 200 | none |
| | | prediction-internal-routes | `/api/v1/prediction/internal` | 200 | ip-restriction |
| | | prediction-routes | `/api/v1/prediction` | 100 | jwt; rate-limiting minute=300 limit_by=consumer |
| grafana | `http://grafana:3000` | grafana-route | `/grafana` | 300 | request-transformer (adds `X-Script-Name: /grafana`, `X-Forwarded-Prefix: /grafana`); rate-limiting minute=60 limit_by=ip |
| landing | `http://landing:80` | landing-route | `/landing` (strip_path=true) | 20 | scoped cors (GET/OPTIONS only, credentials=false); rate-limiting minute=300 limit_by=ip |
| web | `http://web:__WEB_UPSTREAM_PORT__` | web-route | `/` | 1 | scoped cors (full methods, credentials=true) |

Notes:

- Notifications live inside `analytics-service` (confirmed via `app.module.ts`), which is why they share its Kong service block rather than having a dedicated upstream.
- All rate-limiting plugins use `policy: local` (in-memory, per-Kong-node — not a Redis-backed cluster policy) and `fault_tolerant: true`.
- `limit_by` splits between `ip` (login, public/anonymous-ish routes, landing, grafana) and `consumer` (JWT-authenticated routes, keyed by the single shared `mentorapredict-api` consumer — not per-end-user identity within that consumer).

## Real-IP / rate-limit isolation (historical production fix)

`KONG_TRUSTED_IPS` and `KONG_REAL_IP_HEADER` (env vars, set identically across dev/QA/prod) trust `0.0.0.0/0,::/0` and read the `X-Real-IP` header. This is necessary because nginx — the only client that ever talks to Kong directly — forwards the real visitor IP in that header.

Without this configuration, every `ip`-keyed rate-limit bucket collapses to nginx's own container IP, meaning **all real users share a single rate-limit bucket**. This was a real production bug found and fixed this cycle: verified live on QA that 15 sequential requests from an independent client, issued while a real user's session was under heavy load, did not trigger 429s after the fix — prior to the fix, they would have, since every user shared the same bucket.

## Other Kong configuration

| Item | Location | Description |
|---|---|---|
| `generate-keys.sh` | `infra/kong/` | Generates a 2048-bit RSA keypair (`openssl genrsa` / `openssl rsa -pubout`) into `infra/keys/` if not already present; `chmod 644` |
| `KONG_NGINX_WORKER_PROCESSES=1` | set in the compose files (see [./docker-compose.md](./docker-compose.md)), not the Kong template | Pinned instead of Kong's default `auto`, which detects the *host's* CPU count rather than the container's CPU limit. On a 4-core host this spawned ~4 Nginx workers competing for a 320-384M memory cap, and the OOM killer would eventually take Kong down. Combined with the entrypoint.sh health-poll fix above, this closed a real "container shows Up but Kong is dead inside" incident |
| `KONG_NGINX_HTTP_CLIENT_MAX_BODY_SIZE: 12m` | compose env | Kong previously had no `client_max_body_size` configured, defaulting to nginx's 1MB — smaller than the app's own 2MB image / 10MB document upload limits, causing 413s on legitimately-sized uploads. Fixed by setting this explicitly |
