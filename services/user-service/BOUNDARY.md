# user-service — Service Boundary

Responsabilidad única (SRP):
- Gestionar perfiles de usuario, roles y relaciones usuario-rol. Proveer CRUD de usuarios y endpoints de consulta para otros servicios.

Inputs:
- Creación/actualización de usuarios (`POST /api/v1/users`, `PATCH /api/v1/users/{id}`).
- Consultas desde API Gateway y otros servicios.

Outputs:
- DTOs de usuario (`UserDto`) y listas paginadas.
- Eventos de cambio de rol/usuario (opcional) hacia `analytics-service` o `metrics-service`.

Datos que gestiona (ownership):
- `users`, `roles`, `user_roles` (PostgreSQL).

Dependencias:
- `auth-service` para validación de tokens y flujo de login.
- `academic-service` puede consultar usuarios para asignaciones (solo lectura mediante API).

Persistencia recomendada:
- PostgreSQL (schema `user_service`) con tablas `users`, `roles`, `user_roles`.

API surface:
- `POST /api/v1/users` (ADMIN)
- `GET /api/v1/users` (ADMIN, TEACHER)
- `GET /api/v1/users/{userId}` (ADMIN, TEACHER, SELF)
- `GET /api/v1/users/me` (AUTHENTICATED)
- `PATCH /api/v1/users/{userId}` (ADMIN or SELF limited)
- `GET /api/v1/users/{userId}/roles` (ADMIN)

Reglas operativas:
- Validar cabeceras `x-correlation-id` y `x-request-id`.
- No exponer `password_hash` en respuestas.
- Roles gestionados por `ADMIN`.
