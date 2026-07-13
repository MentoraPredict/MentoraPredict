# apps/desktop

Packages the `apps/web` production build as a native Windows desktop app via Electron. See [README.md](./README.md) for how it fits alongside the other client apps.

## Tech Stack

| Concern | Library | Version |
|---|---|---|
| Runtime | Electron | 37.10.3 |
| Packaging | electron-builder | 26 — NSIS installer target for Windows (switched from an earlier MSI target) |
| Language | TypeScript | 5.4 |
| Dev orchestration | concurrently, wait-on | — runs the web app's Vite dev server + `tsc --watch` + Electron together in dev mode |

## Purpose

Packages the `apps/web` production build (via its `build:desktop*` Vite modes — see [web.md](./web.md#build--deploy)) as a native Windows desktop app. `extraResources` copies `../web/dist` into the Electron app under `web/`. Ships local/QA/prod packaging variants (`package:local` / `package:qa` / `package:prod` scripts) matching web's own env files.

## Structure

| Path | Contents |
|---|---|
| `src/main.ts` | Electron main process |
| `src/preload.ts` | Preload script |
| `src/components/atoms/Button` | A small, apparently independent duplicate of the web `Button` atom, with its own `Button.styles.ts` — not shared with `apps/web/src/components/atoms/Button` |
| `src/styles/tokens.ts` | Style tokens |

## Custom protocol

Production builds load the bundled web app through a custom `mentorapredict://` protocol (`registerProductionProtocol`, serving files from `process.resourcesPath/web` with path-traversal protection) instead of Electron's plain `loadFile`. This gives the packaged app proper origin/CORS semantics. The protocol's `secure: true` privilege flag had to be removed for it to work correctly as a packaged NSIS app.

Kong explicitly allowlists `mentorapredict://app` and the `null` origin for CORS since the desktop app's custom protocol needs it — see [../infrastructure/kong-gateway.md](../infrastructure/kong-gateway.md).

## Known related fixes this cycle

- The downloads manifest fetch inside the packaged app initially broke because a page-relative `/downloads/...` URL doesn't resolve correctly from the `mentorapredict://` origin. Fixed by deriving an absolute URL from `VITE_API_BASE_URL` at build time — see [web.md](./web.md#build--deploy).
- The Axios request interceptor's use of `crypto.randomUUID()` (secure-context-only) crashed every outgoing API request specifically on this app's non-HTTPS custom-protocol origin. Fixed by switching to a util with a proper fallback chain.

## Distribution

Built via the `build-desktop-app` job in `cd-qa.yml`/`cd-main.yml` (runs on `windows-latest`, `pnpm package:qa`/`package:prod`), published as `MentoraPredict-Setup-qa.exe` / `MentoraPredict-Setup.exe` to `/opt/mentorapredict-downloads/desktop/`. See [../deployment/ci-cd-pipeline.md](../deployment/ci-cd-pipeline.md).

For deeper technical and end-user detail, see [../DESKTOP_APPLICATION.md](../DESKTOP_APPLICATION.md) and [../DESKTOP_USER_GUIDE.md](../DESKTOP_USER_GUIDE.md) — this file is a summary that links out to them rather than duplicating their content.
