# MentoraPredict Web - Frontend Structure

This document explains the purpose of each major folder inside `apps/web/src` and what should or should not live there.

It is meant to be a practical guide for working inside the current frontend structure of MentoraPredict.

## Current Mental Model

The frontend is organized as:

```txt
src/
├── components
├── features
├── pages
├── routes
├── services
├── store
├── hooks
├── types
├── config
├── utils
└── styles
```

Each folder has a different responsibility.

## `components/`

This is the reusable UI system of the app, built with Atomic Design.

### What goes here

- `atoms`: basic UI primitives like buttons, inputs, text, badges, labels, icons wrappers
- `molecules`: small combinations of atoms like form fields, password fields, auth footer pieces
- `organisms`: larger reusable UI blocks like navbar, footer, login form shell, hero sections
- `templates`: page scaffolds that define layout structure without business logic

### What should not go here

- API calls
- auth session logic
- role redirects
- feature-specific business components
- page-level routing logic
- domain mappers
- backend DTOs

### In the current project

The project already uses this folder for:

- `atoms/Button`
- `atoms/Input`
- `atoms/Text`
- `atoms/Heading`
- `molecules/FormField`
- `molecules/PasswordField`
- `organisms/LoginForm`
- `organisms/Navbar`
- `templates/AuthTemplate`
- `templates/LandingTemplate`

That is correct for Atomic Design.

## `features/`

This is the business layer of the frontend.

### What goes here

- domain-specific components
- domain-specific hooks
- mappers
- feature-specific service wrappers
- feature-specific types
- domain composition logic

Recommended features for MentoraPredict:

- `auth`
- `courses`
- `analytics`
- `recommendations`
- `students`
- `teachers`
- `admin`

### What should not go here

- generic UI atoms or molecules
- page routes
- top-level app bootstrap code
- global Axios setup
- generic helpers that are not domain-specific

### In the current project

This folder is the right home for future pieces like:

- course cards
- student risk panels
- teacher subject summaries
- recommendation timelines
- dashboard blocks that are specific to a role or domain

Even if a piece looks visual, if it belongs to a business concept, it should live here instead of `components/`.

### Canonical feature shape

When a feature grows, this is the recommended internal structure:

```txt
features/courses/
├── components/
├── hooks/
├── mappers/
├── services/
└── types/
```

Use the same pattern for `auth`, `analytics`, `recommendations`, `students`, `teachers`, and `admin`.

That keeps the domain self-contained and makes it easier to move, test, or scale without mixing it with generic UI.

## `pages/`

This is the route-level screen layer.

### What goes here

- full screens mapped to routes
- page composition
- minimal page-level orchestration
- layout selection for each route

Examples:

- `auth/LoginPage`
- `auth/RegisterPage`
- `auth/ForgotPasswordPage`
- `student/StudentDashboardPage`
- `teacher/TeacherDashboardPage`
- `admin/AdminDashboardPage`

### What should not go here

- reusable UI primitives
- HTTP calls
- global state management
- route guard implementation
- feature internals

### In the current project

The current pages already reflect this direction:

- `LandingPage`
- `auth/LoginPage`
- `auth/RegisterPage`
- `auth/ForgotPasswordPage`

That is a good base. The next step is to keep pages thin and move domain-heavy logic into `features/`.

## `routes/`

This folder controls navigation and access policy.

### What goes here

- router definitions
- path constants
- protected route wrappers
- public-only route wrappers
- role-based redirects

### What should not go here

- screen UI
- service calls
- component styling
- feature logic

### In the current project

`AppRouter.tsx` currently defines the basic routes:

- `/`
- `/login`
- `/register`
- `/forgot-password`

As the app grows, this folder should also handle:

- route protection for authenticated users
- redirect by role
- dashboard route grouping

## `services/`

This folder contains all communication with backend services.

### What goes here

- Axios client configuration
- centralized endpoint constants
- auth service
- users service
- academic service wrappers
- analytics service wrappers
- recommendations service wrappers
- error normalization helpers
- token persistence helpers if they are purely internal

