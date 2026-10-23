# Mobile Project Structure

```text
apps/mobile/
├── assets/                  Icons, splash images, and illustrations
├── src/
│   ├── app/                 Expo Router screens and root layout
│   ├── components/
│   │   ├── auth/            Login and session UI
│   │   ├── dashboard/       Role-aware dashboard UI
│   │   └── ui/              Reusable native controls
│   ├── services/
│   │   ├── api/client.ts    Environment-aware fetch client
│   │   ├── auth.ts          Login and user resolution
│   │   ├── dashboard.ts     Role dashboard data and DTO mapping
│   │   └── notifications.ts Push-token lifecycle
│   └── types/               Auth and dashboard contracts
├── app.json                 Expo application and plugin configuration
├── eas.json                 Android build profiles and API environments
├── babel.config.js
├── metro.config.js
├── package.json
└── tsconfig.json
```

## Development

Run from the repository root in Git Bash:

```bash
pnpm install
EXPO_PUBLIC_API_ENV=local pnpm --filter @mentorapredict/mobile exec expo start -c
```

For a physical device, `localhost` points to the phone. Use a reachable development-machine address:

```bash
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.10:8000/api pnpm --filter @mentorapredict/mobile exec expo start -c
```

## Android builds

```bash
npx eas-cli login
pnpm --filter @mentorapredict/mobile run build:android:apk:qa
pnpm --filter @mentorapredict/mobile run build:android:apk:prod
```

The `apk` and `apk-prod` profiles in `eas.json` create internal installable APKs connected to the QA and production gateways respectively.

The `development` EAS profile also creates an internal APK with a development client and the local API environment. Push notifications require a physical device; simulators and emulators return no Expo push token.

See [Mobile Architecture](./MOBILE_ARCHITECTURE.md) for session, dashboard, and notification behavior.
