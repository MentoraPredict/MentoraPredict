# Contratos Compartidos

## 📋 Definición de Contratos

Los contratos compartidos definen los acuerdos entre servicios:
- DTOs (Transferencia de datos)
- Enums (Valores constantes)
- Interfaces (Tipos compartidos)
- Constantes (URLs, claves, etc)

---

## 🔄 DTOs Compartidos

### BaseEntityDto

**Archivo:** `packages/shared-types/src/dtos/base-entity.dto.ts`

```typescript
export abstract class BaseEntityDto {
  id!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
```

**Utilizado por:** Todos los servicios

---

### PaginationQueryDto

**Archivo:** `packages/shared-types/src/dtos/pagination-query.dto.ts`

```typescript
import { IsOptional, IsInt, Min } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  sortBy?: string;

  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}
```

**Respuesta Paginada:**
```typescript
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
```

**Ejemplo:**
```json
{
  "data": [
    { "id": "...", "email": "..." },
    { "id": "...", "email": "..." }
  ],
  "total": 150,
  "page": 1,
  "limit": 10,
  "pages": 15
}
```

---

## 📊 Enums Compartidos

### UserRole

**Archivo:** `packages/shared-types/src/enums/role.enum.ts`

```typescript
export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  GUEST = 'GUEST',
}
```

**Uso en Auth Service:**
```typescript
// Registro
const user = new UserEntity(
  id,
  email,
  passwordHash,
  firstName,
  lastName,
  UserRole.STUDENT,  // ← Role por defecto
  true,
  createdAt,
  updatedAt
);

// RBAC
if (user.role === UserRole.ADMIN) {
  // Acciones de admin
}
```

### EnrollmentStatus

**Archivo:** `packages/shared-types/src/enums/enrollment-status.enum.ts`

```typescript
export enum EnrollmentStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  COMPLETED = 'COMPLETED',
  DROPPED = 'DROPPED',
}
```

**Uso en Academic Service:**
```typescript
const enrollment = new EnrollmentEntity(
  id,
  studentId,
  subjectId,
  EnrollmentStatus.ACTIVE,  // ← Status inicial
  enrollmentDate
);
```

### RiskLevel

**Archivo:** `packages/shared-types/src/enums/risk-level.enum.ts`

```typescript
export enum RiskLevel {
  LOW = 'LOW',           // GPA ≥ 3.5
  MEDIUM = 'MEDIUM',     // GPA 2.5 - 3.5
  HIGH = 'HIGH',         // GPA < 2.5
  CRITICAL = 'CRITICAL', // GPA < 1.0 o faltas
}
```

**Usado por:** Analytics Service, Prediction Service

### Trend

**Archivo:** `packages/shared-types/src/enums/trend.enum.ts`

```typescript
export enum Trend {
  IMPROVING = 'IMPROVING',    // Calificación subiendo
  STABLE = 'STABLE',          // Calificación estable
  DECLINING = 'DECLINING',    // Calificación bajando
}
```

### IngestionFormat

**Archivo:** `packages/shared-types/src/enums/ingestion-format.enum.ts`

```typescript
export enum IngestionFormat {
  CSV = 'CSV',
  EXCEL = 'EXCEL',
  JSON = 'JSON',
  XML = 'XML',
}
```

**Usado para:** Cargar datos masivos en Sprint 2+

### ServiceStatus

**Archivo:** `packages/shared-types/src/enums/service-status.enum.ts`

```typescript
export enum ServiceStatus {
  UP = 'UP',
  DOWN = 'DOWN',
  DEGRADED = 'DEGRADED',
  MAINTENANCE = 'MAINTENANCE',
}
```

---

## 🔗 Interfaces Compartidas

### ApiResponse

**Archivo:** `packages/shared-types/src/interfaces/api-response.interface.ts`

```typescript
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
  correlationId: string;
}
```

