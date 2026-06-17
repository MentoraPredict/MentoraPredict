# MentoraPredict Web - Design System

This document defines how Atomic Design is used in `apps/web` and which rules the team must follow when creating reusable components.

The visual system lives in:

```txt id="gxny5v"
src/components/
|-- atoms/
|-- molecules/
|-- organisms/
`-- templates/
```

The main rule is:

```txt id="2em0xw"
components = reusable visual system
features = business components and logic
pages = complete screens connected to the router
```

Atomic Design must not become a folder for everything visual. If a component represents a business entity, it must live in `features/`, even if it looks like a card, table, panel, or section.

## Current State

The project already has an Atomic Design foundation implemented.

```txt id="w4l6mn"
src/components/
|-- atoms/
|   |-- Badge/
|   |-- Button/
|   |-- Container/
|   |-- ErrorMessage/
|   |-- Heading/
|   |-- IconButton/
|   |-- Input/
|   |-- Label/
|   |-- Logo/
|   `-- Text/
|
|-- molecules/
|   |-- AuthFooter/
|   |-- Divider/
|   |-- FeatureCard/
|   |-- FormField/
|   |-- NavItem/
|   |-- PasswordField/
|   |-- SocialLink/
|   `-- StatCard/
|
|-- organisms/
|   |-- AuthHero/
|   |-- FeaturesSection/
|   |-- Footer/
|   |-- ForgotPasswordForm/
|   |-- HeroSection/
|   |-- LoginForm/
|   |-- Navbar/
|   |-- RegisterForm/
|   `-- StatsSection/
|
`-- templates/
    |-- AuthTemplate/
    `-- LandingTemplate/
```

This structure is correct for the first stage of the project: landing page, authentication, and shared visual components.

## Atoms

Atoms are the smallest visual pieces of the system. They must be generic, reusable, and have no business knowledge.

Current examples:

- `Button`
- `IconButton`
- `Input`
- `Label`
- `ErrorMessage`
- `Heading`
- `Text`
- `Badge`
- `Logo`
- `Container`

An atom may receive visual or basic HTML props, but it should not know anything about courses, students, teachers, risks, recommendations, or roles.

### If It Is An Atom

```txt id="kx35h0"
Button
Input
Label
Badge
Heading
Text
```

Because they are reusable visual primitives that can be used anywhere in the application.

### It Is Not An Atom

```txt id="mxh7ah"
CourseCard
StudentRiskBadge
TeacherCourseStatus
RecommendationScore
AdminUserBadge
```

Even though some may appear small, they have business meaning. They must live inside `features/`.

Example:

```txt id="v5zh0m"
CourseCard is NOT an atom.
CourseCard belongs to features/courses.
```

## Molecules

Molecules combine atoms to solve a small and reusable interface need.

Current examples:

- `FormField`: combines `Label`, `Input`, and `ErrorMessage`.
- `PasswordField`: combines `Label`, `Input`, `IconButton`, and `ErrorMessage`.
- `Divider`: reusable visual separator.
- `NavItem`: simple navigation item.
- `SocialLink`: reusable social link.
- `AuthFooter`: small block used on authentication screens.
- `FeatureCard`: generic card for landing page informational sections.
- `StatCard`: generic statistics card for the landing page.

A molecule may have local UI state if that state is not business-related. For example, `PasswordField` manages `showPassword`, which is local visual behavior.

### If It Is A Molecule

```txt id="8qut5m"
FormField
PasswordField
NavItem
Divider
SocialLink
```

Because they combine atoms and remain reusable outside a specific domain.

### It Is Not A Molecule

```txt id="g9ktny"
CourseCard
CourseProgressCard
StudentGradeRow
RiskLevelCard
TeacherStudentItem
RecommendationItem
```

These components are not generic. They represent product data and language.

Example:

```txt id="9vc7rm"
CourseCard is NOT a molecule.
CourseCard belongs to features/courses.
```

## Organisms

Organisms are large interface blocks built with atoms and molecules. They can form complete page sections or complex forms.

Current examples:

- `Navbar`
- `Footer`
- `HeroSection`
- `FeaturesSection`
- `StatsSection`
- `AuthHero`
- `LoginForm`
- `RegisterForm`
- `ForgotPasswordForm`

