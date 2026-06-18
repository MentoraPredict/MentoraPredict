# Auth Service - Documentación Detallada

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Nombre** | Auth Service (Servicio de Autenticación) |
| **Puerto** | 3001 |
| **Estado** | ✅ FUNCIONAL |
| **Base de Datos** | PostgreSQL |
| **Cache** | Redis |
| **Framework** | NestJS 10.3.0 |
| **Versión Node** | 18+ |

---

## 🎯 Propósito

Auth Service es el **servicio centralizado de autenticación y autorización** de MentoraPredict.

### Responsabilidades Principales

1. **Autenticación de Usuarios**
   - Registrar nuevos usuarios
   - Validar credenciales en login
   - Generar tokens JWT

2. **Gestión de Sesiones**
   - Crear y validar tokens de acceso
   - Refrescar tokens expirados
   - Invalidar sesiones (logout)

3. **Protección de Seguridad**
   - Rate limiting contra ataques de fuerza bruta
   - Hash de contraseñas con Bcrypt
   - Verificación de integridad de tokens

4. **Control de Acceso**
   - RBAC (Role-Based Access Control)
   - Protección de endpoints con guards
   - Validación de permisos

---

## 🏗️ Estructura del Proyecto

```
auth-service/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── user.entity.ts          # Entidad de usuario (dominio puro)
│   │   │   └── auth.entity.ts          # Entidad de autenticación
│   │   ├── value-objects/
│   │   │   ├── email.vo.ts             # Value object para email
│   │   │   └── password.vo.ts          # Value object para contraseña
│   │   └── services/                   # (Vacío - no se necesita)
│   │
│   ├── application/
│   │   ├── use-cases/
│   │   │   ├── register-user.use-case.ts       # Caso: Registrar usuario
│   │   │   ├── login-user.use-case.ts         # Caso: Login
│   │   │   ├── logout-user.use-case.ts        # Caso: Logout
│   │   │   ├── refresh-token.use-case.ts      # Caso: Refrescar token
│   │   │   └── reset-password.use-case.ts     # Caso: Reset de contraseña
│   │   │
│   │   ├── dtos/
│   │   │   ├── register.dto.ts         # DTO para registro
│   │   │   ├── login.dto.ts            # DTO para login
│   │   │   ├── refresh.dto.ts          # DTO para refresh
│   │   │   └── reset-password.dto.ts   # DTO para reset
│   │   │
│   │   ├── ports/
│   │   │   ├── input/                  # Puertos de entrada (usecases)
│   │   │   │   └── i-auth.use-cases.ts
│   │   │   └── output/                 # Puertos de salida (interfaces)
│   │   │       ├── i-user.repository.ts
│   │   │       ├── i-password.hasher.ts
│   │   │       ├── i-token.generator.ts
│   │   │       └── i-token.cache.ts
│   │   │
│   │   └── mappers/
│   │       └── user.mapper.ts          # Mapear Entity → DTO
│   │
│   ├── infrastructure/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts      # Endpoints HTTP
│   │   │   └── health.controller.ts    # Health check
│   │   │
│   │   ├── persistence/
│   │   │   ├── user.orm-entity.ts      # ORM Entity (TypeORM)
│   │   │   ├── user.repository.ts      # Implementación del repository
│   │   │   ├── auth.repository.ts      # Métodos de auth
│   │   │   └── migrations/             # Migraciones de BD
│   │   │
│   │   ├── cache/
│   │   │   ├── redis.client.ts         # Cliente Redis
│   │   │   └── redis.adapter.ts        # Implementación de ITokenCache
│   │   │
│   │   ├── config/
│   │   │   ├── jwt.adapter.ts          # Implementación de ITokenGenerator
│   │   │   ├── bcrypt.adapter.ts       # Implementación de IPasswordHasher
│   │   │   └── jwt.strategy.ts         # Estrategia Passport JWT
│   │   │
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts       # Guard para proteger rutas
│   │   │   └── roles.guard.ts          # Guard para validar roles
│   │   │
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts # Filtro de excepciones
│   │   │
│   │   ├── interceptors/
│   │   │   └── correlation.interceptor.ts # Interceptor para trazabilidad
│   │   │
│   │   └── external/
│   │       └── (Integraciones externas)
│   │
│   ├── app.module.ts                   # Módulo principal
│   └── main.ts                         # Punto de entrada
│
├── dist/                               # Código compilado (generado)
├── package.json
├── tsconfig.json
├── jest.config.js
├── .env                                # Variables de entorno
└── README.md
```

---

## 🔄 Flujos Principales