**Ejemplo:**
```json
{
  "statusCode": 200,
  "message": "User retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "victor@uce.edu.ec"
  },
  "timestamp": "2026-06-07T10:30:00Z",
  "path": "/api/v1/auth/profile",
  "correlationId": "5f3b4f3a-2c1d-4e8a-9b3c-1a2b3c4d5e6f"
}
```

### ErrorResponse

**Archivo:** `packages/shared-types/src/interfaces/error-response.interface.ts`

```typescript
export interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
  correlationId: string;
  validationErrors?: Record<string, string[]>;
}
```

**Ejemplo (Validation Error):**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "BadRequestException",
  "timestamp": "2026-06-07T10:30:00Z",
  "path": "/api/v1/auth/register",
  "correlationId": "5f3b4f3a-2c1d-4e8a-9b3c-1a2b3c4d5e6f",
  "validationErrors": {
    "password": [
      "Password must contain uppercase",
      "Password must contain special character"
    ],
    "email": [
      "Email format is invalid"
    ]
  }
}
```

---

## 🔐 Constantes Compartidas

### API URLs

**Archivo:** `packages/shared-types/src/constants/api.constants.ts`

```typescript
export const API_ROUTES = {
  AUTH: {
    REGISTER: '/api/v1/auth/register',
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH: '/api/v1/auth/refresh',
    PROFILE: '/api/v1/auth/profile',
  },
  ACADEMIC: {
    ENROLLMENTS: '/api/v1/academic/enrollments',
    GRADES: '/api/v1/academic/grades',
    EVALUATIONS: '/api/v1/academic/evaluations',
    SUBJECTS: '/api/v1/academic/subjects',
  },
  ANALYTICS: {
    PERFORMANCE: '/api/v1/analytics/performance',
    TRENDS: '/api/v1/analytics/trends',
    RISKS: '/api/v1/analytics/risks',
  },
};

export const SERVICE_URLS = {
  AUTH_SERVICE: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  ACADEMIC_SERVICE: process.env.ACADEMIC_SERVICE_URL || 'http://localhost:3003',
  ANALYTICS_SERVICE: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3004',
  USER_SERVICE: process.env.USER_SERVICE_URL || 'http://localhost:3002',
};

export const CORS_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map(origin => origin.trim());

export const JWT_EXPIRY = {
  ACCESS_TOKEN: '15m',
  REFRESH_TOKEN: '7d',
};

export const RATE_LIMITING = {
  MAX_LOGIN_ATTEMPTS: 10,
  RATE_LIMIT_TTL: '15m',
};
```

### Redis Keys

**Archivo:** `packages/shared-types/src/constants/redis-keys.constants.ts`

```typescript
export const REDIS_KEYS = {
  // Rate Limiting
  RATE_LIMIT_LOGIN: 'RATE_LIMIT:LOGIN:{{IP}}',
  
  // Tokens
  REFRESH_TOKEN: 'REFRESH_TOKEN:{{USER_ID}}',
  BLACKLIST_TOKEN: 'BLACKLIST:{{TOKEN_ID}}',
  
  // Cache
  USER: 'USER:{{USER_ID}}',
  SUBJECT: 'SUBJECT:{{SUBJECT_ID}}',
  ENROLLMENT: 'ENROLLMENT:{{ENROLLMENT_ID}}',
  GRADE: 'GRADE:{{GRADE_ID}}',
  
  // Sessions
  SESSION: 'SESSION:{{SESSION_ID}}',
};

// Helper
export const getRedisKey = (template: string, params: Record<string, string>): string => {
  let key = template;
  Object.entries(params).forEach(([placeholder, value]) => {
    key = key.replace(`{{${placeholder}}}`, value);
  });
  return key;
};

