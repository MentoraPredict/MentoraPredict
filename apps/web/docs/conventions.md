# MentoraPredict Web - Conventions

This document defines working conventions for `apps/web`.

Its objective is to avoid future discussions about naming, imports, forms, global state, and services.

Base rule:

```txt
Domain != View
components = reusable UI
features = business logic
pages = router-connected views
services = backend communication
store = minimal global state
```

## Naming

### Components

React components must use `PascalCase`.

Correct:

```txt
Button
Input
LoginForm
AuthTemplate
StudentDashboardPage
CourseCard
StudentRiskPanel
```

Incorrect:

```txt
button
loginForm
auth-template
student_dashboard_page
```

Rule:

```txt
If it exports a React component, use PascalCase.
```

### Hooks

Hooks must use `camelCase` and start with `use`.

Correct:

```txt
useAuth
useRole
useCourses
useStudentRisk
useRecommendations
usePagination
useDisclosure
```

Incorrect:

```txt
UseAuth
authHook
CoursesHook
use_courses
```

Rule:

```txt
If it uses React hooks or represents reusable React behavior, it must start with use.
```

### Services

Services must use descriptive domain-based names.

Correct:

```txt
auth.service.ts
users.service.ts
courses.service.ts
enrollments.service.ts
evaluations.service.ts
grades.service.ts
risk.service.ts
alerts.service.ts
recommendations.service.ts
observations.service.ts
```

Incorrect:

```txt
apiCalls.ts
requests.ts
dashboard.service.ts
subjects.service.ts
```

Note:

```txt
Although the backend says subjects, the frontend uses courses.service.ts.
```

### Types

Types should live in domain-specific folders.

Correct:

```txt
types/auth/auth.types.ts
types/auth/auth-api.types.ts
types/user/user.types.ts
types/user/role.types.ts
types/course/course.types.ts
types/analytics/risk.types.ts
types/recommendation/recommendation.types.ts
types/api/api-error.types.ts
```

Incorrect:

```txt
types.ts
all-types.ts
interfaces.ts
models.ts
```

Rule:

```txt
Strict TypeScript scales better with domain folders than with giant flat files.
```

### Asset Folders

Asset folders must use `kebab-case`.

Correct:

```txt
assets/auth-hero/
assets/course-icons/
assets/dashboard-backgrounds/
assets/user-avatars/
```

Incorrect:

```txt
assets/AuthHero/
assets/courseIcons/
assets/dashboard_backgrounds/
assets/UserAvatars/
```

Rule:

```txt
Assets are not React components, therefore they do not use PascalCase.
```

## Imports

### Use @/ Alias

Always use the `@/` alias for imports from `src`.

The alias is already configured in:

```txt
tsconfig.json
vite.config.ts
```

Correct:

```ts
import { Button, Heading, Text } from "@/components/atoms";
import { FormField, PasswordField } from "@/components/molecules";
import LoginPage from "@/pages/auth/LoginPage";
import { login } from "@/services/auth.service";
```

Incorrect:

```ts
import { Button } from "../../../components/atoms";
import LoginPage from "../../pages/auth/LoginPage";
import { login } from "../services/auth.service";
```

Rule:

```txt
For any internal import from src, use @/.
```

### Allowed Relative Imports

Relative imports are only allowed within the same folder or a very nearby module.

Correct:

```ts
import "./styles.css";
import Button from "./Button";
```

Acceptable:

```ts
export { default } from "./Button";
```

Avoid:

```ts
import X from "../../../../services/api";
```

## React

### Forms

Use React Hook Form for forms.

The project already uses it in:

```txt
LoginForm
RegisterForm
ForgotPasswordForm
```

Correct:

```ts
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<LoginFormData>();
```

Incorrect:

```ts
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
```

Rule:

```txt
Do not use controlled forms for standard forms.
Use React Hook Form.
```

### When To Use useState

`useState` is valid for local UI state.

Correct:

```txt
showPassword
isOpen
selectedTab
isSubmitting
serverError
```

Current correct example:

```txt
PasswordField uses showPassword as local visual state.
```

Do not use `useState` to replace React Hook Form in large forms.

### Components

Components should remain focused.

Rules:

- Atoms should not know business logic.
- Molecules should not call APIs.
- Generic organisms should not handle heavy domain rules.
- Pages should compose, not contain all logic.
- Business components should live in `features/`.

Example:

```txt
CourseCard -> features/courses/components
StudentRiskPanel -> features/analytics/components
```

Not:

```txt
components/atoms/CourseCard
components/molecules/StudentRiskPanel
```

## Zustand

Zustand should be used only for real global state.

Correct usage:

```txt
auth.store.ts
app.store.ts
```

`auth.store.ts` should manage:

- session;
- tokens;
- authenticated user;
- role;
- login;
- logout;
- hydrate;
- clearSession.

Do not use Zustand for:

- an input value;
- local modal state;
- a selected tab inside an isolated component;
- temporary lists on a single screen;
- local form errors.

Rule:

```txt
If the state does not need to survive navigation or be shared across multiple areas, it does not belong in Zustand.
```

## Source Of Truth For Session

Final rule:

```txt
AuthStore = source of truth
```

Expected structure:

```txt
store/auth.store.ts
-> internally uses services/api/tokenStorage.ts
-> axiosClient.ts asks for token
```

Responsibilities:

