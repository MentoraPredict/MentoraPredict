# MentoraPredict Web - Business Domain

This document describes the business that `apps/web` must model.

It is not a document about folders, routes, or components. It is the reference for understanding what MentoraPredict represents, who uses the platform, what the main entity is, and how screens should flow by role.

The reason for this document is simple:

```txt
If the frontend does not understand the business, it ends up being organized around isolated screens.
If it understands the business, it can grow through clear domains.
```

## What Is MentoraPredict

MentoraPredict is an academic platform focused on detecting student risk through academic data, metrics, alerts, and recommendations.

The goal of the product is to help:

- students understand their performance and receive recommendations;
- teachers monitor courses and students;
- administrators manage users, courses, and data ingestion.

## Main Mental Model

The frontend should not revolve around forms, dashboards, or technical folders.

The main product model is:

```txt
User
-> Courses
-> Course
-> Summary
-> Performance
-> Risk
-> Recommendations
```

The entity that organizes the experience is:

```txt
Course
```

Although the backend may use names such as `subjects`, the frontend should use `courses`, because that is the natural language for students and teachers.

## Roles

MentoraPredict works with three main roles:

```txt
STUDENT
TEACHER
ADMIN
```

The role is not just a UI label. The role defines:

- which routes the user can access;
- which initial dashboard they see after login;
- which entities they can consult;
- which actions they can execute;
- which language the interface should display.

## Student

`Student` represents the student who consults their academic information.

Their main objective is to understand:

- which courses they are enrolled in;
- how their performance is progressing;
- whether they have academic risk;
- what actions they can take to improve;
- what personal or academic data is being used.

### Main Student Flow

```txt
Dashboard
->
Course
->
Summary
->
Performance
->
My Data
```

Version with expected routes:

```txt
/student/dashboard
-> /student/courses
-> /student/courses/:courseId
-> /student/courses/:courseId/summary
-> /student/courses/:courseId/performance
-> /student/profile
```

### Student Dashboard

The student dashboard should quickly answer:

- which active courses they have;
- what their overall academic status is;
- where risk exists;
- what recent recommendations are available;
- which activity requires attention.

It should not be a decorative page. It should be an actionable summary.

### Course For Student

For a student, a course is the center of consultation.

A course can display:

- general information;
- teacher;
- progress;
- evaluations;
- grades;
- attendance or participation if applicable;
- metrics;
- risk;
- recommendations.

### Performance

`Performance` groups the data that explains how the student is progressing.

It may include:

- grades;
- evaluations;
- performance trend;
- comparison against objectives;
- alerts;
- risk indicators.

### My Data

`My Data` should allow the student to understand their personal and academic information within the platform.

It may include:

- profile;
- base academic data;
- enrolled courses;
- relevant history;
- account settings.

## Teacher

`Teacher` represents the teacher who monitors courses and students.

Their main objective is to:

- review their courses;
- identify at-risk students;
- analyze group performance;
- consult student details;
- upload or validate academic data when appropriate.

### Main Teacher Flow

```txt
Dashboard
->
Course
->
Analytics
->
Students
->
Data Ingestion
```

Version with expected routes:

```txt
/teacher/dashboard
-> /teacher/courses
-> /teacher/courses/:courseId
-> /teacher/courses/:courseId/analytics
-> /teacher/courses/:courseId/students
-> /teacher/data-ingestion
```

### Teacher Dashboard

The teacher dashboard should answer:

- which courses are assigned to them;
- which courses have the highest risk;
- how many students require follow-up;
- what recent alerts exist;
- what data uploads or updates are pending.

### Course For Teacher

For a teacher, a course is not only descriptive information.

It is an academic monitoring unit.

A course can display:

- course summary;
- enrolled students;
- performance distribution;
- student alerts;
- risk metrics;
- aggregated recommendations;
- follow-up actions.

### Analytics

`Analytics` groups visualizations and indicators for decision-making.

It may include:

- at-risk students;
- course trend;
- performance by evaluation;
- grade distribution;
- comparisons between periods;
- academic alerts.

### Students

The students view should allow:

- listing students by course;
- filtering by risk or performance;
- opening student details;
- consulting alerts;
- reviewing recommendations or suggested actions.

### Data Ingestion

Data ingestion is part of the teacher workflow if the teacher participates in updating academic information.

It may include:

- uploading grades;
- uploading attendance;
- validating files;
- reviewing ingestion errors;
- confirming data before processing.

If this responsibility belongs only to administrators, this view should be moved to the `Admin` flow.

## Admin

`Admin` represents the user responsible for platform configuration and administration.

Their main objective is to:

- manage users;
- manage courses;
- control data ingestion;
- review the overall system status;
- maintain configurations and permissions.

### Main Admin Flow

```txt
Dashboard
->
Users
->
Courses
->
Data Ingestion
->
Settings
```

Version with expected routes:

```txt
/admin/dashboard
-> /admin/users
-> /admin/courses
-> /admin/data-ingestion
-> /admin/settings
```

### Admin Dashboard

The admin dashboard should answer:

- how many users exist per role;
- how many courses are active;
- whether data ingestion errors exist;
- whether there are pending processes;
- what the overall platform status is.

### Users

User administration may include:

- creating users;
- editing information;
- assigning roles;
- activating or deactivating accounts;
- reviewing access status.

### Courses

Course management may include:

- creating courses;
- editing courses;
- assigning teachers;
- associating students;
- reviewing the academic status of the course.

### Data Ingestion

For admin, data ingestion is an operational responsibility.

It may include:

- importing institutional files;
- reviewing validations;
- correcting errors;
- relaunching processes;
- consulting ingestion history.

## Main Entity: Course

`Course` is the main entity of the experience.

