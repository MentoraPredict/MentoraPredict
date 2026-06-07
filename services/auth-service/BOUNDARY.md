# auth-service — Service Boundary

Responsabilidad única (SRP):
- Gestionar autenticación y autorización: registro (si aplica), inicio de sesión, emisión y validación de JWT (RS256), refresh tokens y cierre de sesión.

Inputs (recibe):
- Credenciales de usuarios (`POST /api/v1/auth/login`).
- Refresh tokens para renovación (`POST /api/v1/auth/refresh`).
- Token de autorización en cabeceras para endpoints protegidos.

Outputs (expone):
- `accessToken` (JWT RS256) y `refreshToken` en `AuthResponse`.
- Información del usuario autenticado (`GET /api/v1/auth/me`).
- Eventos de login/logout (pub/sub o HTTP hacia `analytics-service`, opcional).

Datos que gestiona (ownership):
- No posee `users` master data (propiedad primaria en `user-service`).
- Mantiene store de `refresh_tokens` (por seguridad) — puede ser Redis o tabla propia `auth_refresh_tokens` si se decide.

Dependencias con otros servicios:
- `user-service` — para validar identidad y obtener roles/estado.
- `analytics-service` — para enviar eventos de autenticación (opcional).

Reglas operativas:
- Validar `x-correlation-id` y `x-request-id` en todas las entradas.
- Emitir `accessToken` con `iss`, `aud`, `exp`, `kid` header.
- No exponer contraseñas ni hashes en APIs.

API surface (resumen):
- `POST /api/v1/auth/login` (public)
- `POST /api/v1/auth/refresh` (public)
- `POST /api/v1/auth/logout` (protected)
- `GET /api/v1/auth/me` (protected)

Persistencia recomendada (MVP):
- Redis para `refresh_tokens` y sesiones de corto plazo.
- Dependencia de `user-service` para datos persistentes del usuario.

Notas de seguridad:
- Uso de JWT RS256 con clave privada en `auth-service` (almacenada en secreto seguro).
- Proveer endpoint para recuperación de `jwks` o usar archivo público `JWT_PUBLIC_KEY_PATH`.
