# Logging en el frontend

## Objetivo

El frontend de MentoraPredict cuenta con un sistema centralizado de logging para observar el comportamiento de la aplicación, diagnosticar errores del navegador y relacionar solicitudes del cliente con Kong y los microservicios.

La implementación está ubicada en `apps/web`, construido con React, Vite, TypeScript y Axios.

Los logs permiten:

- Conocer cuándo comienza y termina una solicitud HTTP.
- Identificar el método, la ruta y el código de estado de una solicitud.
- Capturar errores de Axios, del navegador y de promesas no controladas.
- Relacionar una operación del frontend con el backend mediante `x-correlation-id`.
- Investigar errores sin exponer tokens ni cuerpos completos de las solicitudes.

## Arquitectura

### Logger centralizado

El archivo `apps/web/src/utils/logger.ts` es el único punto encargado de escribir logs.

Expone cuatro niveles:

| Nivel   | Uso                                               |
| ------- | ------------------------------------------------- |
| `debug` | Detalles técnicos útiles durante el desarrollo.   |
| `info`  | Eventos normales e importantes de la aplicación.  |
| `warn`  | Situaciones inesperadas que no impiden continuar. |
| `error` | Fallos que deben investigarse.                    |

Ejemplo de uso:

```ts
import { logger } from "@/utils/logger";

logger.info("Users loaded", { userCount: 20 });

try {
  await saveUser();
} catch (error) {
  logger.error("User update failed", error, { userId });
}
```

Cada entrada tiene una estructura común:

```ts
{
  timestamp: "2026-07-11T20:00:00.000Z",
  level: "error",
  message: "API request failed",
  method: "GET",
  url: "/v1/academic/enrollments",
  status: 429,
  correlationId: "550e8400-e29b-41d4-a716-446655440000"
}
```

Los logs `debug` solo se escriben cuando Vite está en modo de desarrollo. Los niveles `info`, `warn` y `error` también están disponibles en una compilación de producción.

Cuando el valor recibido es un objeto `Error`, el logger conserva su nombre y mensaje. El stack trace se incluye únicamente en desarrollo.

### Captura de errores globales

El archivo `apps/web/src/utils/register-global-error-handlers.ts` registra dos manejadores:

- `window.error`: errores del navegador o excepciones no controladas.
- `window.unhandledrejection`: promesas rechazadas sin un `catch` apropiado.

`apps/web/src/main.tsx` inicializa estos manejadores antes de renderizar React:

```ts
registerGlobalErrorHandlers();
```

Esta organización es compatible con Atomic Design. Atomic Design clasifica componentes visuales; el logger y los manejadores globales son infraestructura transversal. Por eso la lógica se mantiene fuera de átomos, moléculas, organismos, templates y páginas.

### Integración con Axios

Los interceptores de `apps/web/src/services/api.ts` registran automáticamente las solicitudes realizadas con la instancia compartida de Axios.

Antes de enviar una solicitud:

1. Se recupera el access token.
2. Se agrega el header `Authorization`, cuando existe una sesión.
3. Se genera un `x-correlation-id` con `crypto.randomUUID()`.
4. Se escribe un log `API request`.

El logger no guarda el token ni el conjunto completo de headers.

Cuando llega una respuesta correcta, se escribe `API response` con:

- Método HTTP.
- URL.
- Estado HTTP.
- Correlation ID devuelto por el servidor o enviado por el cliente.

Cuando la solicitud falla, se escribe `API request failed` con los mismos datos y el error serializado.

Si un access token expiró, Axios intenta renovarlo y repite la solicitud. El mismo correlation ID se conserva durante el reintento para representar una sola operación lógica.

## Correlation ID

`x-correlation-id` es un identificador único que permite seguir una operación a través de:

```text
Navegador -> Axios -> Kong -> Microservicio
```

Para comprobarlo:

1. Abrir DevTools con `F12`.
2. Entrar en `Console` y localizar un objeto `API request`.
3. Copiar su propiedad `correlationId`.
4. Abrir `Network` y seleccionar la solicitud correspondiente.
5. Revisar `Request Headers` y `Response Headers`.
6. Comprobar el valor de `x-correlation-id`.

El mismo valor puede buscarse posteriormente en los logs de infraestructura y backend.

## Seguridad y privacidad

Nunca se deben registrar:

- Contraseñas.
- Access tokens o refresh tokens.
- El header `Authorization`.
- Cuerpos completos de formularios.
- Notas académicas o información emocional.
- Correos u otros datos personales si no son indispensables.

Ejemplo incorrecto:

```ts
logger.info("Login", { email, password, accessToken });
```

Ejemplo correcto:

```ts
logger.info("Login completed", { role: user.role });
```

## Error 429 en la administración

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
window.dispatchEvent(
  new ErrorEvent("error", {
    error: new Error("Prueba controlada del logger"),
  }),
);
```

Debe aparecer un log con:

```text
message: "Unhandled browser error"
```

Para probar una promesa no controlada:

```js
Promise.reject(new Error("Prueba de promesa rechazada"));
```

Debe aparecer:

```text
message: "Unhandled promise rejection"
```

## Pruebas automatizadas

`apps/web/src/utils/logger.spec.ts` verifica que:

- Un log `info` tenga una estructura consistente.
- Un error conserve su nombre y mensaje.
- El contexto adicional se incorpore en la entrada.

Ejecutar las pruebas unitarias:

```powershell
pnpm.cmd --filter @mentorapredict/web exec vitest run --project unit
```

La configuración del proyecto unitario se encuentra en `apps/web/vite.config.ts` y no reemplaza las pruebas de Storybook.

Para verificar TypeScript y la compilación de producción:

```powershell
pnpm.cmd --filter @mentorapredict/web build
```

## Uso recomendado en código nuevo

Registrar eventos que ayuden a responder preguntas concretas: qué operación falló, dónde falló y con qué identificador puede rastrearse.

```ts
logger.debug("Loading course analytics", { courseId });

try {
  const analytics = await loadCourseAnalytics(courseId);
  logger.info("Course analytics loaded", { courseId });
  return analytics;
} catch (error) {
  logger.error("Course analytics failed", error, { courseId });
  throw error;
}
```

No es necesario registrar cada clic, cada render ni objetos completos. Un exceso de logs dificulta encontrar los eventos importantes y puede exponer información innecesaria.

## Alcance actual y siguientes pasos

Actualmente los logs se escriben en la consola del navegador. Esto resulta útil para desarrollo y diagnóstico local, pero no envía automáticamente errores ocurridos en los dispositivos de los usuarios.

Posibles mejoras futuras:

- Integrar una plataforma de observabilidad como Sentry u OpenTelemetry.
- Incorporar un `ErrorBoundary` para errores durante el renderizado de React.
- Agregar medición de duración de solicitudes.
- Definir políticas de muestreo y retención para producción.
- Crear un endpoint batch para el contexto académico de estudiantes.
