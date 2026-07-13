# Frontend Apps

MentoraPredict ships 4 client applications, all consuming the exact same REST API behind Kong — there is no client-specific backend. **web** is the primary, most feature-complete client (atomic design, React); **landing**, **mobile**, and **desktop** extend its reach to more surfaces (public marketing, Android, packaged Windows).

## Apps

| App | Tech | Purpose | Doc link |
|---|---|---|---|
| web | React 19 + Vite 8 + Tailwind 4 | Primary authenticated SPA (student/teacher/admin dashboards) | [web.md](./web.md) |
| landing | Astro 5.7 + Tailwind 4 + Contentful | Public marketing page, unauthenticated | [landing.md](./landing.md) |
| mobile | Expo ~54 + React Native 0.81.5 | Companion Android app | [mobile.md](./mobile.md) |
| desktop | Electron 37.10.3 | Packaged Windows installer wrapping the web build | [desktop.md](./desktop.md) |

## Workspace layout

All 4 apps live under `apps/` as pnpm-workspace members. Each is built independently:

- **web**, **landing** — own multi-stage `Dockerfile`, deployed as containers behind Kong/nginx.
- **mobile** — packaged via EAS (`eas-cli`) into an Android APK.
- **desktop** — packaged via `electron-builder` into a Windows NSIS installer.

None of the apps share a build pipeline or a backend-for-frontend layer; they all talk to the same set of gateway-routed REST endpoints (and, for web/desktop, the same Socket.IO notification channel).

See [../architecture/high-level-architecture.md](../architecture/high-level-architecture.md) for how these apps fit into the overall request flow through Kong.
