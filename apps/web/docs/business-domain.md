# MentoraPredict Web - Business Domain

Este documento describe el negocio que debe modelar `apps/web`.

No es un documento de carpetas, rutas ni componentes. Es la referencia para entender que representa MentoraPredict, quienes usan la plataforma, cual es la entidad principal y como deberian fluir las pantallas por rol.

La razon de este documento es simple:

```txt
Si el frontend no entiende el negocio, termina organizandose por pantallas sueltas.
Si entiende el negocio, puede crecer por dominios claros.
```

## Que Es MentoraPredict

MentoraPredict es una plataforma academica orientada a detectar riesgo estudiantil mediante datos academicos, metricas, alertas y recomendaciones.

El objetivo del producto es ayudar a:

- estudiantes a entender su rendimiento y recibir recomendaciones;
- docentes a dar seguimiento a cursos y estudiantes;
- administradores a gestionar usuarios, cursos y carga de datos.

## Modelo Mental Principal

El frontend no debe girar alrededor de formularios, dashboards ni carpetas tecnicas.

El modelo principal del producto es:

```txt
Usuario
-> Cursos
-> Curso
-> Resumen
-> Rendimiento
-> Riesgo
-> Recomendaciones
```

La entidad que organiza la experiencia es:

```txt
Course
```

Aunque el backend use nombres como `subjects`, el frontend debe hablar de `courses`, porque ese es el lenguaje natural para estudiantes y docentes.

## Roles

MentoraPredict trabaja con tres roles principales:

```txt
STUDENT
TEACHER
ADMIN
```

El rol no es solo una etiqueta de UI. El rol define:

- a que rutas puede entrar el usuario;
- que dashboard inicial ve despues del login;
- que entidades puede consultar;
- que acciones puede ejecutar;
- que lenguaje debe mostrar la interfaz.

## Student

`Student` representa al estudiante que consulta su informacion academica.

Su objetivo principal es entender:

- en que cursos esta inscrito;
- como va su rendimiento;
- si tiene riesgo academico;
- que acciones puede tomar para mejorar;
- que datos personales o academicos se estan usando.

### Flujo Principal Del Estudiante

```txt
Dashboard
->
Curso
->
Resumen
->
Rendimiento
->
Mis Datos
```

Version con rutas esperadas:

```txt
/student/dashboard
-> /student/courses
-> /student/courses/:courseId
-> /student/courses/:courseId/summary
-> /student/courses/:courseId/performance
-> /student/profile
```

### Dashboard Del Estudiante

El dashboard del estudiante debe responder rapidamente:

- cuales son sus cursos activos;
- cual es su estado academico general;
- donde hay riesgo;
- que recomendaciones recientes existen;
- que actividad requiere atencion.

No debe ser una pagina decorativa. Debe ser un resumen accionable.

### Curso Para Estudiante

Para un estudiante, un curso es el centro de consulta.

Un curso puede mostrar:

- informacion general;
- docente;
- progreso;
- evaluaciones;
- calificaciones;
- asistencia o participacion si aplica;
- metricas;
- riesgo;
- recomendaciones.

### Rendimiento

`Rendimiento` agrupa los datos que explican como va el estudiante.

Puede incluir:

- notas;
- evaluaciones;
- tendencia de desempeno;
- comparacion con objetivos;
- alertas;
- indicadores de riesgo.

### Mis Datos

`Mis Datos` debe permitir que el estudiante entienda su informacion personal y academica dentro de la plataforma.

Puede incluir:

- perfil;
- datos academicos base;
- cursos inscritos;
- historial relevante;
- configuracion de cuenta.

## Teacher

`Teacher` representa al docente que da seguimiento a cursos y estudiantes.

Su objetivo principal es:

- revisar sus cursos;
- identificar estudiantes en riesgo;
- analizar rendimiento del grupo;
- consultar detalle de estudiantes;
- cargar o validar datos academicos cuando corresponda.

### Flujo Principal Del Docente

```txt
Dashboard
->
Curso
->
Analytics
->
Estudiantes
->
Carga de Datos
```

Version con rutas esperadas:

```txt
/teacher/dashboard
-> /teacher/courses
-> /teacher/courses/:courseId
-> /teacher/courses/:courseId/analytics
-> /teacher/courses/:courseId/students
-> /teacher/data-ingestion
```

### Dashboard Del Docente

El dashboard del docente debe responder:

- que cursos tiene asignados;
- que cursos tienen mas riesgo;
- cuantos estudiantes requieren seguimiento;
- que alertas recientes existen;
- que carga o actualizacion de datos esta pendiente.

### Curso Para Docente

Para un docente, un curso no es solo informacion descriptiva.

Es una unidad de seguimiento academico.

