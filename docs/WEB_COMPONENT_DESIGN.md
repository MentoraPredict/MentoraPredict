# Web Component Design

The web application combines Atomic Design for reusable UI with domain components for product behavior.

## Atomic Design

`apps/web/src/components` contains business-agnostic UI:

| Layer | Responsibility | Examples |
| --- | --- | --- |
| `atoms` | Small visual primitives | Button, Input, Text, Badge |
| `molecules` | Small combinations of atoms | FormField, Modal, NavItem |
| `organisms` | Reusable interface sections | Navbar, Footer, forms |
| `templates` | Page layout without business rules | AuthTemplate, DashboardTemplate |

Atomic components must not call APIs, access domain services, or know about courses, grades, roles, risks, or users.

## Domain components

`apps/web/src/features/<domain>/components` contains UI with business meaning. Current domains are `admin`, `auth`, `courses`, `notifications`, `profile`, `students`, and `teachers`.

Examples include `AdminUsersTable`, `CourseAlertsPanel`, and `StudentCoursePerformance`. These components may use domain hooks and types, while reusable visual primitives stay in Atomic Design.

## Placement rule

```text
Generic visual element -> components
Business-aware UI or workflow -> features/<domain>
Route-level screen -> pages
Reusable request logic -> services
```

Prefer composition over duplicating an atom or molecule inside a feature. Keep API calls out of presentational components and place feature orchestration in hooks when it grows beyond simple local state.
