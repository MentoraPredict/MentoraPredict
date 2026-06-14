# MentoraPredict Web - Design System

Este documento define como se usa Atomic Design en `apps/web` y que reglas debe seguir el equipo al crear componentes reutilizables.

El sistema visual vive en:

```txt
src/components/
|-- atoms/
|-- molecules/
|-- organisms/
`-- templates/
```

La regla principal es:

```txt
components = sistema visual reutilizable
features = componentes y logica de negocio
pages = pantallas completas conectadas al router
```

Atomic Design no debe convertirse en una carpeta para todo lo visual. Si un componente representa una entidad del negocio, debe vivir en `features/`, aunque tenga apariencia de card, table, panel o section.

## Estado Actual

El proyecto ya tiene una base de Atomic Design implementada.

```txt
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

Esta estructura es correcta para la primera etapa del proyecto: landing, autenticacion y componentes visuales compartidos.

## Atoms

Los atoms son las piezas visuales mas pequenas del sistema. Deben ser genericos, reutilizables y sin conocimiento del negocio.

Ejemplos actuales:

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

Un atom puede recibir props visuales o HTML basicas, pero no debe saber nada sobre cursos, estudiantes, docentes, riesgos, recomendaciones o roles.

### Si Es Atom

```txt
Button
Input
Label
Badge
Heading
Text
```

Porque son primitivas visuales reutilizables en cualquier parte de la app.

### No Es Atom

```txt
CourseCard
StudentRiskBadge
TeacherCourseStatus
RecommendationScore
AdminUserBadge
```

Aunque algunos parezcan pequenos, tienen significado de negocio. Deben vivir dentro de `features/`.

Ejemplo:

```txt
CourseCard NO es un atom.
CourseCard pertenece a features/courses.
```

## Molecules

Las molecules combinan atoms para resolver una necesidad pequena y reutilizable de interfaz.

Ejemplos actuales:

- `FormField`: combina `Label`, `Input` y `ErrorMessage`.
- `PasswordField`: combina `Label`, `Input`, `IconButton` y `ErrorMessage`.
- `Divider`: separador visual reutilizable.
- `NavItem`: item simple de navegacion.
- `SocialLink`: link social reutilizable.
- `AuthFooter`: bloque pequeno usado en pantallas de auth.
- `FeatureCard`: card generica para secciones informativas de la landing.
- `StatCard`: card generica de estadisticas de la landing.

Una molecule puede tener estado local de UI si ese estado no es negocio. Por ejemplo, `PasswordField` maneja `showPassword`, que es comportamiento visual local.

### Si Es Molecule

```txt
FormField
PasswordField
NavItem
Divider
SocialLink
```

Porque combinan atoms y siguen siendo reutilizables fuera de un dominio especifico.

### No Es Molecule

```txt
CourseCard
CourseProgressCard
StudentGradeRow
RiskLevelCard
TeacherStudentItem
RecommendationItem
```

Estos componentes no son genericos. Representan datos y lenguaje del producto.

Ejemplo:

```txt
CourseCard NO es un molecule.
CourseCard pertenece a features/courses.
```

## Organisms

Los organisms son bloques grandes de interfaz construidos con atoms y molecules. Pueden formar secciones completas de una pagina o formularios complejos.

Ejemplos actuales:

- `Navbar`
- `Footer`
- `HeroSection`
- `FeaturesSection`
- `StatsSection`
- `AuthHero`
- `LoginForm`
- `RegisterForm`
- `ForgotPasswordForm`

En el estado actual, los formularios de auth viven en `components/organisms` porque todavia no existe `features/auth`. A medida que crezca la aplicacion, los formularios con logica de autenticacion pueden moverse a:

```txt
src/features/auth/components/
```

Esto aplica especialmente cuando el formulario empieza a depender del auth store, servicios de usuario, manejo avanzado de errores o reglas de negocio.

### Si Es Organism

```txt
Navbar
Footer
HeroSection
LoginForm
RegisterForm
StatsSection
```

Porque son bloques visuales grandes y reutilizables dentro de una pagina.

### No Es Organism Generico

```txt
StudentRiskPanel
TeacherCourseSummary
AdminUsersTable
CourseEvaluationsSection
RecommendationTimeline
```