### 1. Registro de Usuario

```
POST /api/v1/auth/register
{
  "email": "victor@uce.edu.ec",
  "password": "SecurePass123!",
  "firstName": "Victor",
  "lastName": "Cañar"
}

┌─────────────────────────────────────────┐
│ AuthController.register(dto)            │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│ ValidationPipe (class-validator)        │
│ ✓ Validar @IsEmail                     │
│ ✓ Validar @MinLength(8)                │
│ ✓ Validar @MaxLength(100)              │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│ RegisterUserUseCase.execute(dto)        │
│                                         │
│ 1. Email.create(dto.email)              │
│    └─ Valida formato de email          │
│    └─ Normaliza (lowercase, trim)      │
│                                         │
│ 2. Password.create(dto.password)        │
│    └─ Valida complejidad               │
│                                         │
│ 3. userRepo.findByEmail(email.value)   │
│    └─ Busca si existe                  │
│    └─ Si existe → ConflictException    │
│                                         │
│ 4. hasher.hash(password.raw)            │
│    └─ Bcrypt con 12 salt rounds        │
│    └─ Retorna hash                     │
│                                         │
│ 5. Crear UserEntity(...)               │
│    ├─ id: UUID                         │
│    ├─ email: normalizó                 │
│    ├─ passwordHash: hashed              │
│    ├─ role: STUDENT                    │
│    ├─ isActive: true                   │
│    └─ timestamps                       │
│                                         │
│ 6. userRepo.save(entity)                │
│    └─ INSERT en PostgreSQL             │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│ Retornar UserDTO                        │
│ {                                       │
│   "id": "550e8400-...",                │
│   "email": "victor@uce.edu.ec",        │
│   "firstName": "Victor",               │
│   "lastName": "Cañar",                 │
│   "role": "STUDENT",                   │
│   "createdAt": "2026-06-07T..."        │
│ }                                       │
└─────────────────────────────────────────┘
```

### 2. Login

```
POST /api/v1/auth/login
{
  "email": "victor@uce.edu.ec",
  "password": "SecurePass123!"
}

┌─────────────────────────────────────────┐
│ LoginUserUseCase.execute(dto, clientIP) │
│                                         │
│ 1. cache.incrementLoginAttempts(ip)    │
│    └─ Si > 10 → ForbiddenException    │
│    └─ Rate limiting contra brute force │
│                                         │
│ 2. userRepo.findByEmail(email)         │
│    └─ Si no existe → UnauthorizedException
│                                         │
│ 3. Verificar user.isActive             │
│    └─ Si desactivado → UnauthorizedException
│                                         │
│ 4. hasher.compare(password, hash)      │
│    └─ Bcrypt.compare()                 │
│    └─ Si no coincide → UnauthorizedException
│                                         │
│ 5. cache.deleteLoginAttempts(ip)       │
│    └─ Limpiar contador después del éxito
│                                         │
│ 6. tokenGen.generatePair(...)          │
│    ├─ Access Token (JWT, 15 min)       │
│    │  Payload: { sub, email, role }   │
│    │  Algorithm: RS256                 │
│    │  Issuer: 'mentorapredict'         │
│    └─ Refresh Token (JWT, 7 días)      │
│       Payload: { sub, type: 'refresh' }
│                                         │
│ 7. cache.setRefreshToken(...)          │
│    └─ Guardar en Redis (TTL 7 días)    │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│ Retornar                                │
│ {                                       │
│   "accessToken": "<access-token-example>",         │
│   "refreshToken": "<refresh-token-example>",        │
│   "expiresIn": 900,  // segundos       │
│   "tokenType": "Bearer"                │
│ }                                       │
└─────────────────────────────────────────┘
```

### 3. Refresh Token

```
POST /api/v1/auth/refresh
{
  "refreshToken": "<refresh-token-example>"
}

┌──────────────────────────────────────────┐
│ RefreshTokenUseCase.execute(dto)         │
│                                          │
│ 1. tokenGen.verifyRefresh(token)        │
│    └─ Verificar firma JWT               │
│    └─ Extraer payload { sub, type }     │
│                                          │
│ 2. cache.getRefreshToken(userId)        │
│    └─ Buscar en Redis                   │
│    └─ Si no existe o no coincide        │
│       → UnauthorizedException           │
│                                          │
│ 3. userRepo.findById(userId)            │
│    └─ Verificar usuario existe          │
│    └─ Verificar isActive                │
│                                          │
│ 4. tokenGen.generatePair(...)           │
│    └─ Generar nuevo access token        │
│    └─ Generar nuevo refresh token       │
│                                          │
│ 5. cache.setRefreshToken(...)           │
│    └─ Actualizar en Redis               │
└──────────────────┬───────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────┐
│ Retornar                                 │
│ {                                        │
│   "accessToken": "<access-token-example>",          │
│   "expiresIn": 900                      │
│ }                                        │
└──────────────────────────────────────────┘
```

