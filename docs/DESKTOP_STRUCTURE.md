# Desktop Project Structure

```text
apps/desktop/
├── build/
│   └── mentorapredict-logo.ico   Windows application icon
├── src/
│   ├── main.ts                   Electron lifecycle, window, and protocol
│   └── preload.ts                Minimal renderer bridge
├── package.json                  Scripts and electron-builder configuration
└── tsconfig.json                 Main/preload TypeScript build

apps/web/
├── src/                          Shared React interface
├── .env.desktop.local            Local gateway URL
├── .env.desktop.qa               QA gateway URL
├── .env.desktop.prod             Production gateway URL
└── dist/                         Web assets bundled into Electron
```

Generated folders are not source code:

- `apps/desktop/dist`: compiled Electron main and preload scripts.
- `apps/desktop/release`: installer and unpacked Windows application.

## Build commands

Run from the repository root in Git Bash:

```bash
pnpm --filter @mentorapredict/desktop dev
pnpm --filter @mentorapredict/desktop build
pnpm --filter @mentorapredict/desktop package:local
pnpm --filter @mentorapredict/desktop package:qa
pnpm --filter @mentorapredict/desktop package:prod
```

Packaging first builds the selected web mode, compiles Electron, and then creates `apps/desktop/release/MentoraPredict_Setup_<version>_<arch>.exe`.
