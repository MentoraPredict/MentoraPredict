# MentoraPredict Web - Routing

Este documento describe las rutas frontend de `apps/web`, su estado actual en el codigo y la estructura esperada para rutas publicas, privadas y redireccion por rol.

La configuracion de rutas vive en:

```txt
src/routes/AppRouter.tsx
```

Actualmente el proyecto usa:

- `BrowserRouter`
- `Routes`
- `Route`
- `useNavigate` para navegacion programatica desde formularios y secciones publicas

## Estado Actual

El router implementado actualmente es simple y solo declara pantallas publicas:

```txt
/
/login
/register
/forgot-password
```

Codigo actual:

```tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
  </Routes>
</BrowserRouter>
```

Todavia no existen en `src/routes` los archivos:

```txt
ProtectedRoute.tsx
PublicOnlyRoute.tsx
RoleRedirect.tsx
paths.ts
routeConfig.ts
```

Estos archivos si forman parte de la arquitectura recomendada en la documentacion del proyecto y deberian agregarse cuando se implementen dashboards, sesion global y control por roles.

## Rutas Publicas

Las rutas publicas son accesibles sin sesion iniciada.

| Ruta | Pagina | Estado | Descripcion |
| --- | --- | --- | --- |
| `/` | `LandingPage` | Implementada | Pagina inicial publica de MentoraPredict. |
| `/login` | `LoginPage` | Implementada | Pantalla de inicio de sesion. |
| `/register` | `RegisterPage` | Implementada | Pantalla de registro de usuario. |
| `/forgot-password` | `ForgotPasswordPage` | Implementada | Pantalla para solicitar recuperacion de contrasena. |

### Navegacion Publica Actual

La navegacion publica aparece en estos componentes:

- `HeroSection`: navega hacia `/login`.
- `Navbar`: navega hacia `/login`.
- `LoginForm`: navega hacia `/register`, `/forgot-password` y, despues de login exitoso, hacia `/`.
- `RegisterForm`: navega hacia `/login`.
- `ForgotPasswordForm`: navega hacia `/login`.

## Rutas Publicas Solo Para Invitados

Estas rutas son publicas en el estado actual, pero cuando exista sesion global deberian estar envueltas por `PublicOnlyRoute`:

```txt
/login
/register
/forgot-password
```

La razon es que un usuario autenticado no deberia volver a pantallas de autenticacion. Si ya tiene sesion activa, debe ser enviado a su area correspondiente mediante `RoleRedirect`.

Flujo esperado:

```txt
Usuario autenticado abre /login
-> PublicOnlyRoute detecta sesion activa
-> RoleRedirect decide destino por rol
-> /student/dashboard, /teacher/dashboard o /admin/dashboard
```

## Rutas Privadas

Las rutas privadas aun no estan implementadas en `AppRouter.tsx`, pero la arquitectura del proyecto ya define tres areas principales por rol:

```txt
/student/*
/teacher/*
/admin/*
```

Estas rutas deben estar protegidas por `ProtectedRoute`.

| Patron | Rol esperado | Estado | Descripcion |
| --- | --- | --- | --- |
| `/student/*` | `STUDENT` | Pendiente | Area del estudiante: dashboard, cursos, metricas, riesgo y recomendaciones. |
| `/teacher/*` | `TEACHER` | Pendiente | Area del docente: dashboard, cursos, estudiantes, analitica y seguimiento. |
| `/admin/*` | `ADMIN` | Pendiente | Area administrativa: usuarios, cursos, ingestion de datos y configuracion. |

## Rutas Privadas Recomendadas

Cuando se implementen las paginas internas, se recomienda declarar como minimo estas rutas:

### Student

```txt
/student/dashboard
/student/courses
/student/courses/:courseId
/student/recommendations
/student/profile
```

Responsabilidad esperada:

- Ver resumen academico del estudiante.
- Consultar cursos inscritos.
- Revisar detalle de curso, evaluaciones y metricas.
- Ver riesgo academico y recomendaciones.

### Teacher

```txt
/teacher/dashboard
/teacher/courses
/teacher/courses/:courseId
/teacher/courses/:courseId/students
/teacher/students
```

Responsabilidad esperada:

- Ver resumen de cursos asignados.
- Consultar estudiantes por curso.
- Revisar metricas, alertas y riesgo academico.
- Dar seguimiento a estudiantes.

### Admin

```txt
/admin/dashboard
/admin/users
/admin/courses
/admin/data-ingestion
/admin/settings
```

Responsabilidad esperada:

- Administrar usuarios.
- Gestionar cursos.
- Gestionar carga o ingestion de datos.
- Revisar estado general de la plataforma.

## Redireccion Por Rol

La redireccion esperada despues de login debe depender del rol del usuario autenticado:

```txt
STUDENT -> /student/dashboard
TEACHER -> /teacher/dashboard
ADMIN   -> /admin/dashboard
```

En el estado actual, `LoginForm` ejecuta:

```tsx
await login(data);
navigate("/");
```

Esto significa que, por ahora, despues de iniciar sesion el usuario vuelve a la landing page. Cuando exista `RoleRedirect`, ese `navigate("/")` deberia reemplazarse por una redireccion basada en el rol cargado en el auth store.

