# Web Project Structure

The web application lives in `apps/web`.

```text
apps/web/
├── public/                 Static public assets
├── src/
│   ├── assets/             Imported images and media
│   ├── components/         Atomic Design UI
│   ├── features/           Domain components and workflows
│   ├── hooks/              Cross-domain React hooks
│   ├── pages/              Route-level screens
│   ├── providers/          Application context providers
│   ├── routes/             Paths, guards, and router
│   ├── services/           HTTP, sockets, query configuration
│   ├── store/              Client-owned global state
│   ├── styles/             Global CSS and design tokens
│   ├── types/              Shared TypeScript contracts
│   └── utils/              Pure helpers and infrastructure utilities
├── .storybook/             Component development configuration
├── package.json
└── vite.config.ts
```

## File placement

- Put a reusable visual primitive in `components`.
- Put course, student, teacher, admin, auth, profile, or notification behavior in its `features` domain.
- Put full routed screens in `pages` and route declarations in `routes`.
- Put backend communication in `services` and reusable contracts in `types`.
- Keep feature-specific hooks with their feature; reserve `src/hooks` for cross-domain behavior.

Use the `@/` alias for imports from `src`. Component folders use a component file plus `index.ts`; add stories or tests beside the component when useful.
