# MentoraPredict Web - Routing

This document describes the frontend routes of `apps/web`, their current state in the codebase, and the expected structure for public routes, private routes, and role-based redirection.

The route configuration lives in:

```txt id="bqj4ur"
src/routes/AppRouter.tsx
```

The project currently uses:

- `BrowserRouter`
- `Routes`
- `Route`
- `useNavigate` for programmatic navigation from forms and public sections

## Current State

The router currently implemented is simple and only declares public screens:

```txt id="c4e7rh"
/
/login
/register
/forgot-password
```

Current code:

```tsx id="r4gbr6"
<BrowserRouter>
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
  </Routes>
</BrowserRouter>
```

The following files do not yet exist in `src/routes`:

```txt id="2psjmb"
ProtectedRoute.tsx
PublicOnlyRoute.tsx
RoleRedirect.tsx
paths.ts
routeConfig.ts
```

These files are part of the recommended architecture described in the project documentation and should be added when dashboards, global session management, and role-based access control are implemented.

## Public Routes

Public routes are accessible without an active session.

| Route              | Page                 | Status      | Description                              |
| ------------------ | -------------------- | ----------- | ---------------------------------------- |
| `/`                | `LandingPage`        | Implemented | MentoraPredict public landing page.      |
| `/login`           | `LoginPage`          | Implemented | Login screen.                            |
| `/register`        | `RegisterPage`       | Implemented | User registration screen.                |
| `/forgot-password` | `ForgotPasswordPage` | Implemented | Screen for requesting password recovery. |

### Current Public Navigation

Public navigation appears in these components:

- `HeroSection`: navigates to `/login`.
- `Navbar`: navigates to `/login`.
- `LoginForm`: navigates to `/register`, `/forgot-password`, and after a successful login, to `/`.
- `RegisterForm`: navigates to `/login`.
- `ForgotPasswordForm`: navigates to `/login`.

## Public Routes For Guests Only

These routes are public in the current state, but once global session management exists, they should be wrapped by `PublicOnlyRoute`:

```txt id="v94xtd"
/login
/register
/forgot-password
```

The reason is that an authenticated user should not return to authentication screens. If an active session already exists, the user should be sent to the appropriate area through `RoleRedirect`.

Expected flow:

```txt id="o9g8l8"
Authenticated user opens /login
-> PublicOnlyRoute detects active session
-> RoleRedirect determines destination based on role
-> /student/dashboard, /teacher/dashboard, or /admin/dashboard
```

## Private Routes

Private routes are not yet implemented in `AppRouter.tsx`, but the project architecture already defines three main role-based areas:

```txt id="rrny2v"
/student/*
/teacher/*
/admin/*
```

These routes must be protected by `ProtectedRoute`.

| Pattern      | Expected Role | Status  | Description                                                             |
| ------------ | ------------- | ------- | ----------------------------------------------------------------------- |
| `/student/*` | `STUDENT`     | Pending | Student area: dashboard, courses, metrics, risk, and recommendations.   |
| `/teacher/*` | `TEACHER`     | Pending | Teacher area: dashboard, courses, students, analytics, and monitoring.  |
| `/admin/*`   | `ADMIN`       | Pending | Administrative area: users, courses, data ingestion, and configuration. |

## Recommended Private Routes

When internal pages are implemented, it is recommended to declare at least these routes:

### Student

```txt id="56ivkx"
/student/dashboard
/student/courses
/student/courses/:courseId
/student/recommendations
/student/profile
```

Expected responsibilities:

- View the student's academic summary.
- Consult enrolled courses.
- Review course details, evaluations, and metrics.
- View academic risk and recommendations.

### Teacher

```txt id="g0r7gl"
/teacher/dashboard
/teacher/courses
/teacher/courses/:courseId
/teacher/courses/:courseId/students
/teacher/students
```

Expected responsibilities:

- View a summary of assigned courses.
- Consult students by course.
- Review metrics, alerts, and academic risk.
- Monitor student progress.

### Admin

```txt id="jtm7fa"
/admin/dashboard
/admin/users
/admin/courses
/admin/data-ingestion
/admin/settings
```

Expected responsibilities:

- Manage users.
- Manage courses.
- Manage data loading or ingestion.
- Review the overall platform status.

## Role-Based Redirection

The expected redirection after login must depend on the authenticated user's role:

```txt id="jmu5s0"
STUDENT -> /student/dashboard
TEACHER -> /teacher/dashboard
ADMIN   -> /admin/dashboard
```

In the current state, `LoginForm` executes:

```tsx id="zfy3l0"
await login(data);
navigate("/");
```

This means that, for now, after logging in, the user returns to the landing page. Once `RoleRedirect` exists, that `navigate("/")` should be replaced by a role-based redirection using the role loaded into the auth store.

Recommended flow:

```txt id="qqh2i8"
LoginForm
-> auth.service.login()
-> store tokens
-> users.service.me()
-> auth.store stores user and role
-> RoleRedirect sends the user to the correct dashboard
```