Aunque sean secciones grandes, pertenecen a dominios del producto. Deben vivir en `features/`.

Ubicacion correcta:

```txt
features/analytics/components/StudentRiskPanel
features/teachers/components/TeacherCourseSummary
features/admin/components/AdminUsersTable
features/courses/components/CourseEvaluationsSection
features/recommendations/components/RecommendationTimeline
```

## Templates

Los templates definen estructura de layout. No deberian contener reglas de negocio, llamadas HTTP ni decisiones de sesion.

Ejemplos actuales:

- `AuthTemplate`: define la estructura de pantallas de autenticacion con una zona visual y contenido.
- `LandingTemplate`: compone `Navbar`, `HeroSection`, `StatsSection`, `FeaturesSection` y `Footer`.

Los templates pueden recibir `children` o componer organisms, pero deben mantenerse como estructura visual.

### Si Es Template

```txt
AuthTemplate
LandingTemplate
DashboardTemplate
SettingsTemplate
```

Porque organizan regiones de una pantalla.

### No Es Template

```txt
StudentDashboardPage
TeacherCoursesPage
AdminUsersPage
```

Estas son paginas conectadas a rutas. Deben vivir en `pages/`.

## Diferencia Entre Components Y Features

La diferencia mas importante del proyecto es esta:

```txt
components/ no conoce el negocio
features/ si conoce el negocio
```

`components/` puede saber que existe un boton, una etiqueta, un input, una card generica o una seccion visual.

`features/` puede saber que existe un curso, un estudiante, un docente, un riesgo academico, una recomendacion o una alerta.

## Ejemplo Obligatorio: CourseCard

`CourseCard` no debe vivir en Atomic Design.

No es atom:

```txt
CourseCard NO es un atom porque no es una primitiva visual.
```

No es molecule:

```txt
CourseCard NO es un molecule porque representa una entidad de negocio.
```

No deberia vivir en:

```txt
src/components/atoms/CourseCard
src/components/molecules/CourseCard
src/components/organisms/CourseCard
```

Debe vivir en:

```txt
src/features/courses/components/CourseCard
```

Motivo:

```txt
CourseCard habla de cursos, progreso, docente, riesgo, metricas o estado academico.
Eso pertenece al dominio courses, no al sistema visual generico.
```

Si se necesita una card generica, se puede crear:

```txt
src/components/molecules/Card
```

Y luego usarla dentro de:

```txt
src/features/courses/components/CourseCard
```

## Reglas De Clasificacion

Antes de crear un componente, responder estas preguntas:

| Pregunta | Si la respuesta es si | Ubicacion |
| --- | --- | --- |
| Es una primitiva visual generica? | Si | `components/atoms` |
| Combina pocas primitivas genericas? | Si | `components/molecules` |
| Es un bloque visual grande reutilizable? | Si | `components/organisms` |
| Define layout de una pantalla? | Si | `components/templates` |
| Representa un curso, estudiante, docente, riesgo o recomendacion? | Si | `features/*/components` |
| Es una pantalla conectada a una ruta? | Si | `pages/` |
| Tiene llamadas HTTP o reglas de dominio? | Si | `features/` o `services/`, no `components/` |

## Reglas Para Atoms

- Deben ser pequenos y reutilizables.
- No deben importar servicios.
- No deben importar store global.
- No deben usar `useNavigate`.
- No deben depender de rutas.
- No deben conocer roles.
- No deben contener nombres de entidades de negocio.
- Pueden usar Tailwind y tokens globales.
- Pueden exponer variantes visuales como `primary`, `outline`, `danger` si aplica.

Ejemplo correcto:

```txt
Button variant="outline"
```

Ejemplo incorrecto:

```txt
Button variant="student-risk"
```

La variante `student-risk` mezcla UI generica con negocio.

## Reglas Para Molecules

- Deben combinar atoms.
- Deben resolver un patron pequeno de UI.
- Pueden tener estado local visual.
- No deben llamar APIs.
- No deben decidir redireccion por rol.
- No deben cargar datos de backend.
- No deben representar entidades completas del dominio.

Ejemplo correcto:

```txt
FormField = Label + Input + ErrorMessage
```

Ejemplo incorrecto:

```txt
CourseFormField = campo especifico de cursos dentro de components/molecules
```

