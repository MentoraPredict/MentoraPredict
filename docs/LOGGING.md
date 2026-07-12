# Logging estructurado — Guía práctica

Los 5 microservicios emiten logs JSON estructurados por stdout usando `@mentorapredict/shared-logger` (wrapper de `nestjs-pino`). Cada línea de log trae `service`, `correlationId` y, para requests HTTP, método/ruta/status/tiempo de respuesta. El mismo `correlationId` aparece en el header de respuesta `x-correlation-id` y se propaga a las llamadas salientes entre microservicios.

## Servicios y puertos

| Servicio | Puerto | Contenedor (dev) |
|---|---|---|
| auth-service | 3001 | `mp_dev_auth_service` |
| user-service | 3002 | `mp_dev_user_service` |
| academic-service | 3003 | `mp_dev_academic_service` |
| analytics-service | 3004 | `mp_dev_analytics_service` |
| prediction-service | 3006 | `mp_dev_prediction_service` |

## 1. Levantar el stack local

Comandos en **PowerShell** (shell por defecto en Windows). Si usás Git Bash/WSL, `\` funciona igual que abajo pero con `cp` en vez de `Copy-Item`.

```powershell
Copy-Item infra\.env.example infra\.env
docker compose -p mentorapredict -f infra/docker/docker-compose.dev.yml --env-file infra/.env up -d --build postgres redis auth-service user-service academic-service analytics-service prediction-service
```

Esperá a que todos estén `healthy`:
```powershell
docker ps --format "table {{.Names}}\t{{.Status}}"
```

## 2. Ver los logs de un servicio

```powershell
docker logs -f mp_dev_academic_service
```
Cada línea es un JSON. Con `jq` (si lo tenés instalado) se puede filtrar/formatear:
```powershell
docker logs -f mp_dev_academic_service | jq .
```

## 3. Ejemplo: request con correlation id propio

> ⚠️ En PowerShell, `curl` es un alias de `Invoke-WebRequest` (flags distintos) y `\` **no** continúa línea (eso es de bash). Usá `curl.exe` explícito y todo en una sola línea para evitar sorpresas:

```powershell
curl.exe -i http://localhost:3003/api/v1/academic/faculties -H "x-correlation-id: mi-prueba-001"
```

Si necesitás multilínea en PowerShell, la continuación es con backtick, no con `\`:
```powershell
curl.exe -i http://localhost:3003/api/v1/academic/faculties `
  -H "x-correlation-id: mi-prueba-001"
```

Respuesta (nota el header):
```
HTTP/1.1 401 Unauthorized
x-correlation-id: mi-prueba-001
Content-Type: application/json; charset=utf-8

{"message":"Missing authorization token","error":"Unauthorized","statusCode":401}
```

Log correspondiente (`docker logs mp_dev_academic_service | grep mi-prueba-001`):
```json
{
  "level": 40,
  "time": "...",
  "req": {
    "id": "mi-prueba-001",
    "method": "GET",
    "url": "/api/v1/academic/faculties",
    "headers": { "x-correlation-id": "mi-prueba-001", "...": "..." }
  },
  "service": "academic-service",
  "correlationId": "mi-prueba-001",
  "res": { "statusCode": 401, "headers": { "x-correlation-id": "mi-prueba-001" } },
  "responseTime": 21,
  "msg": "request completed"
}
```

El `correlationId` coincide en: el header de la request entrante, el header de la respuesta, y el campo `correlationId` del log — incluso en respuestas de error (401, 500, etc.), porque el header se setea en `genReqId` de `pino-http`, que corre antes que cualquier guard.

Si no mandás `x-correlation-id`, se genera uno automáticamente (UUID) y el mismo comportamiento aplica.

## 4. Cross-service: verificar que el id viaja entre microservicios

Con todos los servicios arriba, disparar una acción que cruce servicios (ej. algo en `academic-service` que llame a `user-service` o `analytics-service`) con un id propio, y comparar en ambos logs:

```powershell
docker logs mp_dev_academic_service | jq 'select(.correlationId=="cruce-001")'
docker logs mp_dev_user_service | jq 'select(.correlationId=="cruce-001")'
```

Si aparece con el mismo valor en los dos, la propagación entre servicios funciona (vía `correlationContext`, `AsyncLocalStorage` de `shared-logger`).

## 5. Verificar que no se loguean secretos

`shared-logger` redacta `authorization`, `password`, `newPassword`, `refreshToken`, `accessToken`, `cookie`, `set-cookie` (ver `packages/shared-logger/src/redact-paths.ts`). Probar con un login fallido:

```powershell
curl.exe -i http://localhost:3001/api/v1/auth/login -H "Content-Type: application/json" -d '{\"email\":\"test@test.com\",\"password\":\"hunter2\"}'

docker logs mp_dev_auth_service | Select-String -Pattern "authorization|password"
```
(En PowerShell, las comillas dobles dentro de `-d` necesitan escaparse con `\"` como arriba; si preferís evitarlo, usá comillas simples afuera con JSON en comillas dobles escapadas, o probá desde Git Bash donde `'...'` funciona igual que en Linux.)
No debería aparecer ningún valor en texto plano — o el campo no aparece en absoluto, o sale como `"[Redacted]"`.

## 6. Sin Docker (un solo servicio)

```powershell
cd services/auth-service
pnpm dev
```
Con `NODE_ENV=development` los logs salen "pretty" (legibles); con `NODE_ENV=production` salen JSON puro (el formato real de producción/Docker).

## Referencia rápida de comandos `jq`

```powershell
# Solo requests HTTP completadas
docker logs mp_dev_academic_service | jq 'select(.msg=="request completed")'

# Solo errores (5xx) o warnings (4xx)
docker logs mp_dev_academic_service | jq 'select(.res.statusCode >= 400)'

# Filtrar por un correlationId específico
docker logs mp_dev_academic_service | jq 'select(.correlationId=="mi-prueba-001")'

# Seguir en vivo con formato legible
docker logs -f mp_dev_academic_service | jq .
```

Si no tenés `jq` instalado en Windows: `winget install jqlang.jq`, o usá `Select-String` de PowerShell para filtros simples por texto.

## Notas sobre producción

- El mecanismo (header seteado en `genReqId`, propagación vía `correlationContext`) es JavaScript/NestJS puro — se comporta igual en producción que en local, no depende de Docker.
- Kong (API Gateway) ya tiene su propio plugin `correlation-id` (`infra/kong/kong-template.yml`), que genera/propaga `X-Correlation-ID` antes de que la request llegue a los servicios — en producción el id de origen suele venir de Kong, no de nuestro `genReqId` fallback.
- **Gap conocido, no relacionado con este trabajo**: ni `cd-main.yml` ni `cd-qa.yml` setean `NODE_ENV=production` al generar el `.env` de despliegue; `docker-compose.prod.yml` cae al default `development` si no se define. Esto no rompe el logging (pino cae a JSON igual si `pino-pretty` no está disponible), pero sí afecta otro comportamiento no relacionado (`synchronize` de TypeORM queda activo). Ver conversación/ADRs para más contexto antes de asumir que está resuelto.
