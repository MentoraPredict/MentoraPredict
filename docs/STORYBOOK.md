# Storybook

Storybook is the isolated development and documentation environment for reusable components in `apps/web`. It currently covers 47 stories across Atomic Design atoms, molecules, and organisms.

## Purpose

- Develop components without running the full application.
- Review props, variants, empty states, and interaction states.
- Keep Atomic Design behavior visually consistent.
- Run stories in a real Chromium browser through Vitest and Playwright.
- Inspect accessibility issues during development.

Storybook complements unit tests and application pages; it does not replace domain integration or end-to-end testing.

## Configuration

```text
apps/web/.storybook/
├── main.ts       Story discovery, framework, and addons
└── preview.tsx   Global styles, providers, and parameters
```

`main.ts` loads `src/**/*.stories.@(js|jsx|mjs|ts|tsx)` with the React/Vite framework and enables:

| Addon | Use |
| --- | --- |
| Docs | Generates component documentation from stories and controls |
| Accessibility | Reports accessibility violations |
| Vitest | Executes portable story tests |
| Chromatic | Supports visual review workflows |
| MCP | Exposes Storybook metadata to compatible development tools |

`preview.tsx` imports Inter and the application's global CSS. Every story receives:

- `MemoryRouter`, allowing navigation-aware components to render safely;
- `QueryClientProvider`, with retries and window-focus refetch disabled;
- automatic color and date controls.

Accessibility is currently configured with `test: "todo"`. Violations appear in the test UI but do not fail CI. Change it to `"error"` only after the existing story catalog has been audited.

## Commands

Run from the repository root in Git Bash:

```bash
# Start the interactive catalog at http://localhost:6006
pnpm --filter @mentorapredict/web storybook

# Generate the static catalog in apps/web/storybook-static
pnpm --filter @mentorapredict/web build-storybook

# Run stories in headless Chromium
pnpm --filter @mentorapredict/web exec vitest --project storybook
```

The browser test project is configured in `apps/web/vite.config.ts` and requires Playwright's Chromium browser to be installed.

## Story location and naming

Place a story beside its component:

```text
components/atoms/Badge/
├── Badge.tsx
├── Badge.stories.tsx
└── index.ts
```

Use Atomic Design titles when declaring one explicitly:

```ts
import type { Meta, StoryObj } from "@storybook/react-vite";

import Badge from "./Badge";

const meta = {
  title: "Atoms/Badge",
  component: Badge,
  args: { children: "Label" },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Inactive: Story = {
  args: { tone: "red", children: "Inactive" },
};
```

Recommended title groups are `Atoms`, `Molecules`, `Organisms`, and `Templates`. Domain-specific components may use `Features/<Domain>` when stories are added for them.

## Story rules

- Use `Meta` and `StoryObj` from `@storybook/react-vite`.
- Define shared defaults in `meta.args` and keep each story focused on one meaningful state.
- Cover visual variants, disabled/loading states, validation, empty content, and long text when applicable.
- Use `fn()` from `storybook/test` for callback props.
- Use `play` only for behavior that needs real user interaction.
- Keep API calls deterministic: mock data or requests instead of relying on running backend services.
- Do not duplicate application business logic inside a story.
- Prefer accessible queries and ensure interactive controls have labels.

## What belongs in Storybook

Prioritize reusable Atomic Design components. Add domain component stories when the component has important states that can be represented without a complete route or live backend. Full pages, authentication flows, sockets, and cross-service scenarios belong in integration or end-to-end tests.

## Validation checklist

Before accepting a new or changed component:

1. Add or update its representative stories.
2. Check controls and all intended variants at narrow and wide widths.
3. Review the Accessibility panel.
4. Confirm callbacks appear in the Actions panel or test spy output.
5. Build Storybook and run the browser project before merging significant design-system changes.