Si el campo solo existe para cursos, debe estar en `features/courses`.

## Reglas Para Organisms

- Pueden componer atoms, molecules y otros organisms pequenos.
- Pueden representar secciones completas de UI.
- Deben seguir siendo reutilizables o pertenecer a una pagina publica/base.
- No deben mezclar demasiada logica de negocio.
- No deben hacer llamadas HTTP directamente salvo casos temporales muy controlados.
- Si empiezan a depender de un dominio, deben moverse a `features/`.

Ejemplo aceptable actual:

```txt
LoginForm en components/organisms
```

Motivo: el proyecto todavia no tiene `features/auth`.

Evolucion recomendada:

```txt
features/auth/components/LoginForm
features/auth/components/RegisterForm
features/auth/components/ForgotPasswordForm
```

Cuando el flujo de auth crezca, esa ubicacion sera mas clara.

## Reglas Para Templates

- Deben definir estructura de layout.
- Pueden recibir `children`.
- Pueden componer organisms.
- No deben llamar servicios.
- No deben guardar estado de negocio.
- No deben contener validaciones de formularios.
- No deben decidir autorizacion.

Ejemplo correcto:

```txt
AuthTemplate = layout para paginas de autenticacion
```

Ejemplo incorrecto:

```txt
AuthTemplate llama login() o decide RoleRedirect
```

## Relacion Con Pages

Las paginas viven en:

```txt
src/pages/
```

Una page debe componer templates, organisms y features.

Ejemplos actuales:

```txt
pages/LandingPage
pages/auth/LoginPage
pages/auth/RegisterPage
pages/auth/ForgotPasswordPage
```

Una page puede decidir que template usar, pero no deberia convertirse en una carpeta de componentes internos gigantes.

Ejemplo esperado:

```txt
LoginPage
-> AuthTemplate
-> LoginForm
```

Cuando existan dashboards:

```txt
StudentDashboardPage
-> DashboardTemplate
-> features/courses/components/CourseSummary
-> features/analytics/components/StudentRiskPanel
-> features/recommendations/components/RecommendationList
```

## Relacion Con Styles

Los tokens globales viven en:

```txt
src/styles/
|-- colors.css
|-- typography.css
|-- spacing.css
|-- theme.css
`-- globals.css
```

Los componentes deben reutilizar estos tokens mediante TailwindCSS v4 y las clases globales disponibles.

Reglas:

- No duplicar paletas de color en cada componente.
- No crear estilos globales para un componente especifico.
- No hardcodear estilos de negocio en atoms.
- Mantener variantes visuales consistentes.

## Imports Recomendados

Los componentes se exportan desde `index.ts` dentro de cada nivel.

Ejemplo:

```ts
import { Button, Heading, Text } from "@/components/atoms";
import { FormField, PasswordField } from "@/components/molecules";
import { Navbar } from "@/components/organisms";
```

Evitar imports profundos cuando ya exista un barrel export claro.

Aceptable cuando el barrel aun no exporta el componente:

```ts
import HeroSection from "@/components/organisms/HeroSection";
```

## Reglas De Crecimiento

- Mantener `components/` libre de entidades de negocio.
- Crear componentes genericos solo cuando se vayan a reutilizar.
- No meter dashboards especificos dentro de `components/organisms`.
- No crear atoms grandes.
- No crear molecules que ya representan un dominio.
- No crear templates que hagan trabajo de pages.
- No usar Atomic Design como excusa para separar todo en archivos pequenos sin beneficio.
- Si el nombre incluye `Course`, `Student`, `Teacher`, `Admin`, `Risk`, `Recommendation`, `Grade` o `Alert`, probablemente pertenece a `features/`.

## Guia Rapida

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

## Resumen

Atomic Design en MentoraPredict debe usarse como sistema visual reutilizable, no como organizador de negocio.

La separacion correcta es:

```txt
Atoms = primitivas visuales
Molecules = combinaciones pequenas
Organisms = bloques grandes reutilizables
Templates = estructura de layout
Features = componentes con significado de negocio
Pages = pantallas conectadas al router
```

Con esta regla, el frontend puede crecer hacia cursos, dashboards, analitica, riesgo y recomendaciones sin contaminar el design system con componentes especificos del dominio.
