# MentoraPredict Web Architecture

This document explains the frontend architecture for `apps/web` and how the project is organized from the top level monorepo down to the state layer.

It is the main reference for understanding why each layer exists and how they work together.

## Project Context

MentoraPredict is an academic platform focused on predicting student risk using academic data, metrics, alerts, and AI-driven recommendations.

The frontend stack is:

- React 19
- TypeScript
- Vite
- React Router
- React Hook Form
- Zustand
- Axios
- TailwindCSS v4
- Framer Motion
- Recharts
- React Icons

The app communicates with backend microservices through Kong.

## Architecture Flow

The frontend should be understood from top to bottom as:

```txt
monorepo
  -> apps/web
    -> Atomic Design
      -> features
        -> services
          -> store
```

That order matters because each layer solves a different kind of problem.

## Monorepo

MentoraPredict is a monorepo, so the frontend does not live alone.

The monorepo contains:

- `apps/web` for the web frontend
- backend services such as `auth-service`, `academic-service`, `analytics-service`, and others
- shared packages for types, utilities, and configuration
- infra for Docker, Kong, and environment setup

### Why the monorepo matters

- It keeps frontend and backend contracts close.
- It makes it easier to align types, endpoints, and domain language.
- It supports shared design and shared utilities across the platform.
- It allows the frontend to evolve with the backend microservices without losing structure.

## apps/web

`apps/web` is the frontend application inside the monorepo.

It is responsible for:

- presenting the user interface
- routing users to the right screens
- calling backend services
- managing auth session state
- rendering domain screens for courses, analytics, recommendations, and dashboards

It should not contain business rules that belong to backend services.

## Atomic Design

Atomic Design is the visual foundation of the web app.

Current structure:

```txt
src/
  components/
    atoms/
    molecules/
    organisms/
    templates/
```

### Why `components` exists

`components` exists to hold reusable UI building blocks that are not tied to a specific business domain.

Examples:

- `Button`
- `Input`
- `Badge`
- `Text`
- `Heading`
- `FormField`
- `PasswordField`
- `Navbar`
- `AuthTemplate`

These elements can be reused across auth screens, dashboard screens, course screens, and future features.

### What does not belong in `components`

Business-specific elements should not live here.

Examples of what should move to `features`:

- `CourseCard`
- `StudentRiskSummary`
- `TeacherDashboardPanel`
- `RecommendationTimeline`

Those are domain components, not generic UI primitives.

## Features

`features` is the business layer of the frontend.

### Why `features` exists

`features` exists because the product is not organized around UI atoms; it is organized around business domains.

The real domains of MentoraPredict are:

- auth
- courses
- analytics
- recommendations
- students
- teachers
- admin

So the correct structure is:

```txt
features/
  auth/
  courses/
  analytics/
  recommendations/
  students/
  teachers/
  admin/
```

### Why this layer is needed

- It keeps domain logic away from pure UI components.
- It makes large screens easier to split and maintain.
- It keeps data fetching, mapping, and business-specific composition close together.
- It makes the app easier to scale when new modules appear.

### What belongs in `features`

Each feature may contain:

- domain components
- feature hooks
- mappers
- feature-specific types
- feature-specific services or adapters

Example:

```txt
features/courses/
  components/
  hooks/
  mappers/
  types/
```

## Pages

`pages` represents route-level screens.

Pages are compositions of features and templates.

Examples:

- `LoginPage`
- `RegisterPage`
- `StudentDashboardPage`
- `TeacherCoursesPage`
- `AdminUsersPage`

Pages should stay thin. Their role is to decide what to render, not to contain heavy logic.

## Services

`services` is the communication layer with backend microservices.

### Why `services` exists

`services` exists so that UI components do not know about endpoints, HTTP details, headers, tokens, or backend service boundaries.

It centralizes:

- Axios setup
- endpoint constants
- auth requests
- users requests
- academic requests
- analytics requests
- recommendations requests

### What belongs in `services`

Recommended structure:

```txt
services/
  api/
    axiosClient.ts
    endpoints.ts
    httpErrors.ts
    tokenStorage.ts
  auth/
    auth.service.ts
  users/
    users.service.ts
  academic/
    courses.service.ts
    enrollments.service.ts
    evaluations.service.ts
    grades.service.ts
  analytics/
    risk.service.ts
    alerts.service.ts
  recommendations/
    recommendations.service.ts
    observations.service.ts
```

### Why this layer is needed

- It prevents hardcoded URLs from spreading across the app.
- It makes backend changes easier to absorb.
- It keeps API behavior consistent.
- It makes the frontend easier to test and reason about.

## Store

`store` is the global state layer.

MentoraPredict uses Zustand for session and app-wide state.

### Why `store` exists

`store` exists to keep global state centralized and predictable.

It should handle:

- authenticated user
- role
- session status
- token lifecycle
- login and logout state

The auth store should be the single source of truth for session state.

### Important rule

There should not be three different places trying to manage session state.

Recommended model:

```txt
AuthStore = source of truth
tokenStorage = internal persistence helper
axiosClient = attaches token to requests
```

Only the store should orchestrate auth state. Persistence helpers should stay internal.

## Auth Flow

The login flow should work like this:

```txt
LoginForm
  -> auth.service.login()
  -> save tokens
  -> users.service.me()
  -> auth.store saves user + role
  -> RoleRedirect sends the user to the correct dashboard
```

### Why `/users/me` matters

The JWT is for authentication.

The backend user endpoint is for business identity.

That means:

- JWT answers: "is this request authenticated?"
- `/users/me` answers: "who is the user, what role do they have, and what is their current status?"

This is cleaner than decoding JWT in the frontend to derive business state.

## Routes

`routes` defines the navigation architecture.

Recommended route tools:

- `AppRouter.tsx`
- `paths.ts`
- `ProtectedRoute.tsx`
- `PublicOnlyRoute.tsx`
- `RoleRedirect.tsx`

### Route responsibilities

- `ProtectedRoute` blocks unauthenticated access.
- `PublicOnlyRoute` keeps authenticated users away from auth pages.
- `RoleRedirect` moves the user to the right area after login.

## Types

`types` contains frontend contracts.

Use folder-based organization for scaling:

```txt
types/
  auth/
  user/
  course/
  analytics/
  recommendation/
  api/
```

This works better than a flat list of files because the domain set will keep growing.

## Why The Layers Exist

### Why features exists

To separate business domains from generic UI.

### Why components exists

To reuse clean, domain-agnostic UI building blocks.

### Why services exists

To isolate HTTP, endpoints, and microservice integration from the rest of the app.

### Why store exists

To centralize global state, especially auth session state.

## Current Direction

The frontend should evolve around the following product model:

```txt
user
  -> courses
    -> course
      -> modules / evaluations / metrics / risk / recommendations
```

That model is more faithful to the product than a UI-first or auth-first structure.

## Final Rule Set

- Keep Atomic Design inside `components`.
- Keep domain logic inside `features`.
- Keep HTTP behavior inside `services`.
- Keep global session state inside `store`.
- Keep route policy inside `routes`.
- Keep shared contracts inside `types`.
- Keep pages thin and compositional.
- Keep the frontend language aligned with the product language.

## Summary

The architecture is intentionally layered:

```txt
monorepo
  -> apps/web
    -> components
      -> features
        -> services
          -> store
```

This gives MentoraPredict a frontend that can grow across auth, courses, analytics, recommendations, dashboards, and future AI-powered features without losing clarity.