Flujo recomendado:

```txt
LoginForm
-> auth.service.login()
-> guardar tokens
-> users.service.me()
-> auth.store guarda user y role
-> RoleRedirect envia al dashboard correcto
```

## ProtectedRoute

`ProtectedRoute` debe bloquear el acceso a rutas privadas cuando no exista una sesion activa.

Responsabilidad:

- Leer el estado de autenticacion desde el auth store.
- Permitir renderizar la ruta privada si el usuario esta autenticado.
- Redirigir a `/login` si no hay sesion.
- Opcionalmente validar roles permitidos para la ruta.

Uso esperado:

```tsx
<Route
  path="/student/*"
  element={
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <StudentRoutes />
    </ProtectedRoute>
  }
/>
```

Comportamiento esperado:

```txt
Usuario sin sesion abre /student/dashboard
-> ProtectedRoute detecta que no esta autenticado
-> redirige a /login
```

Si se implementa validacion por rol:

```txt
Usuario STUDENT abre /admin/users
-> ProtectedRoute detecta rol no permitido
-> redirige a su dashboard o a una pagina 403
```

## PublicOnlyRoute

`PublicOnlyRoute` debe evitar que un usuario autenticado vuelva a pantallas pensadas solo para invitados.

Rutas candidatas:

```txt
/login
/register
/forgot-password
```

Responsabilidad:

- Permitir acceso si no hay sesion.
- Redirigir si ya hay sesion activa.
- Delegar el destino a `RoleRedirect` o a una funcion de rutas por rol.

Uso esperado:

```tsx
<Route
  path="/login"
  element={
    <PublicOnlyRoute>
      <LoginPage />
    </PublicOnlyRoute>
  }
/>
```

Comportamiento esperado:

```txt
Usuario autenticado abre /login
-> PublicOnlyRoute detecta sesion activa
-> RoleRedirect calcula destino
-> usuario termina en su dashboard
```

## RoleRedirect

`RoleRedirect` debe centralizar la decision de destino segun rol.

Responsabilidad:

- Leer el rol del usuario autenticado desde el auth store.
- Convertir el rol en una ruta inicial.
- Redirigir a la pantalla correcta.
- Evitar que formularios o paginas dupliquen reglas de navegacion por rol.

Tabla esperada:

| Rol | Destino |
| --- | --- |
| `STUDENT` | `/student/dashboard` |
| `TEACHER` | `/teacher/dashboard` |
| `ADMIN` | `/admin/dashboard` |

Uso esperado:

```tsx
<Route
  path="/redirect"
  element={
    <ProtectedRoute>
      <RoleRedirect />
    </ProtectedRoute>
  }
/>
```

Tambien puede usarse internamente dentro de `PublicOnlyRoute` cuando un usuario autenticado intenta abrir una ruta publica solo para invitados.

## Estructura Recomendada De Routes

Para que el router escale sin llenar `AppRouter.tsx` de reglas repetidas, se recomienda esta estructura:

```txt
src/routes/
|-- AppRouter.tsx
|-- paths.ts
|-- routeConfig.ts
|-- ProtectedRoute.tsx
|-- PublicOnlyRoute.tsx
`-- RoleRedirect.tsx
```

Responsabilidades:

- `AppRouter.tsx`: conecta `BrowserRouter`, `Routes` y la configuracion principal.
- `paths.ts`: centraliza constantes de rutas.
- `routeConfig.ts`: agrupa declarativamente rutas publicas, privadas y por rol.
- `ProtectedRoute.tsx`: protege rutas que requieren sesion.
- `PublicOnlyRoute.tsx`: protege rutas de invitado contra usuarios ya autenticados.
- `RoleRedirect.tsx`: resuelve el destino inicial del usuario autenticado.

## Ejemplo De Paths

```ts
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

Centralizar rutas evita strings duplicados como `navigate("/login")` dispersos por componentes.

## Reglas Del Proyecto

- Las rutas publicas actuales son `/`, `/login`, `/register` y `/forgot-password`.
- Las rutas privadas deben agruparse por rol: `/student/*`, `/teacher/*`, `/admin/*`.
- La sesion debe venir del auth store, no de checks manuales dentro de paginas.
- El rol debe venir del usuario autenticado, idealmente cargado desde `/api/v1/users/me`.
- Los formularios no deberian decidir dashboards por rol.
- `RoleRedirect` debe ser el punto unico para enviar a cada usuario a su area.
- `ProtectedRoute` y `PublicOnlyRoute` deben mantenerse separados porque resuelven problemas diferentes.

## Resumen

El routing actual de `apps/web` cubre la experiencia publica inicial y autenticacion basica. La siguiente etapa arquitectonica es introducir rutas privadas por rol y guards reutilizables:

```txt
Public routes
-> PublicOnlyRoute para auth pages
-> Login
-> Auth Store
-> RoleRedirect
-> ProtectedRoute
-> /student/*, /teacher/* o /admin/*
```

Con esa separacion, MentoraPredict puede crecer hacia dashboards por rol sin duplicar reglas de sesion ni mezclar autorizacion dentro de componentes visuales.