In the current state, authentication forms live in `components/organisms` because `features/auth` does not yet exist. As the application grows, forms with authentication logic can move to:

```txt id="fxol1k"
src/features/auth/components/
```

This applies especially when the form starts depending on the auth store, user services, advanced error handling, or business rules.

### If It Is An Organism

```txt id="2mvz8o"
Navbar
Footer
HeroSection
LoginForm
RegisterForm
StatsSection
```

Because they are large visual blocks reusable within a page.

### It Is Not A Generic Organism

```txt id="6x6t42"
StudentRiskPanel
TeacherCourseSummary
AdminUsersTable
CourseEvaluationsSection
RecommendationTimeline
```

Although they are large sections, they belong to product domains. They must live in `features/`.

Correct location:

```txt id="w7j2ar"
features/analytics/components/StudentRiskPanel
features/teachers/components/TeacherCourseSummary
features/admin/components/AdminUsersTable
features/courses/components/CourseEvaluationsSection
features/recommendations/components/RecommendationTimeline
```

## Templates

Templates define layout structure. They should not contain business rules, HTTP calls, or session decisions.

Current examples:

- `AuthTemplate`: defines the structure of authentication screens with a visual area and content.
- `LandingTemplate`: composes `Navbar`, `HeroSection`, `StatsSection`, `FeaturesSection`, and `Footer`.

Templates may receive `children` or compose organisms, but they should remain visual structure only.

### If It Is A Template

```txt id="0l2n8r"
AuthTemplate
LandingTemplate
DashboardTemplate
SettingsTemplate
```

Because they organize regions of a screen.

### It Is Not A Template

```txt id="pjyeb5"
StudentDashboardPage
TeacherCoursesPage
AdminUsersPage
```

These are route-connected pages. They must live in `pages/`.

## Difference Between Components And Features

The most important distinction in the project is this:

```txt id="bkg8f0"
components/ does not know the business
features/ does know the business
```

`components/` can know that a button, label, input, generic card, or visual section exists.

`features/` can know that a course, student, teacher, academic risk, recommendation, or alert exists.

## Mandatory Example: CourseCard

`CourseCard` must not live in Atomic Design.

It is not an atom:

```txt id="msw0hf"
CourseCard is NOT an atom because it is not a visual primitive.
```

It is not a molecule:

```txt id="4y7jlwm"
CourseCard is NOT a molecule because it represents a business entity.
```

It should not live in:

```txt id="l0vz1q"
src/components/atoms/CourseCard
src/components/molecules/CourseCard
src/components/organisms/CourseCard
```

It must live in:

```txt
src/features/courses/components/CourseCard
```

Reason:

```txt
CourseCard talks about courses, progress, teachers, risk, metrics, or academic status.
That belongs to the courses domain, not to the generic visual system.
```

If a generic card is needed, you can create:

```txt
src/components/molecules/Card
```

And then use it inside:

```txt
src/features/courses/components/CourseCard
```

## Classification Rules

Before creating a component, answer these questions:

| Question                                                               | If the answer is yes | Location                                      |
| ---------------------------------------------------------------------- | -------------------- | --------------------------------------------- |
| Is it a generic visual primitive?                                      | Yes                  | `components/atoms`                            |
| Does it combine a few generic primitives?                              | Yes                  | `components/molecules`                        |
| Is it a large reusable visual block?                                   | Yes                  | `components/organisms`                        |
| Does it define a screen layout?                                        | Yes                  | `components/templates`                        |
| Does it represent a course, student, teacher, risk, or recommendation? | Yes                  | `features/*/components`                       |
| Is it a route-connected screen?                                        | Yes                  | `pages/`                                      |
| Does it contain HTTP calls or domain rules?                            | Yes                  | `features/` or `services/`, not `components/` |

## Rules For Atoms

- They must be small and reusable.
- They must not import services.
- They must not import the global store.
- They must not use `useNavigate`.
- They must not depend on routes.
- They must not know about roles.
- They must not contain business entity names.
- They may use Tailwind and global tokens.
- They may expose visual variants such as `primary`, `outline`, `danger` if applicable.

Correct example:

```txt
Button variant="outline"
```

Incorrect example:

```txt
Button variant="student-risk"
```

The `student-risk` variant mixes generic UI with business logic.

## Rules For Molecules