Un curso puede mostrar:

- resumen del curso;
- estudiantes inscritos;
- distribucion de rendimiento;
- alertas por estudiante;
- metricas de riesgo;
- recomendaciones agregadas;
- acciones de seguimiento.

### Analytics

`Analytics` agrupa visualizaciones e indicadores para tomar decisiones.

Puede incluir:

- estudiantes en riesgo;
- tendencia del curso;
- rendimiento por evaluacion;
- distribucion de calificaciones;
- comparaciones entre periodos;
- alertas academicas.

### Estudiantes

La vista de estudiantes debe permitir:

- listar estudiantes por curso;
- filtrar por riesgo o rendimiento;
- abrir detalle de estudiante;
- consultar alertas;
- revisar recomendaciones o acciones sugeridas.

### Carga De Datos

La carga de datos es parte del flujo docente si el docente participa en la actualizacion de informacion academica.

Puede incluir:

- subir calificaciones;
- cargar asistencia;
- validar archivos;
- revisar errores de ingestion;
- confirmar datos antes de procesarlos.

Si esta responsabilidad queda solo para administradores, esta vista debe moverse al flujo `Admin`.

## Admin

`Admin` representa al usuario encargado de configuracion y administracion de la plataforma.

Su objetivo principal es:

- administrar usuarios;
- gestionar cursos;
- controlar carga de datos;
- revisar estado general del sistema;
- mantener configuraciones y permisos.

### Flujo Principal Del Admin

```txt
Dashboard
->
Usuarios
->
Cursos
->
Carga de Datos
->
Configuracion
```

Version con rutas esperadas:

```txt
/admin/dashboard
-> /admin/users
-> /admin/courses
-> /admin/data-ingestion
-> /admin/settings
```

### Dashboard Del Admin

El dashboard del admin debe responder:

- cuantos usuarios existen por rol;
- cuantos cursos estan activos;
- si existen errores de carga de datos;
- si hay procesos pendientes;
- cual es el estado general de la plataforma.

### Usuarios

La administracion de usuarios puede incluir:

- crear usuarios;
- editar informacion;
- asignar roles;
- activar o desactivar cuentas;
- revisar estado de acceso.

### Cursos

La gestion de cursos puede incluir:

- crear cursos;
- editar cursos;
- asignar docentes;
- asociar estudiantes;
- revisar estado academico del curso.

### Carga De Datos

Para admin, la carga de datos es una responsabilidad operativa.

Puede incluir:

- importar archivos institucionales;
- revisar validaciones;
- corregir errores;
- relanzar procesos;
- consultar historial de cargas.

## Entidad Principal: Course

`Course` es la entidad principal de la experiencia.

Esto no significa que todo sea un curso. Significa que muchas experiencias importantes se entienden mejor desde un curso:

```txt
Course
-> Students
-> Evaluations
-> Grades
-> Metrics
-> Risk
-> Recommendations
```

### Por Que Course Y No Subject

El backend puede usar `Subject`, `Materia` u otro nombre tecnico.

El frontend debe usar:

```txt
Course
```

Motivo:

- es mas claro para UI;
- coincide con la experiencia del usuario;
- evita filtrar lenguaje interno del backend;
- mantiene estable el lenguaje del producto aunque cambien microservicios.

Regla:

```txt
Backend language can be mapped.
Frontend language must be user-centered.
```

## Entidades Del Dominio

Estas son las entidades principales que el frontend debe reconocer.

| Entidad | Significado En El Producto |
| --- | --- |
| `User` | Persona autenticada en la plataforma. |
| `Role` | Politica de acceso y navegacion. |
| `Student` | Usuario que consulta su rendimiento academico. |
| `Teacher` | Usuario que da seguimiento a cursos y estudiantes. |
| `Admin` | Usuario que administra plataforma, usuarios, cursos y datos. |
| `Course` | Unidad academica principal de la experiencia. |
| `Enrollment` | Relacion entre estudiante y curso. |
| `Evaluation` | Actividad evaluada dentro de un curso. |
| `Grade` | Resultado academico asociado a una evaluacion. |
| `Metric` | Indicador calculado a partir de datos academicos. |
| `Risk` | Senal de posible problema academico. |
| `Alert` | Evento que requiere atencion. |
| `Recommendation` | Accion sugerida para mejorar o intervenir. |
| `Observation` | Comentario o registro cualitativo asociado al seguimiento. |

## Dominios Frontend

El frontend debe crecer por dominios, no por vistas.

Dominios recomendados:

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

Responsable de:

- login;
- logout;
- recuperacion de contrasena;
- sesion;
- usuario autenticado;
- rol.

### Courses

Responsable de:

