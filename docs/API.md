# Referencia de API

## 📡 Endpoints Disponibles

## Auth Service (Puerto 3001)

### 1. Registrar Nuevo Usuario

**Endpoint:**
```
POST /api/v1/auth/register
```

**Descripción:** Crear una nueva cuenta de usuario

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "victor@uce.edu.ec",
  "password": "SecurePass123!",
  "firstName": "Victor",
  "lastName": "Pérez"
}
```

**Response 201 (Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "victor@uce.edu.ec",
  "firstName": "Victor",
  "lastName": "Pérez",
  "role": "STUDENT",
  "isActive": true,
  "createdAt": "2026-06-07T10:30:00Z"
}
```

**Response 400 (Bad Request):**
```json
{
  "statusCode": 400,
  "message": "Password must contain uppercase, lowercase, number and special character",
  "error": "BadRequestException"
}
```

**Response 409 (Conflict):**
```json
{
  "statusCode": 409,
  "message": "Email already registered",
  "error": "ConflictException"
}
```

**cURL:**
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "victor@uce.edu.ec",
    "password": "SecurePass123!",
    "firstName": "Victor",
    "lastName": "Pérez"
  }'
```

---

### 2. Login de Usuario

**Endpoint:**
```
POST /api/v1/auth/login
```

**Descripción:** Autenticar usuario y obtener tokens

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "victor@uce.edu.ec",
  "password": "SecurePass123!"
}
```

**Response 200 (OK):**
```json
{
  "accessToken": "<access-token-example>",
  "refreshToken": "<refresh-token-example>",
  "expiresIn": 900,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "victor@uce.edu.ec",
    "firstName": "Victor",
    "lastName": "Pérez",
    "role": "STUDENT"
  }
}
```

**Response 401 (Unauthorized):**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "UnauthorizedException"
}
```

**Response 403 (Forbidden) - Rate Limited:**
```json
{
  "statusCode": 403,
  "message": "Too many login attempts. Try again in 15 minutes.",
  "error": "ForbiddenException"
}
```

**cURL:**
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "victor@uce.edu.ec",
    "password": "SecurePass123!"
  }'
```

---

### 3. Refresh Token

**Endpoint:**
```
POST /api/v1/auth/refresh
```

**Descripción:** Obtener nuevo access token usando refresh token

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "refreshToken": "<refresh-token-example>"
}
```

**Response 200 (OK):**
```json
{
  "accessToken": "<access-token-example>",
  "refreshToken": "<refresh-token-example>",
  "expiresIn": 900
}
```

**Response 401 (Unauthorized):**
```json
{
  "statusCode": 401,
  "message": "Invalid or expired refresh token",
  "error": "UnauthorizedException"
}
```

---

### 4. Logout

**Endpoint:**
```
POST /api/v1/auth/logout
```

**Descripción:** Invalidar token de sesión

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "refreshToken": "<refresh-token-example>"
}
```

**Response 200 (OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

### 5. Obtener Perfil

**Endpoint:**
```
GET /api/v1/auth/profile
```

**Descripción:** Obtener datos del usuario autenticado

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response 200 (OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "victor@uce.edu.ec",
  "firstName": "Victor",
  "lastName": "Pérez",
  "role": "STUDENT",
  "isActive": true,
  "createdAt": "2026-06-07T10:30:00Z"
}
```

**Response 401 (Unauthorized):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "UnauthorizedException"
}
```

**cURL:**
```bash
curl -X GET http://localhost:3001/api/v1/auth/profile \
  -H "Authorization: Bearer <access_token>"
```

---

## Academic Service (Puerto 3003)

### 1. Matricular Estudiante

**Endpoint:**
```
POST /api/v1/academic/enrollments
```

**Descripción:** Matricular estudiante en una asignatura

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "studentId": "550e8400-e29b-41d4-a716-446655440000",
  "subjectId": "660e8400-e29b-41d4-a716-446655440111"
}
```

**Response 201 (Created):**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440222",
  "studentId": "550e8400-e29b-41d4-a716-446655440000",
  "subjectId": "660e8400-e29b-41d4-a716-446655440111",
  "status": "ACTIVE",
  "enrollmentDate": "2026-06-07T10:30:00Z"
}
```

**Response 409 (Conflict):**
```json
{
  "statusCode": 409,
  "message": "Student already enrolled in this subject",
  "error": "ConflictException"
}
```

