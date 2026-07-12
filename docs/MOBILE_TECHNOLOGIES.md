# Mobile Technologies

| Technology | Purpose |
| --- | --- |
| Expo SDK 54 | Mobile runtime, configuration, native modules, and development tooling |
| React Native 0.81 | Native Android and iOS user interface |
| React 19 | Component and state model |
| TypeScript | Typed screens, services, and API contracts |
| Expo Router 6 | File-based navigation built on React Navigation |
| Expo Notifications | Permission handling, Expo push tokens, and foreground notifications |
| Expo Device | Detects physical devices before push-token registration |
| EAS Build | Produces internal Android APK builds for QA and production |
| Metro | Bundles React Native source and assets |

The application uses the native `fetch` API for backend requests and React state for its small session flow. It does not currently require Axios, Zustand, or TanStack Query.