- cursos;
- detalle de curso;
- estudiantes por curso si el contexto principal es el curso;
- evaluaciones;
- progreso;
- resumen academico.

### Analytics

Responsable de:

- metricas;
- graficos;
- riesgo;
- tendencias;
- indicadores agregados.

### Recommendations

Responsable de:

- recomendaciones generadas;
- acciones sugeridas;
- observaciones;
- historial de recomendaciones.

### Students

Responsable de:

- perfil academico del estudiante;
- datos del estudiante;
- detalle individual;
- seguimiento individual cuando el foco sea la persona.

### Teachers

Responsable de:

- informacion propia del docente;
- cursos asignados desde perspectiva docente;
- seguimiento docente;
- acciones del docente.

### Admin

Responsable de:

- administracion de usuarios;
- administracion de cursos;
- configuracion;
- carga de datos;
- operaciones internas.

## Dashboard No Es Un Dominio

No crear:

```txt
features/dashboard
```

Un dashboard es una vista compuesta, no un dominio.

Ejemplo correcto:

```txt
StudentDashboardPage
-> features/courses
-> features/analytics
-> features/recommendations
-> features/students
```

Ejemplo docente:

```txt
TeacherDashboardPage
-> features/courses
-> features/analytics
-> features/students
-> features/teachers
```

Ejemplo admin:

```txt
AdminDashboardPage
-> features/admin
-> features/courses
-> features/students
-> features/teachers
```

## Navegacion Por Rol

Despues del login, cada rol debe entrar a su espacio inicial.

```txt
STUDENT -> /student/dashboard
TEACHER -> /teacher/dashboard
ADMIN   -> /admin/dashboard
```

La navegacion por rol debe depender del usuario autenticado y su rol.

No debe depender de:

- texto del formulario;
- rutas hardcodeadas dentro de componentes visuales;
- decodificacion manual del JWT en cada pantalla;
- checks duplicados dentro de pages.

## Lenguaje De Producto

El frontend debe usar nombres claros para la experiencia de usuario.

Preferir:

```txt
Course
Student
Teacher
Risk
Recommendation
Performance
Dashboard
```

Evitar exponer al usuario nombres internos si no son claros:

```txt
Subject
DTO
IngestionJob
PredictionPayload
RawMetric
```

Los nombres tecnicos pueden existir en services, mappers o tipos de API, pero la UI debe hablar en lenguaje de producto.

## Reglas De Negocio Para El Frontend

- `Course` es la entidad principal de navegacion academica.
- `Role` define acceso, redireccion y menus.
- `Dashboard` es una composicion de dominios, no un dominio propio.
- `Risk` debe presentarse como senal accionable, no solo como numero.
- `Recommendation` debe conectar el dato con una accion sugerida.
- `Student` debe poder entender su rendimiento sin ver detalles operativos internos.
- `Teacher` debe poder pasar de curso a estudiantes y analytics rapidamente.
- `Admin` debe concentrarse en gestion, configuracion y datos.
- El frontend debe mapear lenguaje backend a lenguaje de usuario.

## Relacion Con Rutas

Las rutas deben reflejar el negocio:

```txt
/student/*
/teacher/*
/admin/*
```

Dentro de cada area, `Course` debe aparecer como entidad de navegacion central:

```txt
/student/courses/:courseId
/teacher/courses/:courseId
/admin/courses
```

La ruta no debe exponer detalles internos del backend si existe un nombre mas claro para el usuario.

## Relacion Con Componentes

Los componentes de negocio deben vivir en `features/`.

Ejemplos:

```txt
CourseCard -> features/courses/components
StudentRiskPanel -> features/analytics/components
TeacherStudentsTable -> features/teachers/components
AdminUsersTable -> features/admin/components
RecommendationList -> features/recommendations/components
```

No deben vivir en:

```txt
components/atoms
components/molecules
components/organisms
```

`components/` es para UI generica. `features/` es para negocio.

## Estado Actual Del Proyecto

Actualmente `apps/web` implementa principalmente:

- landing publica;
- login;
- registro;
- recuperacion de contrasena;
- estructura base de Atomic Design;
- router publico inicial.

Las areas `student`, `teacher` y `admin` todavia estan como arquitectura esperada, no como pantallas completas implementadas.

Este documento define la direccion de negocio para construir esas areas sin improvisar nombres, flujos o dominios.

## Resumen

MentoraPredict debe crecer alrededor de esta idea:

```txt
Rol define acceso.
Course organiza la experiencia academica.
Analytics explica el rendimiento.
Risk detecta problemas.
Recommendation sugiere acciones.
Dashboard compone todo segun el rol.
```

Con este modelo, el frontend puede crecer sin confundir vistas con dominios ni componentes visuales con negocio real.
