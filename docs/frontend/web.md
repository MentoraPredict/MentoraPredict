# apps/web

The primary MentoraPredict client: an authenticated React SPA covering student, teacher, and admin dashboards. Built with atomic design, consuming the REST API behind Kong. See [README.md](./README.md) for how it relates to the other 3 client apps and [../architecture/high-level-architecture.md](../architecture/high-level-architecture.md) for the overall request flow.

## Tech Stack

| Concern | Library | Version |
|---|---|---|
| UI framework | react / react-dom | 19.2.7 |
| Build tool | vite | 8.0.16 |
| | @vitejs/plugin-react | 6.0.2 |
| Routing | react-router-dom | 7.17.0 |
| Server state | @tanstack/react-query | 5.101.2 |
| | react-query-devtools, react-query-persist-client, query-sync-storage-persister | 5.101.2 |
| Client state | zustand | 5.0.14 |
| HTTP | axios | 1.17.0 |
| Realtime | socket.io-client | 4.8.1 |
| Styling | tailwindcss | 4.3.0 |
| | @tailwindcss/vite | 4.3.0 |
| Forms | react-hook-form | 7.77.0 |
| Charts | recharts | 3.8.1 |
| Animation | framer-motion | 12.40.0 |
| Icons | react-icons | 5.6.0 |
| Fonts | @fontsource/inter (bundled) | 5.2.8 |
| Testing | vitest | 4.1.9 |
| | @vitest/coverage-v8, @vitest/browser-playwright | 4.1.9 |
| | playwright | 1.61.0 |
| Component workshop | storybook | 10.4.6 |
| Language | typescript | 5.4.0 |

Tailwind 4 is wired in purely as a Vite plugin (`@tailwindcss/vite`) — there is no separate `tailwind.config`.

### TypeScript configuration

`tsconfig.json` targets ES2020, uses `moduleResolution: Bundler`, `jsx: react-jsx`, and the path alias `"@/*": ["./src/*"]`. `noEmit: true` — type-checking happens via `tsc` and the actual build output comes from `vite build`. Config is split into `tsconfig.app.json` / `tsconfig.node.json` project references.

### vite.config.ts notables

- `base: mode.startsWith("desktop") ? "./" : "/"` — relative base for Electron desktop builds (loaded via `file:`/custom protocol), root-absolute for the web build.
- Dev proxy: `/api` → `VITE_API_PROXY_TARGET ?? "http://127.0.0.1:8000"`.
- `server.allowedHosts`: `["localhost", "127.0.0.1", "web"]` unless `VITE_ALLOW_ALL_HOSTS=true`.
- `build.sourcemap`: enabled only when `mode === "qa"`.
- `resolve.dedupe`: `["react", "react-dom"]`; `resolve.alias`: `@` → `./src`.
- Vitest is configured via `test.projects`: a `"unit"` node-environment project (`src/**/*.spec.ts(x)`) and a `"storybook"` browser project (Playwright/Chromium via the `storybookTest` plugin).

## Atomic Design Structure (`src/components/`)

| Layer | Count | Storybook coverage | Members |
|---|---|---|---|
| atoms | 17 | 17/17 | Badge, Button, Container, ErrorMessage, FeedbackMessage, Heading, IconButton, Input, Label, Logo, MotionCard, MotionEntrance, Select, Spinner, Text, Textarea, UserAvatar |
| molecules | 26 | 24/26 (missing ProfileDropdown, WasmConfettiBurst) | AuthFooter, Divider, FeatureCard, FooterBrand, FooterLinkColumn, FormField, HelpDialog, HeroMetricBadge, ImageUploadPreview, LogoLink, MicrosoftSignInButton, Modal, NavItem, NotificationIconButton, Pagination, PasswordField, ProfileDropdown, RatingScale, RouterNavItem, SearchBar, SelectedItemChip, SocialLink, StatCard, UserRoleLabel, UserWelcomeMessage, WasmConfettiBurst |
| organisms | 9 (7 in own folders + 2 loose `.tsx` files) | 6/9 (missing DashboardNavbar, DashboardSidebar, DownloadsSection) | DashboardNavbar, DashboardSidebar.tsx, DownloadsSection.tsx, FeaturesSection, Footer, HeroSection, LandingHeroVisual, Navbar, StatsSection |
| templates | 5 | 0/5 | AdminTemplate, AuthTemplate, LandingTemplate, StudentTemplate, TeacherTemplate |

Total Storybook coverage: **47/57** components.

There is **no `DashboardTemplate` component**. Templates are role-specific: `AdminTemplate`, `AuthTemplate`, `LandingTemplate`, `StudentTemplate`, `TeacherTemplate`.

