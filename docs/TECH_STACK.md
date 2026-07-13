# Stack tecnológico: librerías y frameworks clave

Este documento explica **por qué** se usa cada una de estas tecnologías en MentoraPredict, **qué problema resuelve** concretamente en el proyecto (no en abstracto) y **dónde** está implementada, con rutas de archivo verificables. Es un complemento a [architecture/high-level-architecture.md](architecture/high-level-architecture.md) (arquitectura de los microservicios backend) y a los [ADRs](adr/) (decisiones puntuales) — este documento cubre el stack de los cuatro clientes del proyecto (`apps/web`, `apps/landing`, `apps/mobile`, `apps/desktop`) y la capa de tiempo real.

> **Nota de mantenimiento**: gran parte de la documentación en `docs/` fue escrita en etapas tempranas del proyecto y no refleja el estado actual (ej. RabbitMQ aparece mencionado en algunos documentos aunque fue removido — ver [ADR 0003](adr/0003-messaging-and-notifications.md)). Este documento se escribió verificando cada afirmación contra el código real al momento de escribirlo. Si algo de acá deja de ser cierto, hay que actualizarlo en el mismo commit que cambia el código, no después.

---

## Índice

1. [TanStack Query (React Query)](#1-tanstack-query-react-query)
2. [Zustand](#2-zustand)
3. [React Hook Form](#3-react-hook-form)
4. [Socket.IO](#4-socketio)
5. [Jamstack: Astro + Contentful](#5-jamstack-astro--contentful)
6. [Expo + React Native](#6-expo--react-native)
7. [Electron](#7-electron)
8. [Resumen: qué NO se usa (y por qué importa aclararlo)](#8-resumen-qué-no-se-usa)

---

## 1. TanStack Query (React Query)

**Qué es**: librería de gestión de estado *servidor* (datos que viven en el backend, no en el cliente) — cachea respuestas HTTP, las revalida, deduplica peticiones en vuelo, y da primitivas (`useQuery`, `useMutation`) para no tener que escribir a mano `isLoading`/`error`/`data` con `useEffect` en cada componente.

**Por qué se usa acá**: `apps/web` es un dashboard con datos que cambian constantemente entre roles (cursos de un docente, rendimiento de un estudiante, notificaciones) y que se repiten en varias pantallas — sin una capa de cache compartida, cada pantalla dispara su propio fetch aunque los datos ya se hayan pedido segundos antes. Además, resuelve un problema real y específico del proyecto: **crear un curso es una operación que puede fallar a mitad de camino** (se crea el curso pero falla la matrícula de estudiantes, o se pierde la conexión) y el equipo quería que la UI mostrara el curso "optimista" de inmediato y lo reconciliara cuando la petición real termine, en vez de bloquear el formulario hasta tener respuesta del servidor.

**Dónde se usa**:
- Configuración central: `apps/web/src/services/query/queryClient.ts` — un único `QueryClient`, con **persistencia en `localStorage`** vía `@tanstack/query-sync-storage-persister` (`key: "mentorapredict-query-cache"`, `throttleTime: 300`, cache máximo de 7 días) para que el cache sobreviva a un recargo de página.
- Provider: `apps/web/src/providers/QueryProvider.tsx`, montado en `apps/web/src/App.tsx`.
- Hooks de queries: `apps/web/src/hooks/queries/` (`useTeacherCourses`, `useTeacherCourseAnalytics`, `useStudentCourses`, `useStudentCoursePerformance`, `useNotifications`, `useAdminCourses`) y `apps/web/src/features/teachers/hooks/useTeacherCourses/`.
- **Caso destacado — mutación optimista y resumible**: `apps/web/src/services/query/createCourseMutation.ts` registra los defaults de la mutación de "crear curso" directamente en el `QueryClient` (`registerCreateCourseMutationDefaults`, llamado al cargar el módulo, *antes* de que monte cualquier provider). Esto es necesario porque TanStack Query persiste mutaciones pausadas (ej. el usuario se quedó sin conexión) en `localStorage`, y al recargar la página esas mutaciones pausadas necesitan volver a encontrar su función (`mutationFn`) — un closure normal definido dentro de un componente ya no existiría tras el reload, por eso el registro es global y no local a un hook. El flujo: `onMutate` inserta un curso optimista con `isPendingSync: true` en el cache; `onSuccess` lo reemplaza por el curso real; `onError` hace rollback, excepto si fue un `PartialCourseCreationError` (el curso sí se creó pero falló matricular a algunos estudiantes), caso en el que el curso se mantiene y solo se marca `isPendingSync: false`.

**Importante — adopción parcial, no total**: no todas las pantallas usan TanStack Query. Varias áreas del panel admin (ej. `apps/web/src/features/admin/hooks/useAdminUsers/`, `useAdminCourses/`) usan hooks manuales con `useState`/`useEffect` propios en vez de `useQuery`. Esto no es un error — son dos patrones coexistiendo, no una migración a medio terminar documentada como completa. Si se toca una pantalla que ya usa TanStack Query, hay que seguir ese patrón; si se toca una que usa el patrón manual, no hace falta migrarla solo por consistencia.

---

## 2. Zustand

**Qué es**: librería de estado *cliente* (a diferencia de TanStack Query, que es estado *servidor*) — un store minimalista sin boilerplate de reducers/actions/dispatch como Redux.

**Por qué se usa acá**: el proyecto tiene un solo pedazo de estado verdaderamente global que necesita ser leído y escrito desde lugares muy distintos de la app sin pasar por props (interceptores HTTP, guards de rutas, cualquier componente que necesite saber quién está logueado): **la sesión de autenticación**. Zustand se eligió por ser la opción más liviana para ese único caso, no como una solución general de estado — no hay más stores en el proyecto.

**Dónde se usa**: un solo store, `apps/web/src/store/auth.store.ts` (`useAuthStore`). Contiene `user`, `accessToken`, `refreshToken`, `isAuthenticated`, `isHydrated`, y las acciones `login`, `loginWithTokens`, `refreshSession`, `hydrateSession`, `logout`, `clearSession`. `hydrateSession` reconstruye la sesión al cargar la app a partir de los tokens guardados (ver `getAccessToken`/`getRefreshToken` en `services/api/tokenStorage`), y si el token es válido pero `GET /users/me` falla, decodifica el JWT localmente (`decodeJwtPayload`) para no cerrar sesión solo porque el perfil tardó en responder.

---

## 3. React Hook Form

**Qué es**: librería de formularios que evita re-renderizar todo el formulario en cada tecla presionada (los inputs son no controlados por defecto, se registran vía `register()`), con validación integrada y buen soporte de TypeScript.

**Por qué se usa acá**: el proyecto tiene varios formularios con bastante validación (contraseñas, campos condicionales según rol/facultad/carrera, límites de tamaño de archivo) donde re-renderizar en cada tecla sería notorio, y donde escribir el manejo de errores a mano por cada campo sería repetitivo.

**Dónde se usa** (7 formularios, todos en `apps/web`):
- Autenticación: `features/auth/components/LoginForm.tsx`, `RegisterForm.tsx`, `ForgotPasswordForm.tsx`, `ResetPasswordForm.tsx`.
- Administración: `features/admin/components/CreateUserForm/CreateUserForm.tsx`, `features/admin/components/AdminCreateCourseForm/AdminCreateCourseForm.tsx`.
- Docentes: `features/teachers/components/CreateCourseForm/CreateCourseForm.tsx`.

**Nota**: los formularios de edición inline más simples (ej. la fila editable de `AdminUsersTableRow.tsx`, o `EditCourseForm` dentro de `AdminCoursesManagement.tsx`) usan `useState` plano en vez de React Hook Form — son formularios de 2-3 campos sin validación compleja, donde traer la librería no aporta nada. Si un formulario nuevo tiene más de un par de campos o necesita validación, seguir el patrón de React Hook Form; si es una edición trivial de una fila, no hace falta.

---

## 4. Socket.IO

**Qué es**: librería de comunicación en tiempo real que usa WebSocket como transporte principal (con *fallback* automático a otros mecanismos si WebSocket no está disponible), agregando reconexión automática, salas (*rooms*) y un protocolo de mensajes sobre el socket crudo.

**Por qué se usa acá — y qué reemplazó**: el proyecto usó RabbitMQ como bus de eventos hasta que se detectó que ningún `ClientsModule` tenía configurado un `exchange`, así que **ningún mensaje publicado llegó jamás a un consumidor real** — el único consumidor que existía era un stub que solo logueaba y confirmaba (ver [ADR 0003](adr/0003-messaging-and-notifications.md) para el detalle completo). Se decidió: (a) comunicación servicio-a-servicio por HTTP interno directo (fire-and-forget, mismo JWT de servicio que ya se usaba en otros lados), y (b) entrega en tiempo real al navegador — la única necesidad real de "push" del proyecto — vía Socket.IO. No hay bus de mensajes en el proyecto hoy.

**Dónde se usa**:
- Servidor: `services/analytics-service` (dueño del dominio de notificaciones), `NotificationsGateway` en `src/notifications/infrastructure/gateways/notifications.gateway.ts`. Autenticación por JWT RS256 verificado **manualmente en el handshake del socket** (no vía el plugin `jwt` de Kong, porque el handshake de Socket.IO no manda el token como header `Authorization` estándar). Una sala por usuario (`user:{userId}`) para que el *fan-out* sea trivial.
- Gateway: Kong tiene una ruta dedicada `/api/socket.io` sin el plugin `jwt` (`infra/kong/kong-template.yml`), y `apps/web/nginx.conf` reenvía los headers `Upgrade`/`Connection` correctamente para que el *handshake* de WebSocket no se rompa detrás de nginx.
- Cliente: `apps/web` (`socket.io-client`).
- Si nadie está conectado cuando se genera una notificación, igual queda persistida en Postgres y se recupera en el próximo `GET /api/v1/notifications/me` — el socket es solo el camino rápido, no la única fuente de verdad.
- **Limitación conocida**: si `analytics-service` corre con más de una réplica, las salas de Socket.IO no se comparten entre instancias — hace falta un adaptador de Redis (`@socket.io/redis-adapter`) para eso. Redis ya está desplegado (se usa para cache), así que sería un cambio de configuración, no infraestructura nueva. Ver notas del ADR 0003.

**Sobre "WebSocket" como ítem separado**: no existe una implementación de WebSocket "crudo" (paquete `ws` o similar) en el proyecto — el WebSocket que hay es exclusivamente el transporte interno de Socket.IO. No hace falta agregar nada aparte para tener soporte de WebSocket.

---

## 5. Jamstack: Astro + Contentful

**Qué es**: Astro es un framework que genera sitios **estáticos** por defecto (HTML pre-renderizado en build time, cero JavaScript de framework enviado al cliente salvo que se pida explícitamente) — ideal para páginas de marketing/contenido que no necesitan ser una SPA completa. Contentful es un *headless CMS*: permite editar el copy del sitio (textos, imágenes) sin tocar código ni redeployar.

**Por qué se usa acá**: `apps/landing` es la página pública de marketing (no requiere autenticación, no tiene lógica de negocio) — no necesita el peso de una SPA React con router, estado global, etc. Como es contenido que un equipo de marketing/producto podría querer cambiar (textos del hero, estadísticas, features) sin pedirle a un desarrollador que edite código, ese contenido vive en Contentful en vez de estar *hardcodeado*.

**Dónde se usa**:
- Proyecto: `apps/landing`, Astro con `output: "static"` (`astro.config.mjs`), servido detrás de Kong en el path `/landing` del mismo dominio que `apps/web`.
- Cliente de Contentful: `apps/landing/src/lib/contentful.ts` — si `CONTENTFUL_SPACE_ID`/`CONTENTFUL_ACCESS_TOKEN` no están configuradas, el cliente queda `null` y cada función de consulta cae a un **fallback hardcodeado** (mismo shape que el contenido real), así que el sitio nunca se rompe por falta de credenciales, simplemente muestra el contenido por defecto.
- Funciones de consulta: `apps/landing/src/lib/queries.ts` — `getHero()`, `getStats()`, `getFeatures()` (todas activas, consumidas desde `apps/landing/src/pages/index.astro`). Existe también `getDownloadOptions()` para un content type `downloadOption`, pero **ya no se usa**: la sección de descargas se rehizo para mostrar el mismo contenido fijo que la landing de React (ver más abajo), así que ese content type quedó sin consumidor — se dejó la función en el archivo por si se retoma, pero no está conectada a ninguna página.
- **Lo que NO usa Contentful**: la sección de descargas (`apps/landing/src/components/DownloadSection.astro`) tiene su copy fijo en el componente y en cambio consulta en tiempo real (`fetch` del lado del cliente) el estado real del pipeline de builds — `/downloads/mobile.json` y `/downloads/desktop.json`, publicados directamente por CD vía SCP al mismo servidor. Es la única sección de la landing que no depende de un CMS, porque su contenido no es editorial sino operacional (¿hay un build disponible o no?).

---

## 6. Expo + React Native

**Qué es**: React Native permite escribir la app móvil en React/TypeScript compilando a código nativo iOS/Android. Expo es un conjunto de herramientas sobre React Native (build en la nube sin necesitar Xcode/Android Studio instalados localmente, *file-based routing*, APIs nativas pre-empaquetadas) que evita mucho trabajo de configuración nativa manual.

**Por qué se usa acá**: el equipo no compila para iOS (solo Android), y Expo permite generar el APK firmado en CI (GitHub Actions, runner Linux) sin necesitar una Mac ni Android Studio en el pipeline — ver `build-mobile-apk` en `.github/workflows/cd-qa.yml`/`cd-main.yml`, que corre `expo prebuild` + `gradlew assembleRelease` directo en el runner.

**Dónde se usa**:
- Proyecto: `apps/mobile`, Expo SDK con **Expo Router** (ruteo por estructura de archivos, no un router configurado a mano).
- Cliente HTTP propio (fetch nativo, no axios): `apps/mobile/src/services/api/client.ts`, con la URL base resuelta por ambiente (`local`/`qa`/`prod`) vía `EXPO_PUBLIC_API_ENV`/`EXPO_PUBLIC_API_BASE_URL`, todas apuntando a Kong (sufijo `/api`).
- Build/distribución: perfiles en `apps/mobile/eas.json` (`apk` para QA, `apk-prod` para producción), consumidos por CD. El paquete Android es `com.mentorapredict.mobile`.
- Ícono de la app: `apps/mobile/assets/images/icon.png` (logo real del proyecto, con `android-icon-foreground.png` como capa de ícono adaptativo de Android) — ver commit `feat(branding): use the real MentoraPredict logo...`.

**Sobre "Expo Go" específicamente**: Expo Go es la app cliente de Expo para probar durante desarrollo sin compilar un build nativo — es el flujo por defecto de `expo start` mientras el proyecto no use módulos nativos custom que requieran un *development build*. No se verificó puntualmente si el proyecto todavía es compatible con Expo Go puro o si algún plugin nativo ya lo rompió; si eso importa, hay que confirmarlo corriendo `npx expo start` y probando con la app Expo Go.

---

## 7. Electron

**Qué es**: framework que empaqueta una aplicación web (HTML/CSS/JS) como una app de escritorio nativa, embebiendo Chromium + Node.js.

**Por qué se usa acá**: en vez de mantener una UI de escritorio separada, `apps/desktop` **reempaqueta el build ya existente de `apps/web`** como una app instalable de Windows — mismo código, mismo equipo de frontend, sin duplicar lógica de negocio ni componentes.

**Dónde se usa**:
- Proyecto: `apps/desktop`, `electron-builder` como empaquetador. **Corregido (post-cherry-pick)**: el target real es `nsis`, no `msi` — el instalador se migró de MSI a NSIS (instalación per-user, carpeta de instalación configurable, accesos directos de escritorio/menú inicio); ver [DESKTOP_ARCHITECTURE.md](./DESKTOP_ARCHITECTURE.md). Tampoco hay build de macOS ni Linux, pese a que en algún momento el copy de marketing lo insinuaba (corregido en `apps/web`/`apps/landing` para decir "Windows" únicamente).
- El build de `apps/web` (`pnpm --filter @mentorapredict/web build:desktop:{local,qa,prod}`, que usa modos de Vite específicos vía los archivos `apps/web/.env.desktop*`) se empaqueta como recurso extra (`extraResources` en `package.json`, apunta a `../web/dist`).
- Ícono de la app: `apps/desktop/build/mentorapredict-logo.ico` — es el único asset con la marca real del proyecto que existía antes de que se generara el resto (ver `apps/mobile`/`apps/web` arriba, que se derivaron de este mismo logo).
- Distribución: CD compila el `.msi` en un runner `windows-latest` (`build-desktop-app` en `cd-qa.yml`/`cd-main.yml`) y lo publica directo al servidor por SCP, igual que el APK.

---

## 8. Resumen: qué NO se usa

Para que quede registrado y nadie asuma que falta implementar algo que fue evaluado y descartado, o que directamente nunca se consideró:

> **Nota de corrección (post-cherry-pick)**: esta sección se escribió el 11/07 a las 20:07, y el PR #189 (WebAssembly, logging estructurado, y el cambio de instalador a NSIS) se mergeó horas después, el 12/07 a las 04:47 — las tres filas marcadas abajo describían correctamente el estado de ese momento, pero quedaron desactualizadas casi de inmediato. Corregidas aquí contra el estado real verificado en esta rama.

| Tecnología | Estado | Detalle |
|---|---|---|
| WebAssembly (Wasm) | **Sí se usa** (corregido) | Dos módulos reales: `services/analytics-service/src/infrastructure/wasm/linear-regression.wasm.ts` (regresión lineal para el cálculo de tendencia semanal, con su propio spec) y `apps/web/src/utils/wasm/confetti-particles.c` + `confetti-particles-bytes.ts` (física de partículas del confeti al alcanzar una tendencia ascendente, compilado con clang a wasm32). Ver [WEBASSEMBLY.md](./WEBASSEMBLY.md) para el detalle completo. |
| OpenVPN / OVPN | No se usa | Sin ninguna referencia en el repo. El acceso a infraestructura no pasa por una VPN propia. |
| Debounce | No implementado | Las referencias originales a `apps/web/docs/README.md`/`frontend-structure.md` ya no aplican — esos archivos fueron consolidados y luego reemplazados por `docs/frontend/web.md`. Confirmado de nuevo: no existe ningún `useDebounce.ts` en `apps/web/src` a la fecha de esta corrección. Si se necesita (ej. un buscador que dispara una query por tecla), hay que escribirlo. |
| Logging estructurado + tracing distribuido | Parcial (corregido) | El logging estructurado **ya está implementado**: `@mentorapredict/shared-logger` (wrapper de `nestjs-pino`) corre en los 5 servicios backend, con contexto de correlación vía `AsyncLocalStorage` y redacción de secretos — ver [backend/README.md](backend/README.md). El frontend tiene su propio logger estructurado equivalente (`apps/web/src/utils/logger.ts`). Lo que sigue faltando es tracing distribuido real (OpenTelemetry/Jaeger) para seguir un request across servicios más allá del correlation ID compartido. |
