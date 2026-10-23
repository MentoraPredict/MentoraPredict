# Desktop Architecture

MentoraPredict Desktop is a thin Electron shell around the shared React web application.

```text
Electron main process
├── BrowserWindow
├── custom mentorapredict:// protocol
└── preload bridge
        ↓
React/Vite renderer
        ↓ HTTPS/HTTP
Kong API gateway -> backend services
```

## Runtime modes

- **Development:** Electron loads `http://localhost:5173` from the Vite development server.
- **Packaged:** Electron serves bundled files from `process.resourcesPath/web` through `mentorapredict://app`.

The custom protocol supports SPA assets without exposing the renderer to Node.js. The window uses context isolation, disables Node integration, and enables the Electron sandbox. External HTTP links open in the system browser.

Because packaged assets use the standard custom protocol `mentorapredict://app`, React Router uses `BrowserRouter`. `HashRouter` is only the web application's fallback for a direct `file:` URL.

The preload script exposes only the operating-system platform through `window.desktop`. No backend credentials or privileged filesystem APIs are exposed to React.

## Environment selection

The package command selects the API gateway at build time:

| Command | Web environment |
| --- | --- |
| `package:local` | `.env.desktop.local` |
| `package:qa` | `.env.desktop.qa` |
| `package:prod` | `.env.desktop.prod` |

Kong must allow the `mentorapredict://app` origin for packaged application requests.

See also [Desktop Project Structure](./DESKTOP_STRUCTURE.md), [Desktop Technologies](./DESKTOP_TECHNOLOGIES.md), and the [Desktop User Guide](./DESKTOP_USER_GUIDE.md).