This does not mean everything is a course. It means many important experiences are better understood from a course:

```txt
Course
-> Students
-> Evaluations
-> Grades
-> Metrics
-> Risk
-> Recommendations
```

### Why Course And Not Subject

The backend may use `Subject`, `Materia`, or another technical name.

The frontend should use:

```txt
Course
```

Reason:

- it is clearer for the UI;
- it matches the user experience;
- it avoids exposing backend internal language;
- it keeps product language stable even if microservices change.

Rule:

```txt
Backend language can be mapped.
Frontend language must be user-centered.
```

## Domain Entities

These are the main entities that the frontend should recognize.

| Entity           | Meaning In The Product                                   |
| ---------------- | -------------------------------------------------------- |
| `User`           | Authenticated person on the platform.                    |
| `Role`           | Access and navigation policy.                            |
| `Student`        | User who consults their academic performance.            |
| `Teacher`        | User who monitors courses and students.                  |
| `Admin`          | User who manages the platform, users, courses, and data. |
| `Course`         | Main academic unit of the experience.                    |
| `Enrollment`     | Relationship between a student and a course.             |
| `Evaluation`     | Assessed activity within a course.                       |
| `Grade`          | Academic result associated with an evaluation.           |
| `Metric`         | Indicator calculated from academic data.                 |
| `Risk`           | Signal of a potential academic issue.                    |
| `Alert`          | Event that requires attention.                           |
| `Recommendation` | Suggested action to improve or intervene.                |
| `Observation`    | Comment or qualitative record associated with follow-up. |

## Frontend Domains

The frontend should grow by domains, not by views.

Recommended domains:

```txt
features/auth
features/courses
features/analytics
features/recommendations
features/students
features/teachers
features/admin
```

### Auth

Responsible for:

- login;
- logout;
- password recovery;
- session;
- authenticated user;
- role.

### Courses

Responsible for:

- courses;
- course details;
- students by course if the main context is the course;
- evaluations;
- progress;
- academic summary.

### Analytics

Responsible for:

- metrics;
- charts;
- risk;
- trends;
- aggregated indicators.

### Recommendations

Responsible for:

- generated recommendations;
- suggested actions;
- observations;
- recommendation history.

### Students

Responsible for:

- student academic profile;
- student data;
- individual details;
- individual follow-up when the focus is the person.

### Teachers

Responsible for:

- teacher-specific information;
- assigned courses from the teacher perspective;
- teacher follow-up;
- teacher actions.

### Admin

Responsible for:

- user administration;
- course administration;
- configuration;
- data ingestion;
- internal operations.

## Dashboard Is Not A Domain

Do not create:

```txt
features/dashboard
```

A dashboard is a composed view, not a domain.

Correct example:

```txt
StudentDashboardPage
-> features/courses
-> features/analytics
-> features/recommendations
-> features/students
```

Example teacher:

```txt
TeacherDashboardPage
-> features/courses
-> features/analytics
-> features/students
-> features/teachers
```

Example admin:

```txt
AdminDashboardPage
-> features/admin
-> features/courses
-> features/students
-> features/teachers
```

## Navigation By Role

After login, each role must enter its initial area.

```txt
STUDENT -> /student/dashboard
TEACHER -> /teacher/dashboard
ADMIN   -> /admin/dashboard
```

Role-based navigation must depend on the authenticated user and their role.

It must not depend on:

- form text;
- hardcoded routes inside visual components;
- manual JWT decoding on each screen;
- duplicated checks inside pages.

## Product Language

The frontend should use clear names for the user experience.

Prefer:

```txt
Course
Student
Teacher
Risk
Recommendation
Performance
Dashboard
```

Avoid exposing internal names to the user if they are not clear:

```txt
Subject
DTO
IngestionJob
PredictionPayload
RawMetric
```

Technical names may exist in services, mappers, or API types, but the UI should speak the language of the product.

## Business Rules For The Frontend

- `Course` is the main entity for academic navigation.
- `Role` defines access, redirection, and menus.
- `Dashboard` is a composition of domains, not a domain itself.
- `Risk` should be presented as an actionable signal, not just a number.
- `Recommendation` should connect data with a suggested action.
- `Student` should be able to understand their performance without seeing internal operational details.
- `Teacher` should be able to move from courses to students and analytics quickly.
- `Admin` should focus on management, configuration, and data.
- The frontend must map backend language to user language.

## Relationship With Routes

Routes should reflect the business:

```txt
/student/*
/teacher/*
/admin/*
```

Within each area, `Course` should appear as the central navigation entity:

```txt
/student/courses/:courseId
/teacher/courses/:courseId
/admin/courses
```

The route should not expose internal backend details if there is a clearer name for the user.

## Relationship With Components

Business components should live in `features/`.

Examples:

```txt
CourseCard -> features/courses/components
StudentRiskPanel -> features/analytics/components
TeacherStudentsTable -> features/teachers/components
AdminUsersTable -> features/admin/components
RecommendationList -> features/recommendations/components
```

They should not live in:

```txt
components/atoms
components/molecules
components/organisms
```

`components/` is for generic UI. `features/` is for business.

## Current Project State

Currently `apps/web` mainly implements:

- public landing page;
- login;
- registration;
- password recovery;
- Atomic Design base structure;
- initial public router.

The `student`, `teacher`, and `admin` areas are still part of the expected architecture, not fully implemented screens.

This document defines the business direction for building those areas without improvising names, flows, or domains.

## Summary

MentoraPredict should grow around this idea:

```txt
Role defines access.
Course organizes the academic experience.
Analytics explains performance.
Risk detects problems.
Recommendation suggests actions.
Dashboard composes everything according to the role.
```

With this model, the frontend can grow without confusing views with domains or visual components with real business logic.
