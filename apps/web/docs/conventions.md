# MentoraPredict Web - Conventions

Este documento define convenciones de trabajo para `apps/web`.

Su objetivo es evitar discusiones futuras sobre nombres, imports, formularios, estado global y servicios.

Regla base:

```txt
Dominio != Vista
components = UI reutilizable
features = negocio
pages = vistas conectadas al router
services = comunicacion con backend
store = estado global minimo
```

## Naming

### Componentes

Los componentes React deben usar `PascalCase`.

Correcto:

```txt
Button
Input
LoginForm
AuthTemplate
StudentDashboardPage
CourseCard
StudentRiskPanel
```

Incorrecto:

```txt
button
loginForm
auth-template
student_dashboard_page
```

Regla:

```txt
Si exporta un componente React, usar PascalCase.
```

### Hooks

Los hooks deben usar `camelCase` y empezar con `use`.

Correcto:

```txt
useAuth
useRole
useCourses
useStudentRisk
useRecommendations
usePagination
useDisclosure
```

Incorrecto:

```txt
UseAuth
authHook
CoursesHook
use_courses
```

Regla:

```txt
Si usa hooks de React o representa comportamiento reutilizable de React, debe empezar con use.
```

### Servicios

Los servicios deben usar nombres descriptivos por dominio.

Correcto:

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

Incorrecto:

```txt
apiCalls.ts
requests.ts
dashboard.service.ts
subjects.service.ts
```

Nota:

```txt
Aunque el backend diga subjects, el frontend usa courses.service.ts.
```

### Types

Los tipos deben vivir en carpetas por dominio.

Correcto:

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

Incorrecto:

```txt
types.ts
all-types.ts
interfaces.ts
models.ts
```

Regla:

```txt
TypeScript estricto escala mejor con carpetas por dominio, no con archivos planos gigantes.
```

### Carpetas De Assets

Las carpetas de assets deben usar `kebab-case`.

Correcto:

```txt
assets/auth-hero/
assets/course-icons/
assets/dashboard-backgrounds/
assets/user-avatars/
```

Incorrecto:

```txt
assets/AuthHero/
assets/courseIcons/
assets/dashboard_backgrounds/
assets/UserAvatars/
```

Regla:

```txt
Assets no son componentes React, por eso no usan PascalCase.
```

## Imports

### Usar Alias @/

Siempre usar el alias `@/` para imports desde `src`.

El alias ya esta configurado en:

```txt
tsconfig.json
vite.config.ts
```

Correcto:

```ts
import { Button, Heading, Text } from "@/components/atoms";
import { FormField, PasswordField } from "@/components/molecules";
import LoginPage from "@/pages/auth/LoginPage";
import { login } from "@/services/auth.service";
```

Incorrecto:

```ts
import { Button } from "../../../components/atoms";
import LoginPage from "../../pages/auth/LoginPage";
import { login } from "../services/auth.service";
```

Regla:

```txt
Para cualquier import interno de src, usar @/.
```

### Imports Relativos Permitidos

Los imports relativos solo se permiten dentro de la misma carpeta o modulo muy cercano.

Correcto:

```ts
import "./styles.css";
import Button from "./Button";
```

Aceptable:

```ts
export { default } from "./Button";
```

Evitar:

```ts
import X from "../../../../services/api";
```

## React

### Formularios

Usar React Hook Form para formularios.

El proyecto ya lo usa en:

```txt
LoginForm
RegisterForm
ForgotPasswordForm
```

Correcto:

```ts
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<LoginFormData>();
```

Incorrecto:

```ts
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
```

Regla:

```txt
No usar formularios controlados para formularios normales.
Usar React Hook Form.
```

### Cuando Si Usar useState

`useState` es valido para estado local de UI.

Correcto:

```txt
showPassword
isOpen
selectedTab
isSubmitting
serverError
```

Ejemplo actual correcto:

```txt
PasswordField usa showPassword como estado visual local.
```

No usar `useState` para reemplazar React Hook Form en formularios grandes.

### Componentes

Los componentes deben mantenerse enfocados.

Reglas:

- Los atoms no deben conocer negocio.
- Las molecules no deben llamar APIs.
- Los organisms genericos no deben manejar reglas de dominio pesadas.
- Las pages deben componer, no contener toda la logica.
- Los componentes de negocio deben vivir en `features/`.

Ejemplo:

```txt
CourseCard -> features/courses/components
StudentRiskPanel -> features/analytics/components
```

No:

```txt
components/atoms/CourseCard
components/molecules/StudentRiskPanel
```

## Zustand

Zustand debe usarse solo para estado global real.

Uso correcto:

```txt
auth.store.ts
app.store.ts
```

`auth.store.ts` debe manejar:

- sesion;
- tokens;
- usuario autenticado;
- rol;
- login;
- logout;
- hydrate;
- clearSession.

No usar Zustand para:

- valor de un input;
- estado de un modal local;
- tab seleccionada dentro de un componente aislado;
- listas temporales de una sola pantalla;
- errores locales de formulario.

Regla:

```txt
Si el estado no necesita sobrevivir navegacion o ser compartido por varias zonas, no va en Zustand.
```

## Fuente De Verdad De Sesion