## ProtectedRoute

`ProtectedRoute` must block access to private routes when there is no active session.

Responsibilities:

- Read the authentication state from the auth store.
- Allow rendering the private route if the user is authenticated.
- Redirect to `/login` if there is no session.
- Optionally validate roles allowed for the route.

Expected usage:

```tsx id="7vk7dd"
<Route
  path="/student/*"
  element={
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <StudentRoutes />
    </ProtectedRoute>
  }
/>
```

Expected behavior:

```txt id="5wztcv"
User without a session opens /student/dashboard
-> ProtectedRoute detects that the user is not authenticated
-> redirects to /login
```

If role validation is implemented:

```txt id="gk96vw"
STUDENT user opens /admin/users
-> ProtectedRoute detects an unauthorized role
-> redirects to their dashboard or to a 403 page
```

## PublicOnlyRoute

`PublicOnlyRoute` must prevent an authenticated user from returning to screens intended only for guests.

Candidate routes:

```txt id="9iudl0"
/login
/register
/forgot-password
```

Responsibilities:

- Allow access if there is no session.
- Redirect if an active session already exists.
- Delegate the destination to `RoleRedirect` or a role-based routing function.

Expected usage:

```tsx id="2zy9wf"
<Route
  path="/login"
  element={
    <PublicOnlyRoute>
      <LoginPage />
    </PublicOnlyRoute>
  }
/>
```

Expected behavior:

```txt id="5mdrfd"
Authenticated user opens /login
-> PublicOnlyRoute detects active session
-> RoleRedirect calculates destination
-> user ends up on their dashboard
```

## RoleRedirect

`RoleRedirect` must centralize the destination decision based on role.

Responsibilities:

- Read the authenticated user's role from the auth store.
- Convert the role into an initial route.
- Redirect to the correct screen.
- Prevent forms or pages from duplicating role-based navigation rules.

Expected mapping:

| Role      | Destination          |
| --------- | -------------------- |
| `STUDENT` | `/student/dashboard` |
| `TEACHER` | `/teacher/dashboard` |
| `ADMIN`   | `/admin/dashboard`   |

Expected usage:

```tsx id="0n9j3o"
<Route
  path="/redirect"
  element={
    <ProtectedRoute>
      <RoleRedirect />
    </ProtectedRoute>
  }
/>
```

It can also be used internally within `PublicOnlyRoute` when an authenticated user attempts to open a public guest-only route.

## Recommended Routes Structure

To allow the router to scale without filling `AppRouter.tsx` with repeated rules, the following structure is recommended:

```txt id="amjyf9"
src/routes/
|-- AppRouter.tsx
|-- paths.ts
|-- routeConfig.ts
|-- ProtectedRoute.tsx
|-- PublicOnlyRoute.tsx
`-- RoleRedirect.tsx
```

Responsibilities:

- `AppRouter.tsx`: connects `BrowserRouter`, `Routes`, and the main configuration.
- `paths.ts`: centralizes route constants.
- `routeConfig.ts`: declaratively groups public, private, and role-based routes.
- `ProtectedRoute.tsx`: protects routes that require a session.
- `PublicOnlyRoute.tsx`: protects guest routes from already authenticated users.
- `RoleRedirect.tsx`: resolves the authenticated user's initial destination.

## Paths Example

```ts id="8qvy34"
export const paths = {
  public: {
    home: "/",
    login: "/login",
    register: "/register",
    forgotPassword: "/forgot-password",
  },
  student: {
    dashboard: "/student/dashboard",
    courses: "/student/courses",
  },
  teacher: {
    dashboard: "/teacher/dashboard",
    courses: "/teacher/courses",
  },
  admin: {
    dashboard: "/admin/dashboard",
    users: "/admin/users",
  },
} as const;
```

Centralizing routes prevents duplicated strings such as `navigate("/login")` scattered across components.

## Project Rules

- The current public routes are `/`, `/login`, `/register`, and `/forgot-password`.
- Private routes must be grouped by role: `/student/*`, `/teacher/*`, `/admin/*`.
- The session must come from the auth store, not from manual checks inside pages.
- The role must come from the authenticated user, ideally loaded from `/api/v1/users/me`.
- Forms should not decide role-based dashboards.
- `RoleRedirect` must be the single point responsible for sending each user to their area.
- `ProtectedRoute` and `PublicOnlyRoute` must remain separate because they solve different problems.

## Summary

The current routing of `apps/web` covers the initial public experience and basic authentication. The next architectural step is to introduce role-based private routes and reusable guards:

```txt id="1gnujy"
Public routes
-> PublicOnlyRoute for auth pages
-> Login
-> Auth Store
-> RoleRedirect
-> ProtectedRoute
-> /student/*, /teacher/*, or /admin/*
```

With this separation, MentoraPredict can grow toward role-based dashboards without duplicating session rules or mixing authorization logic inside visual components.
