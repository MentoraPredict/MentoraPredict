# Web Architecture

MentoraPredict Web is a React single-page application served by Vite. It communicates with backend microservices only through the API gateway.

```text
Router -> Pages -> Feature components/hooks -> Services -> API gateway
                    |                         |
                    +-- Atomic UI             +-- Axios / Socket.IO
                    +-- Zustand session       +-- TanStack Query cache
```

## Responsibilities

- **Routes:** declare navigation and enforce authentication and roles.
- **Pages:** assemble a complete route; they contain minimal logic.
- **Features:** own domain UI, hooks, and workflows.
- **Components:** provide reusable, business-agnostic Atomic Design elements.
- **Services:** centralize HTTP, Socket.IO, endpoint usage, and DTO mapping.
- **Store:** keeps client-owned global state, primarily the authenticated session.
- **TanStack Query:** owns remote server state and cache synchronization.
- **Types:** define shared frontend contracts.

`App.tsx` installs application providers, while `AppRouter.tsx` separates public routes from `STUDENT`, `TEACHER`, and `ADMIN` routes. Browser builds use `BrowserRouter`; packaged desktop builds use `HashRouter` when loaded through `file:`.

## Boundaries

- Backend data is not stored in Zustand when TanStack Query can own it.
- Domain rules do not belong in generic components.
- Endpoint strings do not belong in pages, hooks, or components.
- Backend DTO differences are normalized in services before reaching the UI.