### What should not go here

- React components
- page logic
- Zustand store definitions
- route guards
- feature UI

### In the current project

The current structure already uses:

- `services/api.ts`
- `services/auth.service.ts`

That is the right idea, but it should evolve into a more explicit service structure, with centralized endpoints and separate service modules per backend domain.

## `store/`

This folder holds global application state.

### What goes here

- auth session state
- current user
- role
- login/logout actions
- app-wide UI state if needed
- persisted state that must survive navigation

### What should not go here

- server data that only belongs to one screen
- reusable UI logic
- route definitions
- backend request functions

### In the current project

This folder is not fully built yet, but it should become the single source of truth for auth session state.

Recommended rule:

```txt
AuthStore owns session state
services own HTTP
components only consume state
```

## `hooks/`

This folder contains reusable React hooks that are not tied to one feature.

### What goes here

- `useAuth`
- `useRole`
- `usePagination`
- `useDebounce`
- `useDisclosure`
- other reusable UI or workflow hooks

### What should not go here

- feature-specific fetch hooks
- page-only hooks
- generic helpers that do not use React

### In the current project

Hooks like `useForm` are used locally where needed, which is fine.

As the app grows, common behaviors like auth checks or role checks should move into this folder.

## `types/`

This folder contains TypeScript contracts for the frontend.

### What goes here

- auth types
- user types
- course types
- analytics types
- recommendation types
- API response types
- pagination types

### What should not go here

- React components
- runtime logic
- service implementations
- UI-only constants

### Recommended shape

Use folders by domain:

```txt
types/
├── auth/
├── user/
├── course/
├── analytics/
├── recommendation/
└── api/
```

### Why this matters

The project will keep growing, and a folder-based type structure is easier to maintain than a flat list of type files.

## `config/`

This folder stores app-level configuration that is not UI code and not service code.

### What goes here

- environment access helpers
- role definitions
- navigation maps
- app constants
- route constants if you prefer not to place them in `routes/`

### What should not go here

- components
- HTTP calls
- store logic
- feature logic

### In the current project

This folder is still part of the planned structure.

It will become useful for:

- role names
- permission maps
- nav menus by role
- environment variable parsing

## `utils/`

This folder is for pure helpers.

### What goes here

- date helpers
- string helpers
- formatters
- mapper utilities that are not feature-specific
- small pure functions

### What should not go here

- React hooks
- services
- state logic
- UI components

### In the current project

This folder is optional but useful for generic helpers like formatting or small transformations that do not belong to one feature.

## `styles/`

This folder contains global styling and design tokens.

### What goes here

- `globals.css`
- `colors.css`
- `typography.css`
- `spacing.css`
- `theme.css`

### What should not go here

- component styles that are better expressed with Tailwind classes
- business logic
- app state

### In the current project

The project already has:

- `colors.css`
- `typography.css`
- `spacing.css`
- `globals.css`
- `theme.css`

This is a good foundation for a consistent visual system.

## How The Current Project Fits

The current `apps/web` structure already points in the right direction:

- `components/` has Atomic Design foundations
- `pages/` already separates public and auth screens
- `routes/AppRouter.tsx` centralizes route declaration
- `services/api.ts` and `services/auth.service.ts` already support backend integration

The missing step is not a redesign from scratch.
The missing step is to deepen the structure so that business domains move into `features/`, session logic moves into `store/`, and all backend endpoints are centralized cleanly.

## Simple Placement Rule

When deciding where a file should live, use this rule:

```txt
If it is reusable UI -> components
If it is business logic -> features
If it is a full screen -> pages
If it is navigation -> routes
If it talks to backend -> services
If it is global session state -> store
If it is shared contract -> types
If it is reusable React behavior -> hooks
If it is app-level constants -> config
If it is pure helper logic -> utils
```

## Summary

The frontend structure of MentoraPredict should stay clear by separating visual primitives, business domains, screens, routing, HTTP, session state, and shared contracts.

That separation is what will let the app grow into dashboards, role-based navigation, courses, analytics, and AI features without becoming tangled.