// Ejemplo de uso
const userKey = getRedisKey(REDIS_KEYS.USER, { USER_ID: '123' });
// Result: 'USER:123'
```

---

## 📡 DTOs de Servicios

### Auth Service DTOs

**RegisterDto:**
```typescript
export class RegisterDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(8) password!: string;
  @IsString() @MinLength(2) firstName!: string;
  @IsString() @MinLength(2) lastName!: string;
}
```

**LoginDto:**
```typescript
export class LoginDto {
  @IsEmail() email!: string;
  @IsString() password!: string;
}
```

**RefreshDto:**
```typescript
export class RefreshDto {
  @IsJWT() refreshToken!: string;
}
```

**AuthResponseDto:**
```typescript
export class AuthResponseDto extends BaseEntityDto {
  email!: string;
  firstName!: string;
  lastName!: string;
  role!: UserRole;
  isActive!: boolean;
}
```

### Academic Service DTOs

**EnrollStudentDto:**
```typescript
export class EnrollStudentDto {
  @IsUUID() studentId!: string;
  @IsUUID() subjectId!: string;
}
```

**RecordGradeDto:**
```typescript
export class RecordGradeDto {
  @IsUUID() studentId!: string;
  @IsUUID() evaluationId!: string;
  @IsNumber() @Min(0) @Max(10) value!: number;
}
```

**CreateEvaluationDto:**
```typescript
export class CreateEvaluationDto {
  @IsUUID() subjectId!: string;
  @IsString() @MinLength(3) name!: string;
  @IsString() description?: string;
  @IsNumber() @Min(0) @Max(100) weight!: number;
  @IsDateString() dueDate!: string;
}
```

---

## 🔄 Integración entre Servicios

### Auth Service → Academic Service

**Validación de Tokens:**
```typescript
// Academic Service recibe token de Auth Service
// Verifica con public key de Auth Service

const publicKey = fs.readFileSync('auth-service-public-key.pem');
const decoded = jwt.verify(token, publicKey, {
  algorithms: ['RS256']
});

const userId = decoded.sub;
const userRole = decoded.role;
```

### Service-to-Service Calls

**En Sprint 2:**
```typescript
// Academic Service llama a Auth Service
const userResponse = await fetch(
  `${SERVICE_URLS.AUTH_SERVICE}/api/v1/users/${userId}`,
  {
    headers: {
      'Authorization': `Bearer ${internalToken}`
    }
  }
);
```

---

## 📦 Exportación de Tipos

**Archivo:** `packages/shared-types/src/index.ts`

```typescript
// Enums
export * from './enums/role.enum';
export * from './enums/enrollment-status.enum';
export * from './enums/risk-level.enum';
export * from './enums/trend.enum';
export * from './enums/ingestion-format.enum';
export * from './enums/service-status.enum';

// DTOs
export * from './dtos/base-entity.dto';
export * from './dtos/pagination-query.dto';

// Interfaces
export * from './interfaces/api-response.interface';
export * from './interfaces/error-response.interface';

// Constants
export * from './constants/api.constants';
export * from './constants/redis-keys.constants';
```

---

## ✅ Uso en Servicios

### Importar desde shared-types

**En Auth Service:**
```typescript
import { UserRole, RegisterDto, AuthResponseDto } from '@mentorapredict/shared-types';

export class RegisterUserUseCase {
  // UserRole disponible
}
```

**En Academic Service:**
```typescript
import { EnrollmentStatus, EnrollStudentDto } from '@mentorapredict/shared-types';

export class EnrollStudentUseCase {
  // EnrollmentStatus disponible
}
```

---

## 📋 OpenAPI Contracts

**Archivo:** `contracts/openapi-contracts.yaml`

```yaml
openapi: 3.0.0
info:
  title: MentoraPredict API
  version: 1.0.0
paths:
  /api/v1/auth/register:
    post:
      summary: Register new user
      tags: [Auth]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RegisterDto'
      responses:
        201:
          description: User created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponseDto'
        400:
          $ref: '#/components/responses/BadRequest'
        409:
          $ref: '#/components/responses/Conflict'
```

---

## 🚀 Evolución de Contratos

**Sprint 1:** Contratos básicos (Auth, Academic)
**Sprint 2:** Agregar User Service, Analytics Service
**Sprint 3:** Agregar Prediction Service con recomendaciones generadas
**Sprint 4+:** Event Stream, Message Queue

---

**Última actualización:** 2026-06-07
