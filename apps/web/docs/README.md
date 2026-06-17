# MentoraPredict Web - Arquitectura Frontend

Este documento resume la arquitectura frontend acordada para `apps/web` hasta este momento. Su objetivo es servir como guia de referencia para entender como debe crecer el frontend sin mezclar responsabilidades, manteniendo una base escalable para dashboards, roles, cursos, analitica e integraciones futuras con IA.

## Contexto Del Proyecto

MentoraPredict es una aplicacion academica orientada a predecir riesgo estudiantil mediante datos academicos, metricas, alertas y recomendaciones generadas con IA.

El frontend esta construido con:

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

El proyecto vive dentro de un monorepo y consume microservicios a traves de Kong/API Gateway.

## Principio Arquitectonico

La arquitectura frontend no debe girar alrededor de carpetas tecnicas ni alrededor del usuario como entidad principal.

El modelo mental principal del producto es:

```txt
Usuario
-> Cursos
-> Curso
-> Modulos / Evaluaciones / Metricas / Riesgo / Recomendaciones
```

Aunque el backend use entidades como `subjects`, el frontend debe exponer el concepto como `courses`, porque ese es el lenguaje mas claro para la experiencia de usuario.

## Separacion De Responsabilidades

La arquitectura se organiza bajo esta regla:

```txt
components = sistema visual reutilizable
features = dominios de negocio
pages = composicion de vistas
routes = navegacion y autorizacion
services = comunicacion con microservicios
store = estado global minimo
types = contratos TypeScript
hooks = utilidades reutilizables
```

## Estructura Recomendada

```txt
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

El proyecto mantiene Atomic Design en `components/`.

Esta carpeta debe contener componentes reutilizables y sin logica de negocio fuerte.

Ejemplos correctos:

```txt
components/atoms/Button
components/atoms/Input
components/atoms/Badge
components/molecules/FormField
components/molecules/PasswordField
components/organisms/Navbar
components/templates/AuthTemplate
```

Componentes como `CourseRiskPanel`, `StudentGradesTable` o `TeacherCourseSummary` no deberian vivir en `components/`, porque pertenecen a un dominio. Esos componentes deben estar dentro de `features/`.

## Features

`features/` representa dominios reales de negocio, no vistas.

Esta carpeta existe para aislar logica de negocio por dominio y evitar que las pantallas se conviertan en contenedores de todo.

En el codigo actual, el primer dominio ya materializado es `features/auth`, con sus componentes de autenticacion movidos fuera de `components/organisms`.

Dominios definidos para MentoraPredict:

```txt
features/
├── auth/
├── courses/
├── analytics/
├── recommendations/
├── students/
├── teachers/
└── admin/
```

No se crea un feature llamado `dashboard`, porque dashboard es una vista compuesta, no un dominio. Los dashboards se construyen combinando features reales.

Ejemplo:

```txt
StudentDashboardPage
-> courses
-> analytics
-> recommendations
-> students
```

Cada feature puede crecer con esta estructura canonica:

```txt
features/courses/
├── components/
├── hooks/
├── mappers/
├── services/
└── types/
```

La idea es esta:

- `components/`: piezas visuales del dominio.
- `hooks/`: comportamiento reutilizable del dominio.
- `mappers/`: transformacion entre API y UI.
- `services/`: llamadas HTTP del dominio.
- `types/`: contratos TypeScript del dominio.

Si una pieza describe cursos, estudiantes, analitica o recomendaciones, no debe ir en `components/` globales. Debe vivir dentro de su feature correspondiente.

## Pages

`pages/` representa pantallas completas conectadas al router.

Estructura recomendada:

```txt
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

Las paginas deben componer features y templates. No deberian contener demasiada logica de negocio ni llamadas HTTP directas.

## Routes

`routes/` centraliza navegacion, proteccion de rutas y redireccion por rol.

Estructura recomendada:

```txt
routes/
├── AppRouter.tsx
├── paths.ts
├── routeConfig.ts
├── ProtectedRoute.tsx
├── PublicOnlyRoute.tsx
└── RoleRedirect.tsx
```

Responsabilidades:

- `paths.ts`: rutas frontend centralizadas.
- `routeConfig.ts`: configuracion declarativa de rutas.
- `ProtectedRoute.tsx`: exige sesion activa.
- `PublicOnlyRoute.tsx`: evita que un usuario autenticado vuelva a pantallas como login.
- `RoleRedirect.tsx`: redirige segun el rol del usuario.

Redireccion esperada:

```txt
STUDENT -> /student/dashboard
TEACHER -> /teacher/dashboard
ADMIN   -> /admin/dashboard
```

