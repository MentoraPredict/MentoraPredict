# MentoraPredict Web - Frontend Architecture

This document summarizes the frontend architecture agreed upon for `apps/web` up to this point. Its purpose is to serve as a reference guide for understanding how the frontend should grow without mixing responsibilities, while maintaining a scalable foundation for dashboards, roles, courses, analytics, and future AI integrations.

## Project Context

MentoraPredict is an academic application focused on predicting student risk through academic data, metrics, alerts, and AI-generated recommendations.

The frontend is built with:

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

The project lives inside a monorepo and consumes microservices through Kong/API Gateway.

## Architectural Principle

The frontend architecture should not revolve around technical folders or around the user as the main entity.

The primary mental model of the product is:

```txt id="w7lq4f"
User
-> Courses
-> Course
-> Modules / Evaluations / Metrics / Risk / Recommendations
```

Although the backend uses entities such as `subjects`, the frontend should expose the concept as `courses`, because that is the clearest language for the user experience.

## Separation Of Responsibilities

The architecture is organized under this rule:

```txt id="gzjlwm"
components = reusable visual system
features = business domains
pages = view composition
routes = navigation and authorization
services = communication with microservices
store = minimal global state
types = TypeScript contracts
hooks = reusable utilities
```

## Recommended Structure

```txt id="fssxwn"
src/
├── assets/
├── components/
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   └── templates/
│
├── features/
│   ├── auth/
│   ├── courses/
│   ├── analytics/
│   ├── recommendations/
│   ├── students/
│   ├── teachers/
│   └── admin/
│
├── pages/
│   ├── public/
│   ├── auth/
│   ├── student/
│   ├── teacher/
│   └── admin/
│
├── routes/
├── services/
├── store/
├── hooks/
├── types/
├── utils/
├── styles/
├── config/
├── App.tsx
└── main.tsx
```

## Atomic Design

The project maintains Atomic Design in `components/`.

This folder should contain reusable components without strong business logic.

Correct examples:

```txt id="y5ynzv"
components/atoms/Button
components/atoms/Input
components/atoms/Badge
components/molecules/FormField
components/molecules/PasswordField
components/organisms/Navbar
components/templates/AuthTemplate
```

Components such as `CourseRiskPanel`, `StudentGradesTable`, or `TeacherCourseSummary` should not live in `components/`, because they belong to a domain. Those components must be inside `features/`.

## Features

`features/` represents real business domains, not views.

This folder exists to isolate business logic by domain and prevent screens from becoming containers for everything.

In the current codebase, the first domain already materialized is `features/auth`, with its authentication components moved out of `components/organisms`.

Defined domains for MentoraPredict:

```txt id="jlwmna"
features/
├── auth/
├── courses/
├── analytics/
├── recommendations/
├── students/
├── teachers/
└── admin/
```

A feature called `dashboard` is not created because a dashboard is a composed view, not a domain. Dashboards are built by combining real features.

Example:

```txt id="0yyhmy"
StudentDashboardPage
-> courses
-> analytics
-> recommendations
-> students
```

Each feature can grow with this canonical structure:

```txt id="h8oz0r"
features/courses/
├── components/
├── hooks/
├── mappers/
├── services/
└── types/
```

The idea is:

- `components/`: visual pieces of the domain.
- `hooks/`: reusable domain behavior.
- `mappers/`: transformation between API and UI.
- `services/`: domain HTTP calls.
- `types/`: domain TypeScript contracts.

If a piece describes courses, students, analytics, or recommendations, it should not go into global `components/`. It must live inside its corresponding feature.

## Pages

`pages/` represents complete screens connected to the router.

Recommended structure:

```txt id="a5wx3m"
pages/
├── public/
│   └── LandingPage/
├── auth/
│   ├── LoginPage/
│   ├── RegisterPage/
│   └── ForgotPasswordPage/
├── student/
│   ├── StudentDashboardPage/
│   ├── StudentCoursesPage/
│   └── StudentCourseDetailPage/
├── teacher/
│   ├── TeacherDashboardPage/
│   ├── TeacherCoursesPage/
│   ├── TeacherCourseDetailPage/
│   └── TeacherStudentsPage/
└── admin/
    ├── AdminDashboardPage/
    ├── UsersPage/
    ├── CoursesManagementPage/
    └── DataIngestionPage/
```

Pages should compose features and templates. They should not contain too much business logic or direct HTTP calls.

## Routes

`routes/` centralizes navigation, route protection, and role-based redirection.

Recommended structure:

```txt id="9c9m3j"
routes/
├── AppRouter.tsx
├── paths.ts
├── routeConfig.ts
├── ProtectedRoute.tsx
├── PublicOnlyRoute.tsx
└── RoleRedirect.tsx
```

Responsibilities:

- `paths.ts`: centralized frontend routes.
- `routeConfig.ts`: declarative route configuration.
- `ProtectedRoute.tsx`: requires an active session.
- `PublicOnlyRoute.tsx`: prevents an authenticated user from returning to screens such as login.
- `RoleRedirect.tsx`: redirects according to the user's role.

Expected redirection:

```txt id="1a9e5i"
STUDENT -> /student/dashboard
TEACHER -> /teacher/dashboard
ADMIN   -> /admin/dashboard
```

## Services

`services/` contains communication with microservices and HTTP configuration.

Recommended structure:

```txt id="y7kb5y"
services/
├── api/
│   ├── axiosClient.ts
│   ├── endpoints.ts
│   ├── httpErrors.ts
│   ├── tokenStorage.ts
│   └── index.ts
├── auth/
│   └── auth.service.ts
├── users/
│   └── users.service.ts
├── academic/
│   ├── courses.service.ts
│   ├── enrollments.service.ts
│   ├── evaluations.service.ts
│   └── grades.service.ts
├── analytics/
│   ├── risk.service.ts
│   └── alerts.service.ts
├── metrics/
│   └── metrics.service.ts
└── recommendations/
    ├── recommendations.service.ts
    └── observations.service.ts
```

URLs must not be hardcoded inside forms or components.

A central file should exist:

```txt id="94rmio"
services/api/endpoints.ts
```

Conceptual example:

```txt id="rk0j0r"
AUTH.LOGIN
AUTH.REGISTER
USERS.ME
ACADEMIC.COURSES
ANALYTICS.STUDENT_DASHBOARD
RECOMMENDATIONS.BY_STUDENT
```

Even if the backend exposes `/subjects`, the frontend should work with `courses.service.ts` and internally map to the corresponding endpoint.

## Auth And Session

The source of truth for the session must be Zustand:

```txt id="5guk6t"
store/auth.store.ts
```

Important rule:

```txt id="c0j25o"
AuthStore = source of truth
```

`tokenStorage` may exist, but only as an internal detail used by the store or the Axios client. It should not be used directly from components or pages.

Recommended flow:

```txt id="9dmdv8"
LoginForm
-> auth.service.login()
-> store tokens
-> users.service.me()
-> auth.store stores user and role
-> RoleRedirect navigates according to role
```

JWT should be treated as an authentication mechanism, not as a source of user data.

User information, role, permissions, and status should come from:

```txt id="m9lv9n"
/api/v1/users/me
```

## Store

Zustand should be used for real global state.

Recommended structure:

```txt id="sjhx0n"
store/
├── auth.store.ts
├── app.store.ts
└── index.ts
```

`auth.store.ts` should manage:

- tokens
- authenticated user
- role
- session state
- login
- logout
- session hydration

It is not recommended to globally store all course lists, dashboards, or metrics from the beginning. Those data can live in feature hooks or local state until the volume justifies another pattern.

## Types

Types should grow in folders, not in flat files.

Recommended structure:

```txt id="t4yzpd"
types/
├── auth/
│   ├── auth.types.ts
│   ├── auth-api.types.ts
│   └── index.ts
├── user/
│   ├── user.types.ts
│   ├── role.types.ts
│   └── index.ts
├── course/
│   ├── course.types.ts
│   ├── enrollment.types.ts
│   ├── evaluation.types.ts
│   ├── grade.types.ts
│   └── index.ts
├── analytics/
│   ├── risk.types.ts
│   ├── alert.types.ts
│   ├── dashboard.types.ts
│   └── index.ts
├── recommendation/
│   ├── recommendation.types.ts
│   ├── observation.types.ts
│   └── index.ts
└── api/
    ├── api-error.types.ts
    ├── pagination.types.ts
    └── index.ts
```

This makes it possible to maintain strict TypeScript without turning `types/` into an unmanageable folder.

## Hooks

`hooks/` should contain reusable global hooks:

```txt id="ewlv4e"
hooks/
├── useAuth.ts
├── useRole.ts
├── useProtectedAction.ts
├── usePagination.ts
├── useDebounce.ts
└── useDisclosure.ts
```

Domain hooks should live inside their feature:

```txt id="zdxkbe"
features/courses/hooks/useCourses.ts
features/analytics/hooks/useStudentRisk.ts
features/recommendations/hooks/useRecommendations.ts
```

## Config

It is recommended to add:

```txt id="tdb1kk"
config/
├── env.ts
├── roles.ts
└── navigation.ts
```

Responsibilities:

- `env.ts`: typed access to `VITE_*` variables.
- `roles.ts`: role and permission definitions.
- `navigation.ts`: role-based menu and navigation.

## Styles And Design System

The current styles structure is:

```txt id="g6cvgx"
styles/
├── globals.css
├── colors.css
├── typography.css
├── spacing.css
└── theme.css
```

Recommended responsibilities:

- `colors.css`: color tokens.
- `typography.css`: families, weights, scales, and line-height.
- `spacing.css`: spacing, radii, shadows, and containers.
- `theme.css`: integration of tokens with TailwindCSS v4.
- `globals.css`: imports and global base styles.

## Growth Rules

- Do not call HTTP services from generic atoms, molecules, or organisms.
- Do not hardcode endpoints inside components.
- Do not use JWT as the user model.
- Do not duplicate the session between Zustand, localStorage, and helpers.
- Do not create features for views; create features for domains.
- Do not mix backend language with UX language when they do not match.
- Use `Course` in the frontend even if the backend uses `Subject`.
- Keep dashboards as pages that compose features.
- Keep types close to the contract, but keep language close to the user.

## Summary

The final architecture aims for MentoraPredict Web to be:

- clear for the frontend team,
- scalable to new roles,
- prepared for complex dashboards,
- compatible with microservices,
- maintainable under strict TypeScript,
- aligned with Atomic Design,
- ready for future AI features.

The central idea is simple:

```txt id="twtg9r"
Course as the main entity
Role as the access policy
Microservices as an infrastructure detail
Atomic Design as the visual system
Features as business modules
Pages as view composition
```
