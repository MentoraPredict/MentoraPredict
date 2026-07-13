# Desktop Technologies

| Technology | Purpose |
| --- | --- |
| Electron 37 | Runs MentoraPredict as a secure Windows desktop application. |
| React 19 | Provides the shared user interface from `apps/web`. |
| TypeScript | Types the Electron main/preload processes and the web application. |
| Vite | Builds the web interface for local, QA, and production environments. |
| electron-builder | Packages the application and produces Windows releases. |
| NSIS | Creates the configurable Windows installer. |
| pnpm workspaces | Coordinates the desktop and shared web packages. |

The desktop application has no separate UI framework. It embeds the production build of `apps/web` and connects to backend services through Kong using the environment-specific API URL compiled by Vite.

See [Desktop Architecture](./DESKTOP_ARCHITECTURE.md) and [Desktop Project Structure](./DESKTOP_STRUCTURE.md).