```txt
auth.store.ts
-> knows whether a session exists
-> stores user
-> stores role
-> executes login/logout
-> hydrates session

tokenStorage.ts
-> only reads/writes tokens

axiosClient.ts
-> attaches Authorization
-> does not decide whether a session exists
```

Prohibited:

```txt
components reading localStorage
pages writing tokens
domain services manipulating session
multiple sources of truth for auth
```

## JWT

Do not use JWT as the source of user data.

Correct:

```txt
JWT = authentication
/users/me = user identity, role, and status
```

Recommended flow:

```txt
Login
-> backend returns accessToken and refreshToken
-> auth.store stores tokens
-> auth.store calls /api/v1/users/me
-> backend returns the real user with role
-> auth.store stores user
-> RoleRedirect navigates according to user.role
```

Incorrect:

```txt
Decode JWT on every page to obtain role.
Store role separately in localStorage from components.
```

## Services

### Do Not Use Axios Directly In Components

Never use Axios directly inside components.

Correct:

```ts
import { login } from "@/services/auth.service";

await login(data);
```

Incorrect:

```ts
import axios from "axios";

await axios.post("/api/v1/auth/login", data);
```

Rule:

```txt
Components call services.
Services call Axios.
```

### Current State To Fix

Currently `LoginForm` imports `axios` to use `axios.isAxiosError`.

That works, but it is not the final convention.

Better approach:

```txt
services/api/httpErrors.ts
-> normalizeApiError(error)

LoginForm
-> catch error
-> setServerError(normalizeApiError(error).message)
```

This way components do not depend on Axios or the exact shape of the HTTP error.

### Service Structure

Recommended structure:

```txt
services/
|-- api/
|   |-- axiosClient.ts
|   |-- endpoints.ts
|   |-- httpErrors.ts
|   |-- tokenStorage.ts
|   `-- index.ts
|-- auth/
|   `-- auth.service.ts
|-- users/
|   `-- users.service.ts
|-- academic/
|   |-- courses.service.ts
|   |-- enrollments.service.ts
|   |-- evaluations.service.ts
|   `-- grades.service.ts
|-- analytics/
|   |-- risk.service.ts
|   `-- alerts.service.ts
|-- metrics/
|   `-- metrics.service.ts
`-- recommendations/
    |-- recommendations.service.ts
    `-- observations.service.ts
```

### Endpoints

Do not hardcode endpoints inside components.

Correct:

```ts id="0a67v4"
api.post(ENDPOINTS.AUTH.LOGIN, credentials);
```

Incorrect:

```ts id="u6m7f3"
api.post("/v1/auth/login", credentials);
```

Temporary exception:

```txt id="hm4hdb"
The current project uses /v1/auth/login directly in auth.service.ts.
It should be moved to endpoints.ts when services/api is reorganized.
```

## Routes

Routes should be centralized.

Recommended structure:

```txt id="n5vy97"
routes/
|-- AppRouter.tsx
|-- paths.ts
|-- routeConfig.ts
|-- ProtectedRoute.tsx
|-- PublicOnlyRoute.tsx
`-- RoleRedirect.tsx
```

Rules:

- `RoleRedirect` uses `authStore.user.role`, not JWT.
- `ProtectedRoute` blocks private routes.
- `PublicOnlyRoute` prevents authenticated users from returning to login/register.
- Private routes are grouped by role: `/student/*`, `/teacher/*`, `/admin/*`.

## Features

Do not create `features/dashboard`.

A dashboard is a composed view, not a domain.

Final features:

```txt id="p4m89v"
features/
|-- auth/
|-- courses/
|-- analytics/
|-- recommendations/
|-- students/
|-- teachers/
`-- admin/
```

Each feature can contain:

```txt id="tzs5v0"
components/
hooks/
mappers/
services/
types/
```

Example:

```txt id="trd1b3"
features/courses/
|-- components/
|-- hooks/
|-- mappers/
|-- services/
`-- types/
```

## Pages

Dashboards belong in `pages`, not in `features`.

Correct:

```txt id="6okn8u"
pages/student/StudentDashboardPage
pages/teacher/TeacherDashboardPage
pages/admin/AdminDashboardPage
```

Each page composes real features.

Example:

```txt id="6f4e7d"
StudentDashboardPage
-> courses
-> analytics
-> recommendations
-> students
```

## Quick Checklist

Before creating a file, check:

- Is it a React component? `PascalCase`.
- Is it a hook? `useSomething` in `camelCase`.
- Is it an asset? Folder in `kebab-case`.
- Importing from `src`? Use `@/`.
- Is it a form? Use React Hook Form.
- Is it real global state? Zustand.
- Is it local UI state? `useState`.
- Needs backend communication? Create or use a service.
- Is it Axios inside a component? No.
- Is it a dashboard? It belongs in `pages`, not in `features`.
- Is it Course/Student/Risk/Recommendation? It belongs in `features`.

## Summary

Final conventions:

```txt id="iuwg9o"
PascalCase for components.
camelCase with use for hooks.
kebab-case for asset folders.
@/ for internal imports.
React Hook Form for forms.
No controlled forms for standard forms.
Zustand only for global state.
AuthStore as the source of truth for session.
Do not decode JWT for user data.
No direct Axios inside components.
No features/dashboard.
```

These rules keep the frontend consistent, easy to review, and aligned with the MentoraPredict architecture.