## Services

`services/` contiene comunicacion con microservicios y configuracion HTTP.

Estructura recomendada:

```txt
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

Las URLs no deben estar hardcodeadas dentro de formularios o componentes.

Debe existir un archivo central:

```txt
services/api/endpoints.ts
```

Ejemplo conceptual:

```txt
AUTH.LOGIN
AUTH.REGISTER
USERS.ME
ACADEMIC.COURSES
ANALYTICS.STUDENT_DASHBOARD
RECOMMENDATIONS.BY_STUDENT
```

Aunque el backend exponga `/subjects`, el frontend debe trabajar con `courses.service.ts` y mapear internamente hacia el endpoint correspondiente.

## Auth Y Sesion

La fuente de verdad de la sesion debe ser Zustand:

```txt
store/auth.store.ts
```

Regla importante:

```txt
AuthStore = fuente de verdad
```

`tokenStorage` puede existir, pero solo como detalle interno usado por el store o por el cliente Axios. No debe ser usado directamente desde componentes o paginas.

Flujo recomendado:

```txt
LoginForm
-> auth.service.login()
-> guardar tokens
-> users.service.me()
-> auth.store guarda user y role
-> RoleRedirect navega segun rol
```

El JWT debe tratarse como mecanismo de autenticacion, no como fuente de datos de usuario.

La informacion de usuario, rol, permisos y estado debe venir desde:

```txt
/api/v1/users/me
```

## Store

Zustand debe usarse para estado global real.

Estructura recomendada:

```txt
store/
├── auth.store.ts
├── app.store.ts
└── index.ts
```

`auth.store.ts` debe manejar:

- tokens
- usuario autenticado
- rol
- estado de sesion
- login
- logout
- hidratacion de sesion

No se recomienda guardar todas las listas de cursos, dashboards o metricas globalmente desde el inicio. Esos datos pueden vivir en hooks de feature o estado local hasta que el volumen justifique otro patron.

## Types

Los tipos deben crecer en carpetas, no en archivos planos.

Estructura recomendada:

```txt
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

Esto permite mantener TypeScript estricto sin convertir `types/` en una carpeta inmanejable.

## Hooks

`hooks/` debe contener hooks globales reutilizables:

```txt
hooks/
├── useAuth.ts
├── useRole.ts
├── useProtectedAction.ts
├── usePagination.ts
├── useDebounce.ts
└── useDisclosure.ts
```

Hooks de dominio deben vivir dentro de su feature:

```txt
features/courses/hooks/useCourses.ts
features/analytics/hooks/useStudentRisk.ts
features/recommendations/hooks/useRecommendations.ts
```

## Config

Se recomienda agregar:

```txt
config/
├── env.ts
├── roles.ts
└── navigation.ts
```

Responsabilidades:

- `env.ts`: acceso tipado a variables `VITE_*`.
- `roles.ts`: definicion de roles y permisos.
- `navigation.ts`: menu y navegacion por rol.

## Estilos Y Design System

La estructura actual de estilos es:

```txt
styles/
├── globals.css
├── colors.css
├── typography.css
├── spacing.css
└── theme.css
```

Responsabilidad recomendada:

- `colors.css`: tokens de color.
- `typography.css`: familia, pesos, escalas y line-height.
- `spacing.css`: espacios, radios, sombras y containers.
- `theme.css`: integracion de tokens con TailwindCSS v4.
- `globals.css`: imports y estilos base globales.

## Reglas De Crecimiento

- No llamar servicios HTTP desde atoms, molecules u organisms genericos.
- No hardcodear endpoints dentro de componentes.
- No usar el JWT como modelo de usuario.
- No duplicar la sesion entre Zustand, localStorage y helpers.
- No crear features para vistas; crear features para dominios.
- No mezclar lenguaje backend con lenguaje UX cuando no coincidan.
- Usar `Course` en frontend aunque el backend use `Subject`.
- Mantener dashboards como pages que componen features.
- Mantener los tipos cerca del contrato, pero el lenguaje cerca del usuario.

## Resumen

La arquitectura final busca que MentoraPredict Web sea:

- clara para el equipo frontend,
- escalable a nuevos roles,
- preparada para dashboards complejos,
- compatible con microservicios,
- mantenible bajo TypeScript estricto,
- alineada con Atomic Design,
- lista para futuras funcionalidades de IA.

La idea central es simple:

```txt
Curso como entidad principal
Rol como politica de acceso
Microservicios como detalle de infraestructura
Atomic Design como sistema visual
Features como modulos de negocio
Pages como composicion de vistas
```
