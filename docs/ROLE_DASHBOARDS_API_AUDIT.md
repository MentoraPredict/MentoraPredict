# Role Dashboards And API Integration Audit

## Scope

This audit reviews the current Admin, Teacher, and Student dashboard flows, the frontend components already available, and the API integrations that can support a more professional academic dashboard experience.

The next recommended implementation target is the student dashboard, reusing existing components where possible and adding only small, justified components if they improve clarity or consistency.

## Current Role Routes

### Student

- Main route: `/student/courses`
- Profile route: `/student/profile`
- Course performance route: `/student/courses/:courseId/performance`
- Course upload route: `/student/courses/:courseId/upload-data`

Relevant files:

- `apps/web/src/pages/student/StudentCoursesPage/StudentCoursesPage.tsx`
- `apps/web/src/features/students/components/StudentCoursesManagement/StudentCoursesManagement.tsx`
- `apps/web/src/pages/student/StudentCoursePerformancePage/StudentCoursePerformancePage.tsx`
- `apps/web/src/features/students/components/StudentCoursePerformance/StudentCoursePerformance.tsx`

Current behavior:

- The student landing page is effectively a course overview.
- It already displays active courses, estimated global average, risk count, and academic context.
- Course detail pages already reuse shared course analytics components.

### Teacher

- Main route: `/teacher/courses`
- Profile route: `/teacher/profile`
- Course performance route: `/teacher/courses/:courseId/performance`
- Course students route: `/teacher/courses/:courseId/students`
- Course edit route: `/teacher/courses/:courseId/edit`
- Course upload route: `/teacher/courses/:courseId/upload-data`

Relevant files:

- `apps/web/src/features/teachers/components/TeacherCoursesManagement/TeacherCoursesManagement.tsx`
- `apps/web/src/features/teachers/components/TeacherCoursePerformance/TeacherCoursePerformance.tsx`
- `apps/web/src/features/teachers/components/TeacherCourseStudents/TeacherCourseStudents.tsx`
- `apps/web/src/features/teachers/hooks/useTeacherCourses/useTeacherCourses.ts`

Current behavior:

- Teacher has the strongest operational flow.
- It supports course creation, course deletion, enrolled student listing, performance views, and grade-related upload flows.
- Some analytics are limited by backend data availability, especially aggregated weekly progress.

### Admin

- Main route redirects from `/admin/dashboard` to `/admin/users`
- User management route: `/admin/users`
- Course management route: `/admin/courses`

Relevant files:

- `apps/web/src/features/admin/components/AdminUsersManagement/AdminUsersManagement.tsx`
- `apps/web/src/features/admin/components/AdminCoursesManagement/AdminCoursesManagement.tsx`
- `apps/web/src/features/admin/hooks/useAdminUsers/useAdminUsers.ts`
- `apps/web/src/features/admin/hooks/useAdminCourses/useAdminCourses.ts`

Current behavior:

- Admin is management-oriented, not dashboard-oriented.
- User status and teacher role toggles exist.
- Full user profile editing is not yet exposed from the UI.
- Course view is read-only and uses the shared course grid.

## Current API Integrations

### Academic Service

Frontend service:

- `apps/web/src/services/academic.service.ts`

Used endpoints:

- `GET /v1/academic/students/me/subjects`
- `GET /v1/academic/subjects`
- `GET /v1/academic/faculties`
- `GET /v1/academic/careers`
- `GET /v1/academic/periods`
- `GET /v1/academic/periods/active`
- `GET /v1/academic/subjects/:subjectId/enrollments`
- `POST /v1/academic/subjects/:subjectId/enrollments/batch`
- `PATCH /v1/academic/enrollments/:enrollmentId/status`

Student dashboard relevance:

- `GET /v1/academic/students/me/subjects` is the main source for enrolled courses.
- It provides subject, period, career, credits, current average, and risk level.
- Faculty is currently enriched in the frontend by joining career data with faculty data.

Risk:

- Academic context is partly inferred in the frontend.
- If a student has courses from different careers or periods, the current dashboard picks the first course with context.

### Analytics Service

Frontend services:

- `apps/web/src/services/course-analytics.service.ts`
- `apps/web/src/services/student-performance.service.ts`

Used endpoints:

- `GET /v1/analytics/students/me/subjects/:subjectId/metrics`
- `GET /v1/analytics/students/me/subjects/:subjectId/risk`
- `GET /v1/analytics/students/me/alerts`
- `GET /v1/analytics/dashboard/student/:studentId`
- `GET /v1/analytics/subjects/:subjectId/metrics/summary`
- `GET /v1/analytics/subjects/:subjectId/alerts`

Student dashboard relevance:

- Course performance pages already use real subject metrics, risk, alerts, and recommendations.
- The student main dashboard does not yet aggregate alerts or recommendations directly.
- A stronger dashboard could either aggregate existing course-level data or wait for a backend summary endpoint.

Risk:

- Loading analytics for every course on the dashboard can create many API calls.
- A dedicated student overview endpoint would be better for a future iteration.

### Prediction Service

Frontend service:

- `apps/web/src/services/course-analytics.service.ts`

Used endpoints:

- `GET /v1/prediction/students/me/subjects/:subjectId/prediction`
- `GET /v1/prediction/subjects/:subjectId/predictions`

Student dashboard relevance:

- Recommendations are available at subject detail level.
- They are not currently summarized on the student main dashboard.

### User Service

Frontend service:

- `apps/web/src/services/users/users.service.ts`

Used endpoints:

- `GET /v1/users/me`
- `GET /v1/users`
- `PUT /v1/users/:id`
- `POST /v1/users/me/avatar`
- `DELETE /v1/users/me/avatar`

Student dashboard relevance:

- User identity and role are available through auth store and current user endpoints.
- Student academic profile details are not fully represented in user data.

## Reusable UI Components

### Existing atoms

- `Button`
- `Badge`
- `Container`
- `Heading`
- `Text`
- `MotionCard`
- `FeedbackMessage`
- `ErrorMessage`
- `IconButton`

Recommended reuse:

- Use `MotionCard` for dashboard cards.
- Use `Badge` for academic state and risk labels.
- Use `FeedbackMessage` or `ErrorMessage` instead of one-off error boxes.

### Existing molecules

- `Pagination`
- `SearchBar`
- `ProfileDropdown`
- `RouterNavItem`
- `UserWelcomeMessage`
- `NotificationIconButton`

Recommended reuse:

- Keep dashboard navigation through `DashboardNavbar`.
- Use existing feedback and navigation patterns before creating new components.

### Existing organisms/templates

- `DashboardNavbar`
- `StudentTemplate`
- `TeacherTemplate`
- `AdminTemplate`
- `CourseAnalyticsLayout`

Recommended reuse:

- Keep `StudentTemplate` for the student main dashboard.
- Keep `CourseAnalyticsLayout` for course details.
- Avoid creating a new dashboard shell until Admin and Teacher need the same layout.

### Existing course/student feature components

- `CourseGrid`
- `CourseCard`
- `CourseRiskBadge`
- `CourseAverageChart`
- `CourseProgressChart`
- `CourseAlertsPanel`
- `CourseRecommendationsPanel`
- `CourseRiskStudentsPanel`
- `StudentCoursesEmptyState`
- `StudentPerformanceUnavailableCard`

Recommended reuse:

- Use `CourseGrid` and `CourseCard` for enrolled subjects.
- Use `CourseRiskBadge` for compact risk summaries.
- Reuse `CourseAlertsPanel` and `CourseRecommendationsPanel` only on detail pages unless a backend summary exists.
- Consider a small local summary card component only if `MotionCard` plus repeated markup becomes hard to maintain.

## Student Dashboard Findings

### What already works

- Uses real backend course enrollment data.
- Shows active courses.
- Shows available current averages.
- Shows risk count.
- Shows faculty, career, and period when data exists.
- Navigates from course card to course performance detail.
- Reuses `CourseGrid`, `CourseCard`, and atomic components.

### What feels incomplete

- The page title and layout still feel like a course list with metrics above it, not a mature academic dashboard.
- Academic context is based on the first course with context.
- There is no explicit "academic status" or "current period progress" concept.
- Alerts and recommendations are only visible after entering a subject.
- Loading and error states are functional but visually basic.
- No quick actions are shown for common student tasks.

### Professional dashboard improvements for next task

Recommended implementation scope for `feature/student-dashboard-uiux`:

1. Improve the dashboard header
   - Add a stronger academic summary header.
   - Show student name from auth store.
   - Show context chips for faculty, career, and period.

2. Refine metric cards
   - Reuse `MotionCard`, `Heading`, `Text`, and `Badge`.
   - Keep metrics limited to useful academic information:
     - active subjects
     - global average
     - subjects at risk
     - total credits

3. Add a compact academic status panel
   - Use existing data only.
   - Derive status from risk count and global average.
   - Avoid pretending certainty if analytics data is missing.

4. Improve enrolled course section
   - Keep `CourseGrid` and `CourseCard`.
   - Keep course click behavior.
   - Improve copy and spacing.

5. Improve states
   - Use existing empty state.
   - Replace ad hoc error box with reusable feedback component if it fits.
   - Make loading state feel like dashboard loading, not just text.

6. Avoid backend changes initially
   - The current frontend has enough data for a polished first iteration.
   - Backend summary endpoints can be a later task if needed.

## Suggested Next Task

Task:

```text
Improve student dashboard UI/UX
```

Branch:

```text
feature/student-dashboard-uiux
```

Type:

```text
feature/frontend
```

Implementation rule:

- Reuse existing components first.
- Create a new component only if repeated dashboard markup becomes noisy.
- Do not add new endpoints in the first iteration.
- Do not change Admin or Teacher dashboards in this task.

Recommended files to touch:

- `apps/web/src/features/students/components/StudentCoursesManagement/StudentCoursesManagement.tsx`
- `apps/web/src/features/courses/components/CourseCard/CourseCard.tsx` only if course card polish is needed.
- `apps/web/src/types/course/course.types.ts` only if a missing field already exists in API responses.

Avoid touching:

- Backend services.
- Shared dashboard shell components.
- Admin and Teacher dashboards.
- Routing, unless a new student overview route is explicitly approved.