---

## 🔐 Seguridad

### Autenticación: JWT RS256

```typescript
// Asymmetric (Recomendado para Producción)
// Clave privada: Solo en auth-service para firmar
// Clave pública: En otros servicios para verificar

// HS256 (Desarrollo)
// Secret compartido: Solo para desarrollo local
```

### Protección de Contraseñas

```typescript
// Algoritmo: Bcrypt
// Salt Rounds: 12
// Nunca guardar en texto plano
// Siempre comparar con bcrypt.compare()
```

### Rate Limiting

```typescript
// Protege contra ataques de fuerza bruta
// Limita 10 intentos de login por IP
// TTL: 15 minutos
// Se resetea después de login exitoso
```

### CORS

```typescript
// Configurado en .env
CORS_ORIGINS=http://localhost:3000
```

---

## 📦 DTOs

### RegisterDto

```typescript
{
  firstName: string;       // @IsString() @MaxLength(100)
  lastName: string;        // @IsString() @MaxLength(100)
  email: string;           // @IsEmail()
  password: string;        // @IsString() @MinLength(8) @MaxLength(64)
}
```

### LoginDto

```typescript
{
  email: string;           // @IsEmail()
  password: string;        // @IsString()
}
```

### RefreshDto

```typescript
{
  refreshToken: string;    // Token JWT
}
```

---

## 🗂️ Base de Datos

### Tabla: users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'STUDENT',  -- STUDENT, TEACHER, ADMIN
  is_active BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 Instalación y Ejecución

### Requisitos Previos

```bash
# Node.js 18+
node --version

# npm 9+
npm --version

# PostgreSQL 16 (local o Docker)
# Redis 7 (local o Docker)
```

### Instalación

```bash
cd services/auth-service

# Instalar dependencias
npm install
```

### Configuración (.env)

```bash
# Copiar template
cp .env.example .env

# Configurar variables
NODE_ENV=development
APP_PORT=3001

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=mp_user
POSTGRES_PASSWORD=mp_pass
POSTGRES_DB=mentorapredict

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

JWT_SECRET=dev-secret-change-in-prod-min-32-chars
# Para producción:
# JWT_PRIVATE_KEY=...
# JWT_PUBLIC_KEY=...

CORS_ORIGINS=http://localhost:3000
```

### Ejecutar en Desarrollo

```bash
# Compilar y ejecutar en modo watch
npm run dev

# El servicio estará en http://localhost:3001
# Swagger docs: http://localhost:3001/api/docs
```

### Compilación para Producción

```bash
# Build
npm run build

# Ejecutar
npm start
```

---

## 📊 Health Check

```bash
GET /health

Respuesta:
{
  "status": "UP",
  "services": {
    "database": "UP",
    "redis": "UP"
  }
}
```

---

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Coverage
npm run test:cov
```

---

## 📚 Swagger/OpenAPI

Documentación interactiva disponible en:
```
http://localhost:3001/api/docs
```

---

## 🔗 Integración con Otros Servicios

### Verificar Token en Otro Servicio

```typescript
// En otro servicio
@Injectable()
export class VerifyTokenService {
  async verify(token: string): Promise<TokenPayload> {
    // Usar clave pública de auth-service
    const payload = this.jwtService.verify(token, {
      publicKey: process.env.JWT_PUBLIC_KEY
    });
    return payload;
  }
}
```

---

## 🐛 Troubleshooting

### Error: "Invalid credentials"
- Verificar email/password correctos
- Verificar usuario está activo (isActive=true)

### Error: "Too many login attempts"
- Esperar 15 minutos
- Reset o contactar administrador

### Error: "Invalid refresh token"
- Token expirado (7 días)
- Token ya usado
- Hacer login de nuevo

### Error: "CORS origin not allowed"
- Verificar CORS_ORIGINS en .env
- Incluir protocolo (http://, https://)

---

## 📞 Contacto y Soporte

Para problemas o preguntas:
1. Consultar [TROUBLESHOOTING.md](../TROUBLESHOOTING.md)
2. Revisar logs del servicio
3. Abrir issue en el repositorio

---

**Última actualización:** 2026-06-07
**Versión:** 1.0.0
**Estado:** ✅ Producción Ready
