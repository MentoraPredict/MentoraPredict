# Servicios de MentoraPredict

## Índice de Servicios

### ✅ Servicios Funcionales

1. **[Auth Service](#auth-service)** - Autenticación y Autorización
2. **[Academic Service](#academic-service)** - Gestión Académica

### 🔧 Servicios en Desarrollo

3. **[Analytics Service](#analytics-service)** - Análisis de Datos
4. **[Prediction Service](#prediction-service)** - Predicción de Riesgo
5. **[Recommendation Service](#recommendation-service)** - Recomendaciones
6. **[User Service](#user-service)** - Gestión de Usuarios
7. **[Metrics Service](#metrics-service)** - Métricas y Observabilidad

---

## ✅ AUTH SERVICE

**Puerto:** 3001  
**Ruta raíz:** `/api/v1/auth`  
**Base de datos:** PostgreSQL (tabla: `users`)  
**Cache:** Redis  
**Estado:** ✅ FUNCIONAL

### Propósito

Servicio centralizador de **autenticación y autorización** del sistema MentoraPredict.

**Responsabilidades:**
- Registrar nuevos usuarios
- Autenticar usuarios existentes
- Generar y refrescar tokens JWT
- Invalidar sesiones (logout)
- Verificar permisos (RBAC)
- Proteger contra ataques de fuerza bruta

### ¿Por qué existe?

1. **Separación de Responsabilidades:** La autenticación es una funcionalidad transversal
2. **Centralización:** Un único punto de autenticación para todos los servicios
3. **Seguridad:** Manejo centralizado de tokens y credenciales
4. **Escalabilidad:** Otros servicios solo verifican tokens sin consultar la DB

### Endpoints

| Método | Ruta | Descripción | Autenticación |
|--------|------|-------------|---------------|
| POST | `/api/v1/auth/register` | Registrar usuario | ❌ Pública |
| POST | `/api/v1/auth/login` | Iniciar sesión | ❌ Pública |
| POST | `/api/v1/auth/refresh` | Refrescar token | ❌ Pública |
| POST | `/api/v1/auth/logout` | Cerrar sesión | ✅ Requerida |
| GET | `/health` | Verificar salud del servicio | ❌ Pública |

### Flujo de Autenticación

```
┌─────────────────────────────────────────────────────┐
│ 1. REGISTRO                                         │
│    POST /api/v1/auth/register                      │
│    { email, password, firstName, lastName }        │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
        ┌──────────────────────────┐
        │ RegisterUserUseCase      │
        ├──────────────────────────┤
        │ ✓ Validar email          │
        │ ✓ Hash contraseña        │
        │ ✓ Verificar no existe    │
        │ ✓ Guardar en DB          │
        └────────────┬─────────────┘
                     │
                     ▼
        { id, email, firstName, lastName, role, createdAt }

┌─────────────────────────────────────────────────────┐
│ 2. LOGIN                                            │
│    POST /api/v1/auth/login                         │
│    { email, password }                             │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
        ┌──────────────────────────────┐
        │ LoginUserUseCase             │
        ├──────────────────────────────┤
        │ ✓ Verificar rate limit       │
        │ ✓ Buscar usuario por email   │
        │ ✓ Validar contraseña         │
        │ ✓ Generar JWT access token   │
        │ ✓ Generar refresh token      │
        │ ✓ Almacenar en Redis         │
        └────────────┬─────────────────┘
                     │
                     ▼
        { accessToken, refreshToken, expiresIn, tokenType }

┌─────────────────────────────────────────────────────┐
│ 3. REFRESH                                          │
│    POST /api/v1/auth/refresh                       │
│    { refreshToken }                                │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
        ┌──────────────────────────────┐
        │ RefreshTokenUseCase          │
        ├──────────────────────────────┤
        │ ✓ Verificar refresh token    │
        │ ✓ Validar en Redis           │
        │ ✓ Generar nuevo access token │
        │ ✓ Actualizar en Redis        │
        └────────────┬─────────────────┘
                     │
                     ▼
        { accessToken, expiresIn }
```

### Tecnología Stack

- **Framework:** NestJS 10.3.0
- **Autenticación:** Passport + JWT
- **Hash:** Bcrypt
- **Base de datos:** PostgreSQL + TypeORM
- **Cache:** Redis (ioredis)
- **Documentación:** Swagger/OpenAPI

### Configuración

Ver [auth-service.md](./services/auth-service.md)

---

## ✅ ACADEMIC SERVICE

**Puerto:** 3003  
**Ruta raíz:** `/api/v1/academic`  
**Base de datos:** PostgreSQL (tablas: subjects, enrollments, evaluations, grades)  
**Estado:** ✅ FUNCIONAL

### Propósito

Servicio de **gestión académica** que centraliza:

- Asignaturas y planes de estudio
- Matriculaciones de estudiantes
- Evaluaciones y rúbricas
- Calificaciones y promedios
- Historial académico

### ¿Por qué existe?

1. **Dominio Especializado:** La lógica académica es compleja y diferente
2. **Escalabilidad:** Puede crecer independientemente de auth-service
3. **Reutilización:** Otros servicios (analytics, prediction) consultan estos datos
4. **Responsabilidad Única:** Solo maneja datos académicos

### Endpoints

| Método | Ruta | Descripción | Autenticación |
|--------|------|-------------|---------------|
| POST | `/api/v1/academic/enrollments` | Matricular estudiante | ✅ Requerida |
| POST | `/api/v1/academic/evaluations` | Crear evaluación | ✅ Requerida |
| POST | `/api/v1/academic/grades` | Registrar calificación | ✅ Requerida |
| GET | `/health` | Verificar salud | ❌ Pública |

### Datos Principales

```typescript
// Asignatura
{
  id: UUID,
  code: string,        // e.g., "PROG-101"
  name: string,        // e.g., "Programación I"
  credits: number,
  isActive: boolean,
  createdAt: Date
}

// Matriculación
{
  id: UUID,
  studentId: UUID,
  subjectId: UUID,
  status: "ACTIVE" | "DROPPED" | "COMPLETED",
  enrolledAt: Date,
  createdAt: Date
}

// Evaluación
{
  id: UUID,
  subjectId: UUID,
  name: string,        // e.g., "Parcial 1"
  weight: number,      // 0-100%
  maxScore: number,
  createdAt: Date
}

// Calificación
{
  id: UUID,
  studentId: UUID,
  evaluationId: UUID,
  value: number,       // 0-10
  recordedBy: UUID,    // Teacher ID
  createdAt: Date
}
```

### Tecnología Stack

- **Framework:** NestJS 11.1.24
- **ORM:** TypeORM 1.0.0
- **Base de datos:** PostgreSQL
- **Documentación:** Swagger/OpenAPI

### Configuración

Ver [academic-service.md](./services/academic-service.md)

---

## 🔧 ANALYTICS SERVICE

**Puerto:** 3004  
**Propósito:** Análisis de datos académicos y estadísticas  
**Estado:** 🔧 EN DESARROLLO

### Planned Features

- Estadísticas por asignatura
- Análisis de rendimiento por cohort
- Gráficos de distribución de calificaciones
- Reportes de progreso académico
- Identificación de patrones de desempeño

### Datos que Consume

- Calificaciones (de academic-service)
- Matriculaciones (de academic-service)
- Información de estudiantes (de user-service)

---

## 🔧 PREDICTION SERVICE

**Puerto:** 3005  
**Propósito:** Predicción de riesgo académico usando ML  
**Lenguaje:** Python  
**Estado:** 🔧 EN DESARROLLO

### Planned Features

- Predicción de probabilidad de reprobación
- Identificación de estudiantes en riesgo
- Recomendaciones preventivas
- Modelos de ML (Logistic Regression, Random Forest, etc)
- Pipeline de datos desde analytics

### Stack Técnico

- Python 3.9+
- FastAPI
- scikit-learn / TensorFlow
- Pandas

---

## 🔧 RECOMMENDATION SERVICE

**Puerto:** 3006  
**Propósito:** Sistema de recomendaciones personalizadas  
**Estado:** 🔧 EN DESARROLLO

### Planned Features

- Recomendaciones de asignaturas
- Sugerencias de cambio de carrera
- Ofertas de tutorías
- Recomendación de grupos de estudio

### Algoritmos

- Content-based filtering
- Collaborative filtering
- Hybrid recommendations

---

## 🔧 USER SERVICE

**Puerto:** 3002  
**Propósito:** Gestión de perfiles de usuario  
**Estado:** 🔧 EN DESARROLLO

### Planned Features

- Perfiles de estudiante
- Historiales académicos
- Información de docentes
- Gestión de roles y permisos

---

## 🔧 METRICS SERVICE

**Puerto:** 3007  
**Propósito:** Métricas y observabilidad del sistema  
**Estado:** 🔧 EN DESARROLLO

### Planned Features

- Métricas de performance
- Dashboards de monitoreo
- Alertas de salud
- Logs centralizados

### Stack Técnico

- Prometheus
- Grafana
- ELK Stack (Elasticsearch, Logstash, Kibana)

---

## Diagrama de Dependencias

```
┌─────────────────────────────────────────────────────────────┐
│                   Cliente (Web/Mobile)                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    HTTP / REST
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
    ┌─────────┐      ┌──────────┐      ┌──────────┐
    │  Auth   │      │ Academic │      │Analytics │
    │Service  │      │ Service  │      │Service   │
    │(3001)   │      │ (3003)   │      │(3004)    │
    └────┬────┘      └────┬─────┘      └─────┬────┘
         │                │                   │
         │         ┌──────┴───────┐           │
         │         │              │           │
         ▼         ▼              ▼           ▼
    ┌─────────────────────────────────────────────────┐
    │         PostgreSQL (Shared Database)            │
    │  - users (auth)                                 │
    │  - subjects, enrollments, grades (academic)     │
    └─────────────────────────────────────────────────┘
    
    ┌─────────────────────────────────────────────────┐
    │            Redis (Shared Cache)                 │
    │  - JWT tokens                                   │
    │  - Rate limiting                                │
    │  - Sessions                                     │
    └─────────────────────────────────────────────────┘
```

---

## Hoja de Ruta

### Sprint 1 (Actual)
- ✅ Auth Service (Completo)
- ✅ Academic Service (Completo)

### Sprint 2
- 🔧 User Service
- 🔧 Analytics Service
- 🔧 API Gateway

### Sprint 3
- 🔧 Prediction Service
- 🔧 Recommendation Service
- 🔧 Event Bus / Message Queue

### Sprint 4
- 🔧 Metrics Service
- 🔧 Distributed Tracing
- 🔧 Monitoring

---

**Última actualización:** 2026-06-07