## Routing (`src/routes/AppRouter.tsx`, `paths.ts`)

Router selection is environment-aware: `window.location.protocol === "file:" ? HashRouter : BrowserRouter` (desktop vs. web). Routes are wrapped in `AnimatePresence` (framer-motion) with a `getAnimationKey` helper that strips course-tab segments (`performance`, `upload-data`, `students`, `edit`) so switching tabs within a course doesn't retrigger the page transition. `AppRouter` calls `useAuthStore.getState().hydrateSession()` on mount.

**Guards**

| Guard | Behavior |
|---|---|
| `ProtectedRoute` (`allowedRoles?: UserRole[]`) | Redirects to `/login` if unauthenticated, or to the user's dashboard if role not allowed; blocks render until `isHydrated` |
| `PublicOnlyRoute` | Redirects authenticated users to their dashboard |
| `RoleRedirect` (used at `/redirect`) | Sends the user to their role's dashboard, or `/login` |

**Route table**

| Path | Access | Page component |
|---|---|---|
| `/` | Public | LandingPage |
| `/login` | Public-only | LoginPage |
| `/register` | Public-only | RegisterPage |
| `/forgot-password` | Public-only | ForgotPasswordPage |
| `/reset-password` | Public-only | ResetPasswordPage |
| `/redirect` | Any (role-aware) | RoleRedirect |
| `/auth/callback` | Public | OAuthCallbackPage |
| `/student/courses` | STUDENT | StudentCoursesPage |
| `/student/profile` | STUDENT | StudentProfilePage |
| `/student/courses/:courseId` (layout) | STUDENT | StudentCoursePageLayout |
| `/student/courses/:courseId/performance` | STUDENT | StudentCoursePerformancePage (nested) |
| `/student/courses/:courseId/upload-data` | STUDENT | StudentCourseUploadDataPage (nested) |
| `/teacher/courses` | TEACHER | TeacherCoursesPage |
| `/teacher/profile` | TEACHER | TeacherProfilePage |
| `/teacher/courses/:courseId` (layout) | TEACHER | TeacherCoursePageLayout |
| `/teacher/courses/:courseId/performance` | TEACHER | TeacherCoursePerformancePage (nested) |
| `/teacher/courses/:courseId/upload-data` | TEACHER | TeacherCourseUploadDataPage (nested) |
| `/teacher/courses/:courseId/students` | TEACHER | TeacherCourseStudentsPage (nested) |
| `/teacher/courses/:courseId/edit` | TEACHER | TeacherCourseEditPage (nested) |
| `/admin/dashboard` | ADMIN | `<Navigate to="/admin/users">` |
| `/admin/users` | ADMIN | AdminUsersPage |
| `/admin/courses` | ADMIN | AdminCoursesPage |
| `/admin/courses/:courseId/students` | ADMIN | AdminCourseStudentsPage |
| `/admin/profile` | ADMIN | AdminProfilePage |
| `*` (catch-all) | Public | `<Navigate to="/">` |

**Known inconsistency**: `APP_PATHS.admin.root = "/admin"` is defined in `paths.ts` but has no matching `<Route>` in `AppRouter.tsx` — only `/admin/dashboard`, `/admin/users`, etc. are registered.

## Feature Folders (`src/features/`)

| Feature | Components | Hooks |
|---|---|---|
| admin | AdminCourseStudents, AdminCoursesManagement, AdminCreateCourseForm, AdminSyllabusPanel, AdminUserRestrictionDialog, AdminUserRoleCell, AdminUserStatusCell, AdminUsersManagement, AdminUsersTable, AdminUsersTableRow, CreateUserForm | useAdminCourses, useAdminUsers |
| auth | AuthHero, DisabledAccountDialog, ForgotPasswordForm, LoginForm, RegisterForm, ResetPasswordForm | — |
| courses | AiRecommendationPanel, CourseActionsToolbar, CourseAlertsPanel, CourseAnalyticsLayout, CourseAverageChart, CourseCard, CourseGrid, CourseImagePlaceholder, CourseProgressChart, CourseRecommendationsPanel, CourseRiskBadge, CourseRiskBars, CourseRiskStudentsPanel, CourseSidebar, CourseSidebarNavItem | — |
| notifications | NotificationsMenu | useNotifications |
| profile | UserProfileCoursesCard, UserProfileDetailsCard, UserProfileHeaderCard, UserProfileManagement | — |
| students | StudentCourseMetricsPanel, StudentCoursePageLayout, StudentCoursePerformance, StudentCourseUploadData, StudentCoursesEmptyState, StudentCoursesManagement, StudentMetricCard, StudentPerformanceUnavailableCard, StudentStudyHabitsPanel, StudentSyllabusSurveyPanel | useStudentCoursePerformance |
| teachers | CourseFilesUploadPanel, CreateCourseForm, GradeEvaluationPanel, StudentEnrollmentCell, StudentSelector, SyllabusTopicsPanel, TeacherCourseEdit, TeacherCoursePageLayout, TeacherCoursePerformance, TeacherCourseStudents, TeacherCourseStudentsTable, TeacherCourseStudentsTableRow, TeacherCourseStudentsToolbar, TeacherCourseUploadData, TeacherCoursesEmptyState, TeacherCoursesHeader, TeacherCoursesManagement | useTeacherCourseAnalytics, useTeacherCourses |

