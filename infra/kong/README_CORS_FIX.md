# Kong CORS Fix

## Problema

La página Swagger o las peticiones desde `http://localhost:3001` eran bloqueadas porque la configuración CORS de Kong no estaba permitiendo ese origen.

## Solución aplicada

Se actualizó `infra/kong/kong-template.yml` para incluir las siguientes URLs en el plugin `cors` global de Kong:

- http://localhost
- http://localhost:3000
- http://localhost:3001
- http://localhost:5173
- http://localhost:8000
- http://mentorapredictqa.programacionwebuce.net
- https://mentorapredictqa.programacionwebuce.net

## Efecto

Con esta corrección, los preflight requests (`OPTIONS`) desde Swagger UI en `http://localhost:3001` ya deberían ser aceptados por Kong.

## Nota

Si el problema persiste, revisa que el contenedor de Kong haya sido reiniciado y que el archivo generado `kong.yml` refleje este cambio.