# apps/mobile

Companion mobile app exposing a subset of MentoraPredict for push-notification delivery and quick status checks. See [README.md](./README.md) for how it fits alongside the other client apps.

## Tech Stack

| Concern | Library | Version |
|---|---|---|
| Framework | Expo | ~54 |
| Runtime | React Native | 0.81.5 |
| UI framework | React | 19.1.0 |
| Routing | expo-router (file-based) | ~6 |
| Navigation | @react-navigation/native + native-stack | — |
| Push notifications | expo-notifications, expo-device | — |
| Language | TypeScript | ~6.0.3 |
| Build/release | EAS (`eas-cli`) | — build profiles: `apk`, `apk-prod` |

## Purpose

Android-focused companion app covering auth/login and a role-based dashboard workspace. It calls the exact same REST endpoints as web, through the same Kong gateway — see [../api/api-contracts.md](../api/api-contracts.md).

## Structure

| Path | Contents |
|---|---|
| `src/app/` | expo-router entry: `_layout.tsx`, `explore.tsx`, `index.tsx` |
| `src/components/` | `auth/`, `dashboard/`, `ui/` |
| `src/constants/` | — |
| `src/hooks/` | (empty) |
| `src/services/` | `api/client.ts`, `auth.ts`, `dashboard.ts`, `notifications.ts` |
| `src/types/` | `auth.ts`, `dashboard.ts` |

## Push notifications, not Socket.IO

Unlike web/desktop, which maintain a Socket.IO connection for real-time notification push, mobile does **not** use Socket.IO at all. It registers an Expo push token (`POST /api/v1/notifications/device-tokens`) and receives native push notifications instead. Verified: no `socket.io-client` dependency in `apps/mobile/package.json`, no socket usage anywhere in `src/services`.

## Dashboard efficiency

`dashboard.ts` calls the same batched student-subjects-overview endpoint that analytics-service exposes for web (one call instead of N per-subject calls), plus a lighter per-subject prediction call. The teacher dashboard calls the efficient `subjects/:id/metrics/summary` endpoint directly and separately fetches the enrolled-students list — genuinely needed for the roster UI display, not just to recompute an average. This was explicitly verified before being left as-is during a request-volume optimization pass.

## CI/CD

Built via the `build-mobile-apk` job in `cd-qa.yml`/`cd-main.yml`: Expo prebuild (Android), Gradle build, signed via the `ANDROID_KEYSTORE_BASE64` secret. Published to `/opt/mentorapredict-downloads/mobile/`. See [../deployment/ci-cd-pipeline.md](../deployment/ci-cd-pipeline.md).
