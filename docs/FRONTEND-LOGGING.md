# Web Logging

MentoraPredict Web uses structured browser-console logging to diagnose client errors and correlate HTTP requests with Kong and backend services.

## Implementation

```text
apps/web/src/utils/
├── logger.ts
├── logger.spec.ts
└── register-global-error-handlers.ts
```

`logger.ts` is the only logging abstraction. It exposes `debug`, `info`, `warn`, and `error` and writes structured objects through the matching console method.

```ts
logger.info("Users loaded", { userCount: 20 });
logger.error("User update failed", error, { userId });
```

Every entry includes an ISO timestamp, level, and message. `Error` values are reduced to their name and message; stack traces are included only during development. `debug` output is disabled in production builds.

## Global errors

`main.tsx` calls `registerGlobalErrorHandlers()` before rendering React. It observes:

- `window.error` for uncaught browser errors;
- `window.unhandledrejection` for promises rejected without a handler.

This covers runtime failures outside React error handling. The project does not currently use an Error Boundary or a remote observability provider.

## HTTP logging and correlation IDs

The shared Axios client in `services/api.ts` logs requests, successful responses, and failures. Its request interceptor:

1. attaches the access token when available;
2. preserves an existing `x-correlation-id` or generates one;
3. logs method, URL, and correlation ID.

Response logs add the HTTP status. Error logs prefer the correlation ID returned by the server and fall back to the request value. Tokens, request bodies, and complete headers are not logged.

```text
Browser logger -> x-correlation-id -> Kong -> microservice logs
```

The ID makes one operation searchable across browser Network tools and backend logs. A retried request preserves its header because the original Axios configuration is reused.

## Token refresh behavior

A `401` can start one shared refresh operation. Concurrent failed requests wait for that operation and retry with the new access token. Refresh requests themselves are not recursively refreshed. If renewal fails, the session is cleared.

This behavior is authentication infrastructure; logs must never include either token.

## Rate limiting

Browser messages such as `429 (Too Many Requests)` come from DevTools. The structured `API request failed` object is the corresponding MentoraPredict log.

The admin user table enriches student rows with academic context. This creates additional requests per displayed student. TanStack Query does not retry HTTP responses, including `429`, so it does not amplify rate-limit failures. A backend batch context endpoint would be the long-term way to remove the per-user request pattern.

## Security rules

Never log:

- passwords or reset tokens;
- access or refresh tokens;
- `Authorization` headers;
- complete form or API payloads;
- grades, wellbeing data, email addresses, or other personal data unless strictly required.

Prefer identifiers and aggregate counts:

```ts
logger.info("Course analytics loaded", { courseId, alertCount });
```

Do not log every render or click. Log events that explain what failed, where it failed, and how to trace it.

## Manual verification

1. Run `pnpm --filter @mentorapredict/web dev` in Git Bash.
2. Open browser DevTools and enable Verbose output for `console.debug`.
3. Perform an authenticated request.
4. Match `API request` and `API response` by `correlationId`.
5. Confirm the same `x-correlation-id` in the Network request headers.

Un mensaje rojo similar al siguiente es generado por DevTools, no directamente por el logger:

```text
GET /api/v1/academic/enrollments?studentId=... 429 (Too Many Requests)
```

El código `429` indica que Kong rechazó la solicitud porque el cliente superó el límite configurado para la ruta.

La causa original era que la pantalla administrativa cargaba la lista completa de usuarios y después consultaba el contexto académico de cada estudiante en paralelo, sin límite. Además, React `StrictMode` puede iniciar dos veces ciertos flujos durante el desarrollo.

`getUsers()` (`apps/web/src/services/users/users.service.ts`) ahora soporta paginación, búsqueda y filtro por rol del lado del servidor (`getUsers({ page, limit, search, role })`). `useAdminUsers` (`apps/web/src/features/admin/hooks/useAdminUsers/`) la usa con `USERS_PAGE_SIZE = 10`, así que cada carga trae como máximo 10 usuarios y dispara a lo sumo 10 solicitudes de contexto académico en paralelo, en vez de una por cada usuario del sistema.

Esto acota el pico de tráfico a un valor pequeño y fijo por página, pero sigue existiendo una solicitud académica por estudiante mostrado. Una mejora futura sería implementar un endpoint batch que devuelva el contexto de varios estudiantes en una única llamada.

## Verificación manual como administrador

Iniciar el frontend:

```powershell
pnpm.cmd --filter @mentorapredict/web dev
```

Después:

1. Iniciar sesión como administrador.
2. Abrir DevTools con `F12`.
3. Abrir `Console`.
4. Habilitar `Verbose`, `Info`, `Warnings` y `Errors`.
5. Visitar usuarios, cursos y detalles administrativos.

Es necesario habilitar `Verbose` porque `console.debug`, utilizado por `logger.debug`, normalmente se oculta con el filtro predeterminado de Chrome.

Durante una operación correcta deben aparecer dos objetos:

```text
API request
API response
```

En ellos se debe comprobar:

- `timestamp` válido.
- `level` igual a `debug`.
- Método HTTP correcto.
- URL esperada.
- Estado HTTP en la respuesta.
- Correlation ID presente.

Ante un fallo debe aparecer:

```text
API request failed
```

Chrome también mostrará su propio mensaje rojo de red. Es normal ver ambos mensajes:

- El mensaje `GET ... 429`, `404` o `500` pertenece a DevTools.
- El objeto con `message: "API request failed"` pertenece al logger de MentoraPredict.

### Probar un error global

En la consola del navegador:

```js
window.dispatchEvent(new ErrorEvent("error", {
  error: new Error("Controlled logging test"),
}));

Promise.reject(new Error("Controlled rejection test"));
```

Expected messages are `Unhandled browser error` and `Unhandled promise rejection`.

## Automated verification

```bash
pnpm --filter @mentorapredict/web exec vitest run --project unit src/utils/logger.spec.ts
pnpm --filter @mentorapredict/web build
```

The first command validates serialization and context handling. The second validates integration with the production frontend build.

## Current limits

- Logs remain on the user's device.
- There is no Sentry, OpenTelemetry exporter, retention policy, or sampling policy.
- Request duration is not recorded.
- React render failures do not have a dedicated Error Boundary.

See also [Web Architecture & Endpoint Management](./frontend/web.md).