### Cross-domain hooks (`src/hooks/`, outside `features/`)

`queries/` contains `useAdminCourses`, `useStudentCourses`, `useStudentCoursePerformance`, `useTeacherCourseAnalytics`, `useTeacherCourses`, plus `useLogout`, `useOnlineStatus`, `usePagination`. Of the five `queries/` hooks, only `useStudentCourses` is actually imported anywhere — the other four are dead/orphaned TanStack Query wrappers duplicating same-named hooks that live in `features/*/hooks` and are never wired in.

There is **no `providers/` directory** under `src/`. No React Context is used for global state — `App.tsx` wires `PersistQueryClientProvider` / `MotionConfig` directly.

## Services / API Layer (`src/services/`, excluding `services/query/`)

| File | Exports |
|---|---|
| `api.ts` | `api` — shared Axios instance. Request interceptor attaches the access token and generates `x-correlation-id` via the `generateId()` util (secure-context-safe fallback chain). Response interceptor performs a single shared 401 refresh and queues/retries concurrent requests. |
| `auth.service.ts` | `getMicrosoftLoginUrl`, `login`, `refresh`, `logout`, `register`, `forgotPassword`, `resetPassword` |
| `academic.service.ts` (largest) | `getStudentAcademicContext`, `getAdminCourses`, `getTeacherCourses`, `getStudentCourses`, `getActivePeriodOptions`, `getFacultyAndCareerOptions`, `getCourseCreationOptions`, `enrollStudentsInCourse`, `getCourseEnrolledStudents`, `updateCourseEnrollmentStatus`, `createTeacherCourse`, `createAdminCourse`, `deleteTeacherCourse`, `updateTeacherCourse`, `changeCourseStatus`, `uploadTeacherCourseImage`, `deleteTeacherCourseImage`, `importGradesFile`, `getCurrentStudentCheckIn`, `saveStudentCheckIn`, `getSubjectTopics`, `createSubjectTopic`, `updateSubjectTopic`, `deleteSubjectTopic` |
| `course-analytics.service.ts` | `getSubjectMetricsSummary`, `getStudentSubjectsOverview`, `getStudentSubjectPrediction`, `getStudentSubjectAnalytics`, `getTeacherSubjectAnalytics`, `getSubjectAverageGrade`, `getTeacherStudentSubjectPrediction`, `requestAiPrediction`, `getLatestAiPrediction`, `requestSubjectAiPrediction`, `getLatestSubjectAiPrediction` |
| `student-performance.service.ts` | `getActiveAcademicPeriod`, `getStudentPerformanceDashboard` |
| `notifications.service.ts` | `getUnreadNotifications`, `getReadNotifications`, `sortNotificationsByNewest`, `markNotificationAsRead`, `markAllNotificationsAsRead` |
| `notifications.socket.ts` | `connectNotificationsSocket` — Socket.IO client, path `/api/socket.io`, JWT sent via `auth.token`, subscribes to `notification:new` |
| `api/endpoints.ts` | `endpoints` — single object grouped by auth/users/academic/analytics/prediction/notifications, matching gateway domains 1:1 |
| `api/tokenStorage.ts` | `getAccessToken`, `getRefreshToken`, `setTokens`, `setAccessToken`, `clearTokens` |
| `users/users.service.ts` | `getCurrentUser`, `getUsers` (overloaded), `uploadCurrentUserAvatar`, `deleteCurrentUserAvatar`, `uploadUserAvatar`, `deleteUserAvatar`, `getStudents`, `updateUser`, `updateUserStatus`, `deleteUser`, `updateUserRole`, `getTeachers`, `createUserWithRole` |

See [../api/api-contracts.md](../api/api-contracts.md) for the underlying REST contracts these services call.