- They must combine atoms.
- They must solve a small UI pattern.
- They may have local visual state.
- They must not call APIs.
- They must not decide role-based redirection.
- They must not load backend data.
- They must not represent complete domain entities.

Correct example:

```txt
FormField = Label + Input + ErrorMessage
```

Incorrect example:

```txt
CourseFormField = course-specific field inside components/molecules
```

If the field only exists for courses, it should be in `features/courses`.

## Rules For Organisms

- They may compose atoms, molecules, and other small organisms.
- They may represent complete UI sections.
- They should remain reusable or belong to a public/base page.
- They should not mix too much business logic.
- They should not make direct HTTP calls except for very controlled temporary cases.
- If they start depending on a domain, they should be moved to `features/`.

Current acceptable example:

```txt
LoginForm in components/organisms
```

Reason: the project does not yet have `features/auth`.

Recommended evolution:

```txt
features/auth/components/LoginForm
features/auth/components/RegisterForm
features/auth/components/ForgotPasswordForm
```

When the authentication flow grows, that location will be clearer.

## Rules For Templates

- They must define layout structure.
- They may receive `children`.
- They may compose organisms.
- They must not call services.
- They must not store business state.
- They must not contain form validations.
- They must not make authorization decisions.

Correct example:

```txt
AuthTemplate = layout for authentication pages
```

Incorrect example:

```txt
AuthTemplate calls login() or decides RoleRedirect
```

## Relationship With Pages

Pages live in:

```txt
src/pages/
```

A page should compose templates, organisms, and features.

Current examples:

```txt
pages/LandingPage
pages/auth/LoginPage
pages/auth/RegisterPage
pages/auth/ForgotPasswordPage
```

A page may decide which template to use, but it should not become a folder of huge internal components.

Expected example:

```txt
LoginPage
-> AuthTemplate
-> LoginForm
```

When dashboards exist:

```txt
StudentDashboardPage
-> DashboardTemplate
-> features/courses/components/CourseSummary
-> features/analytics/components/StudentRiskPanel
-> features/recommendations/components/RecommendationList
```

## Relationship With Styles

Global tokens live in:

```txt
src/styles/
|-- colors.css
|-- typography.css
|-- spacing.css
|-- theme.css
`-- globals.css
```

Components should reuse these tokens through TailwindCSS v4 and the available global classes.

Rules:

- Do not duplicate color palettes in every component.
- Do not create global styles for a specific component.
- Do not hardcode business-specific styles in atoms.
- Keep visual variants consistent.

## Recommended Imports

Components are exported from `index.ts` files within each level.

Example:

```ts
import { Button, Heading, Text } from "@/components/atoms";
import { FormField, PasswordField } from "@/components/molecules";
import { Navbar } from "@/components/organisms";
```

Avoid deep imports when a clear barrel export already exists.

Acceptable when the barrel does not yet export the component:

```ts
import HeroSection from "@/components/organisms/HeroSection";
```

## Growth Rules

- Keep `components/` free of business entities.
- Create generic components only when they will be reused.
- Do not place domain-specific dashboards inside `components/organisms`.
- Do not create large atoms.
- Do not create molecules that already represent a domain.
- Do not create templates that do the work of pages.
- Do not use Atomic Design as an excuse to split everything into small files without benefit.
- If the name includes `Course`, `Student`, `Teacher`, `Admin`, `Risk`, `Recommendation`, `Grade`, or `Alert`, it probably belongs in `features/`.

## Quick Guide

```txt
Button -> components/atoms
Input -> components/atoms
FormField -> components/molecules
PasswordField -> components/molecules
Navbar -> components/organisms
Footer -> components/organisms
AuthTemplate -> components/templates
LandingPage -> pages
CourseCard -> features/courses/components
StudentRiskPanel -> features/analytics/components
TeacherStudentsTable -> features/teachers/components
AdminUsersTable -> features/admin/components
RecommendationList -> features/recommendations/components
```

## Summary

Atomic Design in MentoraPredict should be used as a reusable visual system, not as a business organization mechanism.

The correct separation is:

```txt
Atoms = visual primitives
Molecules = small combinations
Organisms = large reusable blocks
Templates = layout structure
Features = components with business meaning
Pages = router-connected screens
```

With this rule, the frontend can grow toward courses, dashboards, analytics, risk, and recommendations without contaminating the design system with domain-specific components.
