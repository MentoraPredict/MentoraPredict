# MentoraPredict Mobile

Expo app for the MentoraPredict mobile experience.

## Run From The Monorepo

Install dependencies from the repository root:

```powershell
pnpm install
```

Start the mobile app:

```powershell
pnpm --filter @mentorapredict/mobile exec expo start -c
```

## API Environments

The app supports three API targets through `EXPO_PUBLIC_API_ENV`:

```text
local -> http://localhost:8000/api
qa    -> https://mentorapredictqa.programacionwebuce.net/api
prod  -> https://mentorapredictprod.programacionwebuce.net/api
```

Run against local Kong:

```powershell
$env:EXPO_PUBLIC_API_ENV="local"
pnpm --filter @mentorapredict/mobile exec expo start -c
```

Run against QA:

```powershell
$env:EXPO_PUBLIC_API_ENV="qa"
pnpm --filter @mentorapredict/mobile exec expo start -c
```

Run against production:

```powershell
$env:EXPO_PUBLIC_API_ENV="prod"
pnpm --filter @mentorapredict/mobile exec expo start -c
```

You can also override the API directly:

```powershell
$env:EXPO_PUBLIC_API_BASE_URL="http://192.168.1.10:8000/api"
pnpm --filter @mentorapredict/mobile exec expo start -c
```

Use the direct override when testing with Expo Go on a physical phone, because
`localhost` points to the phone itself, not to your development machine.