Regla final:

```txt
AuthStore = fuente de verdad
```

Estructura esperada:

```txt
store/auth.store.ts
-> usa internamente services/api/tokenStorage.ts
-> axiosClient.ts pregunta por token
```

Responsabilidades:

```txt
auth.store.ts
-> sabe si hay sesion
-> guarda user
-> guarda role
-> ejecuta login/logout
-> hidrata sesion

tokenStorage.ts
-> solo lee/escribe tokens

axiosClient.ts
-> adjunta Authorization
-> no decide si hay sesion
```

Prohibido:

```txt
componentes leyendo localStorage
pages escribiendo tokens
servicios de dominio manipulando sesion
varias fuentes de verdad para auth
```

## JWT

No usar JWT como fuente de datos del usuario.

Correcto:

```txt
JWT = autenticacion
/users/me = identidad, rol y estado del usuario
```

Flujo recomendado:

```txt
Login
-> backend devuelve accessToken y refreshToken
-> auth.store guarda tokens
-> auth.store llama /api/v1/users/me
-> backend devuelve usuario real con rol
-> auth.store guarda user
-> RoleRedirect navega segun user.role
```

Incorrecto:

```txt
Decodificar JWT en cada page para obtener role.
Guardar role separado en localStorage desde componentes.
```

## Services

### No Usar Axios Directo En Componentes

Nunca usar Axios directo dentro de componentes.

Correcto:

```ts
import { login } from "@/services/auth.service";

await login(data);
```

Incorrecto:

```ts
import axios from "axios";

await axios.post("/api/v1/auth/login", data);
```

Regla:

```txt
Los componentes llaman servicios.
Los servicios llaman Axios.
```

### Estado Actual A Corregir

Actualmente `LoginForm` importa `axios` para usar `axios.isAxiosError`.

Eso funciona, pero no es la convencion final.

Mejor enfoque:

```txt
services/api/httpErrors.ts
-> normalizeApiError(error)

LoginForm
-> catch error
-> setServerError(normalizeApiError(error).message)
```

Asi los componentes no dependen de Axios ni de la forma exacta del error HTTP.

### Estructura De Services

Estructura recomendada:

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

No hardcodear endpoints dentro de componentes.

Correcto:

```ts
api.post(ENDPOINTS.AUTH.LOGIN, credentials);
```

Incorrecto:

```ts
api.post("/v1/auth/login", credentials);
```

Excepcion temporal:

```txt
El proyecto actual usa /v1/auth/login directamente en auth.service.ts.
Debe moverse a endpoints.ts cuando se reorganice services/api.
```

## Routes

Las rutas deben centralizarse.

Estructura recomendada:

```txt
routes/
|-- AppRouter.tsx
|-- paths.ts
|-- routeConfig.ts
|-- ProtectedRoute.tsx
|-- PublicOnlyRoute.tsx
`-- RoleRedirect.tsx
```

Reglas:

- `RoleRedirect` usa `authStore.user.role`, no JWT.
- `ProtectedRoute` bloquea rutas privadas.
- `PublicOnlyRoute` evita que usuarios autenticados vuelvan a login/register.
- Las rutas privadas se agrupan por rol: `/student/*`, `/teacher/*`, `/admin/*`.

## Features

No crear `features/dashboard`.

Dashboard es una vista compuesta, no un dominio.

Features finales:

```txt
features/
|-- auth/
|-- courses/
|-- analytics/
|-- recommendations/
|-- students/
|-- teachers/
`-- admin/
```

Cada feature puede contener:

```txt
components/
hooks/
mappers/
services/
types/
```

Ejemplo:

```txt
features/courses/
|-- components/
|-- hooks/
|-- mappers/
|-- services/
`-- types/
```

## Pages

Los dashboards viven en `pages`, no en `features`.

Correcto:

```txt
pages/student/StudentDashboardPage
pages/teacher/TeacherDashboardPage
pages/admin/AdminDashboardPage
```

Cada page compone features reales.

Ejemplo:

```txt
StudentDashboardPage
-> courses
-> analytics
-> recommendations
-> students
```

## Checklist Rapido

Antes de crear un archivo, revisar:

- Es componente React? `PascalCase`.
- Es hook? `useSomething` en `camelCase`.
- Es asset? carpeta en `kebab-case`.
- Importa desde `src`? usar `@/`.
- Es formulario? usar React Hook Form.
- Es estado global real? Zustand.
- Es estado local de UI? `useState`.
- Necesita backend? crear o usar un service.
- Es Axios dentro de componente? no.
- Es dashboard? va en `pages`, no en `features`.
- Es Course/Student/Risk/Recommendation? va en `features`.

## Resumen

Convenciones finales:

```txt
PascalCase para componentes.
camelCase con use para hooks.
kebab-case para carpetas de assets.
@/ para imports internos.
React Hook Form para formularios.
No formularios controlados para formularios normales.
Zustand solo para estado global.
AuthStore como fuente de verdad de sesion.
No decodificar JWT para usuario.
No Axios directo dentro de componentes.
No features/dashboard.
```

Estas reglas mantienen el frontend consistente, facil de revisar y alineado con la arquitectura de MentoraPredict.
