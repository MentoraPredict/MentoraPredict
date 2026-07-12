# Mobile Architecture

MentoraPredict Mobile is an Expo/React Native client focused on role dashboards and notifications. It communicates with backend services only through Kong.

```text
Expo Router screens
        ↓
UI and role components
        ↓
Auth, dashboard, and notification services
        ↓ fetch
Kong API gateway -> backend services

Backend notification service -> Expo Push Service -> physical device
```

## Responsibilities

- `src/app` defines routes and screen-level state.
- `src/components` renders authentication, role dashboards, and shared UI.
- `src/services` owns authentication, dashboard aggregation, API access, and push registration.
- `src/types` defines session and dashboard contracts.

After login, the app loads `/v1/users/me`, selects the workspace from the user role, and registers the device's Expo push token as a best-effort operation. Login remains available if notification permission or token registration fails. Logout unregisters the token when possible.

Foreground notifications use an Expo notification handler to show a banner and sound. Background delivery is handled by the operating system and Expo Push Service. Push registration requires a physical device, permission, and the EAS project ID.

The API target is selected with `EXPO_PUBLIC_API_ENV` (`local`, `qa`, or `prod`) and can be overridden with `EXPO_PUBLIC_API_BASE_URL`.