**cURL:**
```bash
curl -X POST http://localhost:3003/api/v1/academic/enrollments \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "550e8400-e29b-41d4-a716-446655440000",
    "subjectId": "660e8400-e29b-41d4-a716-446655440111"
  }'
```

---

### 2. Registrar Calificación

**Endpoint:**
```
POST /api/v1/academic/grades
```

**Descripción:** Registrar calificación de estudiante en evaluación

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "studentId": "550e8400-e29b-41d4-a716-446655440000",
  "evaluationId": "880e8400-e29b-41d4-a716-446655440333",
  "value": 8.5
}
```

**Response 201 (Created):**
```json
{
  "id": "990e8400-e29b-41d4-a716-446655440444",
  "studentId": "550e8400-e29b-41d4-a716-446655440000",
  "evaluationId": "880e8400-e29b-41d4-a716-446655440333",
  "value": 8.5,
  "recordedAt": "2026-06-07T10:35:00Z"
}
```

**Response 400 (Bad Request):**
```json
{
  "statusCode": 400,
  "message": "Grade value must be between 0 and 10",
  "error": "BadRequestException"
}
```

**Response 409 (Conflict):**
```json
{
  "statusCode": 409,
  "message": "Grade already recorded for this evaluation",
  "error": "ConflictException"
}
```

---

### 3. Crear Evaluación

**Endpoint:**
```
POST /api/v1/academic/evaluations
```

**Descripción:** Crear evaluación para una asignatura

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "subjectId": "660e8400-e29b-41d4-a716-446655440111",
  "name": "Parcial 1",
  "description": "Primer examen parcial",
  "weight": 25,
  "dueDate": "2026-06-15T18:00:00Z"
}
```

**Response 201 (Created):**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440333",
  "subjectId": "660e8400-e29b-41d4-a716-446655440111",
  "name": "Parcial 1",
  "description": "Primer examen parcial",
  "weight": 25,
  "dueDate": "2026-06-15T18:00:00Z",
  "createdAt": "2026-06-07T10:40:00Z"
}
```

**Response 400 (Bad Request):**
```json
{
  "statusCode": 400,
  "message": "Total evaluation weight cannot exceed 100%",
  "error": "BadRequestException"
}
```

---

## Health Checks

### Auth Service Health

**Endpoint:**
```
GET /health
```

**Response 200 (OK):**
```json
{
  "status": "UP",
  "services": {
    "database": "UP",
    "redis": "UP"
  }
}
```

**cURL:**
```bash
curl http://localhost:3001/health
```

### Academic Service Health

**Endpoint:**
```
GET /health
```

**Response 200 (OK):**
```json
{
  "status": "UP",
  "services": {
    "database": "UP"
  }
}
```

**cURL:**
```bash
curl http://localhost:3003/health
```

---

## Códigos de Respuesta HTTP

| Código | Significado |
|--------|------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Token inválido/expirado |
| 403 | Forbidden - Acceso denegado (rate limit, etc) |
| 404 | Not Found - Recurso no existe |
| 409 | Conflict - Duplicado o estado inválido |
| 500 | Internal Server Error - Error del servidor |

---

## Autenticación

### JWT Token Structure

**Access Token (RS256 - 15 minutos):**
```text
<header>.<payload>.<signature>
```

**Headers en Requests:**
```bash
Authorization: Bearer <access_token>
```

---

## Ejemplos con JavaScript/Fetch

### Registro y Login

```javascript
// 1. Registrar
const register = async () => {
  const response = await fetch('http://localhost:3001/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'victor@uce.edu.ec',
      password: 'SecurePass123!',
      firstName: 'Victor',
      lastName: 'Pérez'
    })
  });
  return response.json();
};

// 2. Login
const login = async () => {
  const response = await fetch('http://localhost:3001/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'victor@uce.edu.ec',
      password: 'SecurePass123!'
    })
  });
  const data = await response.json();
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  return data;
};

// 3. Usar token en request
const getProfile = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('http://localhost:3001/api/v1/auth/profile', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// 4. Matricular
const enroll = async (studentId, subjectId) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('http://localhost:3003/api/v1/academic/enrollments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ studentId, subjectId })
  });
  return response.json();
};
```

---

## Swagger UI

Acceder a documentación interactiva:
- Auth Service: http://localhost:3001/api/docs
- Academic Service: http://localhost:3003/api/docs

Puedes probar endpoints directamente desde el navegador.

---

**Última actualización:** 2026-06-07