## State Management

**Auth/session** — `src/store/auth.store.ts`, a Zustand store (`create<AuthState>`). Holds `user`, `accessToken`, `refreshToken`, `isAuthenticated`, `isHydrated`. Actions: `login`, `loginWithTokens`, `refreshSession`, `hydrateSession`, `logout`, `clearSession`. Tokens persist via `services/api/tokenStorage.ts` — manual `localStorage` read/write, not Zustand's `persist` middleware. `hydrateSession` (called once from `AppRouter` on mount) reads tokens, decodes the JWT for a fallback user, then calls `getCurrentUser()` to fetch/merge the full profile; falls back to the JWT-derived user if the profile call fails with a non-401/403 error, and clears the session on 401/403.

**Server/remote state** — TanStack Query (`queryClient` in `services/query/queryClient.ts`): `staleTime` 5 minutes, custom retry that retries only genuine network failures (no HTTP response received at all) up to 2x — any received HTTP response, including 5xx, is never retried, to avoid piling more requests onto a server that already answered (e.g. with a 429), `refetchOnWindowFocus: false`. Persisted to `localStorage` via `PersistQueryClientProvider` in `App.tsx` under the key `mentorapredict-query-cache`, 7-day max age, with `createCourseMutation` mutation defaults registered synchronously at module load so paused mutations can resume after a cold reload.

No React Context is used for global state.

## Build / Deploy

Base-path logic is covered above (vite.config.ts). Build scripts in `package.json`:

| Script | Behavior |
|---|---|
| `build` | `tsc && vite build` (web) |
| `build:desktop` | `vite build --mode desktop` |
| `build:desktop:local` | `vite build --mode desktop.local` |
| `build:desktop:qa` | `vite build --mode desktop.qa` |
| `build:desktop:prod` | `vite build --mode desktop.prod` |

**Dockerfile** (web container) — multi-stage: `node:22-alpine` deps stage (`pnpm install --frozen-lockfile --filter @mentorapredict/web`) → builder stage (`pnpm --filter @mentorapredict/web build`) → `nginx:alpine` runner stage copying `dist/` to `/usr/share/nginx/html` and `nginx.conf` to `/etc/nginx/conf.d/default.conf`, exposing port 80. A separate `Dockerfile.qa` also exists.

`nginx.conf` handles SPA fallback, Kong reverse proxy, static asset caching, a `/downloads` location, and a `/favicon.png` exact-match cache override that prevents a 1-year-immutable-cache bug (fixed this cycle). Full breakdown in [../infrastructure/docker-compose.md](../infrastructure/docker-compose.md) and [../infrastructure/kong-gateway.md](../infrastructure/kong-gateway.md).

**Env files in `apps/web/`**

| File | `VITE_API_BASE_URL` |
|---|---|
| `.env.desktop` | `http://127.0.0.1:8000/api` |
| `.env.desktop.local` | `http://127.0.0.1:8000/api` (local dev target) |
| `.env.desktop.qa` | `https://mentorapredictqa.programacionwebuce.net/api` |
| `.env.desktop.prod` | `https://mentorapredictprod.programacionwebuce.net/api` |

There is no committed `.env`/`.env.production` for the web-container build — `VITE_API_BASE_URL` is injected at Docker build/deploy time; the in-code default is `/api`.

## Testing

**Unit tests (Vitest)** — only one spec file exists: `src/utils/logger.spec.ts` (structured console logger). Runs under the `"unit"` Vitest project (`environment: "node"`, glob `src/**/*.spec.ts(x)`).

**Storybook/browser tests** — the `"storybook"` Vitest project runs stories through `@storybook/addon-vitest`'s `storybookTest` plugin in a real Chromium browser via `@vitest/browser-playwright`.

`.storybook/main.ts` — stories glob `../src/**/*.stories.@(js|jsx|mjs|ts|tsx)`; addons: `@chromatic-com/storybook`, `@storybook/addon-vitest`, `@storybook/addon-a11y`, `@storybook/addon-docs`, `@storybook/addon-mcp`; framework `@storybook/react-vite`.

`.storybook/preview.tsx` — global decorators wrap every story in `MemoryRouter` (`initialEntries=["/"]`) plus a dedicated `QueryClientProvider` (retry disabled); imports `@fontsource/inter` and `src/styles/globals.css`; the a11y addon is set to `test: 'todo'` (violations shown in the test UI, not CI-failing).

No end-to-end/integration test suite (e.g. Cypress or Playwright E2E) exists — Playwright is used only as the Vitest browser provider for Storybook tests.
