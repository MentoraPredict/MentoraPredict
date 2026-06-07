# Estructura del Proyecto

## 📁 Árbol Completo

```
mentorapredict/
│
├── 📂 docs/                                    # 📚 Documentación completa
│   ├── README.md                              # Índice de documentación
│   ├── ARCHITECTURE.md                        # Diseño del sistema
│   ├── SERVICES.md                            # Descripción de servicios
│   ├── SETUP.md                               # Instalación y configuración
│   ├── DEVELOPMENT.md                         # Guía de desarrollo
│   ├── PROJECT_STRUCTURE.md                   # Este archivo
│   ├── CODE_STANDARDS.md                      # Estándares de código
│   ├── API.md                                 # Referencia de APIs
│   ├── TESTING.md                             # Estrategia de testing
│   ├── DEPLOYMENT.md                          # Deployment
│   ├── TROUBLESHOOTING.md                     # Solución de problemas
│   ├── SECURITY.md                            # Seguridad
│   ├── CONTRACTS.md                           # Contratos compartidos
│   └── services/                              # Docs específicos de servicios
│       ├── auth-service.md
│       └── academic-service.md
│
├── 📂 services/                               # 🎯 Microservicios
│   │
│   ├── auth-service/                          # ✅ Autenticación
│   │   ├── src/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── user.entity.ts         # Entidad: Usuario
│   │   │   │   │   └── auth.entity.ts         # Entidad: Autenticación
│   │   │   │   ├── value-objects/
│   │   │   │   │   ├── email.vo.ts            # VO: Email validado
│   │   │   │   │   └── password.vo.ts         # VO: Contraseña validada
│   │   │   │   └── services/                  # Vacío (sin lógica compleja)
│   │   │   │
│   │   │   ├── application/
│   │   │   │   ├── use-cases/
│   │   │   │   │   ├── register-user.use-case.ts      # UC: Registrar
│   │   │   │   │   ├── login-user.use-case.ts         # UC: Login
│   │   │   │   │   ├── logout-user.use-case.ts        # UC: Logout
│   │   │   │   │   ├── refresh-token.use-case.ts      # UC: Refresh
│   │   │   │   │   └── reset-password.use-case.ts     # UC: Reset PWD
│   │   │   │   ├── dtos/
│   │   │   │   │   ├── register.dto.ts
│   │   │   │   │   ├── login.dto.ts
│   │   │   │   │   ├── refresh.dto.ts
│   │   │   │   │   └── index.ts                 # Exportar todo
│   │   │   │   ├── ports/
│   │   │   │   │   ├── input/
│   │   │   │   │   │   └── i-auth.use-cases.ts  # Puertos de entrada
│   │   │   │   │   └── output/
│   │   │   │   │       ├── i-user.repository.ts      # Puerto: Acceso a datos
│   │   │   │   │       ├── i-password.hasher.ts      # Puerto: Hash
│   │   │   │   │       ├── i-token.generator.ts      # Puerto: JWT
│   │   │   │   │       └── i-token.cache.ts          # Puerto: Cache
│   │   │   │   └── mappers/
│   │   │   │       └── user.mapper.ts              # Mapeo Entity→DTO
│   │   │   │
│   │   │   ├── infrastructure/
│   │   │   │   ├── controllers/
│   │   │   │   │   ├── auth.controller.ts         # Endpoints POST /auth
│   │   │   │   │   └── health.controller.ts       # Endpoint GET /health
│   │   │   │   ├── persistence/
│   │   │   │   │   ├── user.orm-entity.ts         # TypeORM Entity
│   │   │   │   │   ├── user.repository.ts         # Implementación repo
│   │   │   │   │   ├── auth.repository.ts         # Métodos específicos
│   │   │   │   │   └── migrations/                # Migraciones BD
│   │   │   │   ├── cache/
│   │   │   │   │   ├── redis.client.ts            # Cliente Redis
│   │   │   │   │   └── redis.adapter.ts           # Implementación ITokenCache
│   │   │   │   ├── config/
│   │   │   │   │   ├── jwt.adapter.ts             # Implementación JWT
│   │   │   │   │   ├── bcrypt.adapter.ts          # Implementación Hash
│   │   │   │   │   └── jwt.strategy.ts            # Estrategia Passport
│   │   │   │   ├── guards/
│   │   │   │   │   ├── jwt-auth.guard.ts          # Guard: JWT
│   │   │   │   │   └── roles.guard.ts             # Guard: Roles
│   │   │   │   ├── filters/
│   │   │   │   │   └── http-exception.filter.ts   # Filtro excepciones
│   │   │   │   ├── interceptors/
│   │   │   │   │   └── correlation.interceptor.ts # Interceptor: Tracing
│   │   │   │   └── external/
│   │   │   │       └── (Integraciones externas)
│   │   │   │
│   │   │   ├── app.module.ts                       # Módulo principal
│   │   │   ├── main.ts                             # Punto de entrada
│   │   │   └── shared-types-local.ts               # Types locales
│   │   │
│   │   ├── dist/                                   # Output compilado
│   │   ├── node_modules/                          # Dependencias (git ignored)
│   │   ├── package.json                           # Dependencias npm
│   │   ├── tsconfig.json                          # Config TypeScript
│   │   ├── jest.config.js                         # Config Jest
│   │   ├── nest-cli.json                          # Config NestJS CLI
│   │   ├── .env                                    # Variables (git ignored)
│   │   ├── .env.example                           # Template variables
│   │   └── README.md                              # README específico
│   │
│   ├── academic-service/                          # ✅ Gestión académica
│   │   ├── src/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── academic.entity.ts
│   │   │   │   │   ├── subject.entity.ts          # Entidad: Asignatura
│   │   │   │   │   ├── enrollment.entity.ts       # Entidad: Matriculación
│   │   │   │   │   ├── evaluation.entity.ts       # Entidad: Evaluación
│   │   │   │   │   ├── grade.entity.ts            # Entidad: Calificación
│   │   │   │   │   ├── career.entity.ts
│   │   │   │   │   ├── faculty.entity.ts
│   │   │   │   │   └── academic-period.entity.ts
│   │   │   │   ├── value-objects/                 # Vacío
│   │   │   │   └── services/                      # Vacío
│   │   │   │
│   │   │   ├── application/
│   │   │   │   ├── use-cases/
│   │   │   │   │   ├── enroll-student.use-case.ts       # UC: Matricular
│   │   │   │   │   ├── record-grade.use-case.ts         # UC: Registrar calif
│   │   │   │   │   ├── create-evaluation.use-case.ts    # UC: Crear eval
│   │   │   │   │   ├── assign-teacher.use-case.ts
│   │   │   │   │   ├── ingest-academic-data.use-case.ts
│   │   │   │   │   └── register-grade.use-case.ts
│   │   │   │   ├── dtos/
│   │   │   │   │   ├── enroll-student.dto.ts
│   │   │   │   │   ├── record-grade.dto.ts
│   │   │   │   │   └── create-evaluation.dto.ts
│   │   │   │   ├── ports/
│   │   │   │   │   ├── input/
│   │   │   │   │   └── output/
│   │   │   │   │       ├── i-subject.repository.ts
│   │   │   │   │       ├── i-enrollment.repository.ts
│   │   │   │   │       ├── i-evaluation.repository.ts
│   │   │   │   │       └── i-grade.repository.ts
│   │   │   │   └── mappers/
│   │   │   │       └── academic.mapper.ts
│   │   │   │
│   │   │   ├── infrastructure/
│   │   │   │   ├── controllers/
│   │   │   │   │   ├── academic.controller.ts     # Endpoints
│   │   │   │   │   └── health.controller.ts
│   │   │   │   ├── persistence/
│   │   │   │   │   ├── subject.orm-entity.ts
│   │   │   │   │   ├── subject.repository.ts
│   │   │   │   │   ├── enrollment.orm-entity.ts
│   │   │   │   │   ├── enrollment.repository.ts
│   │   │   │   │   ├── evaluation.orm-entity.ts
│   │   │   │   │   ├── evaluation.repository.ts
│   │   │   │   │   ├── grade.orm-entity.ts
│   │   │   │   │   ├── grade.repository.ts
│   │   │   │   │   ├── academic.repository.ts
│   │   │   │   │   └── migrations/
│   │   │   │   └── (otros)
│   │   │   │
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   │
│   │   ├── dist/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── jest.config.js
│   │   ├── .env
│   │   ├── .env.example
│   │   └── README.md
│   │
│   ├── analytics-service/                         # 🔧 En desarrollo
│   │   ├── src/
│   │   ├── package.json
│   │   └── ...
│   │
│   ├── prediction-service/                        # 🔧 En desarrollo
│   │   ├── src/
│   │   ├── requirements.txt                       # Python
│   │   └── ...
│   │
│   ├── recommendation-service/                    # 🔧 En desarrollo
│   │   ├── src/
│   │   ├── package.json
│   │   └── ...
│   │
│   ├── user-service/                              # 🔧 En desarrollo
│   │   ├── src/
│   │   ├── package.json
│   │   └── ...
│   │
│   └── metrics-service/                           # 🔧 En desarrollo
│       ├── src/
│       ├── package.json
│       └── ...
│
├── 📂 packages/                                   # 📦 Paquetes compartidos
│   │
│   ├── shared-config/                            # Configuración compartida
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── env-validation/
│   │   │   │   └── common-env.schema.ts           # Validación env
│   │   │   └── interfaces/
│   │   │       ├── app-config.interface.ts
│   │   │       ├── database-config.interface.ts
│   │   │       ├── jwt-config.interface.ts
│   │   │       └── service-urls.interface.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── shared-types/                             # Types y DTOs comunes
│   │   ├── src/
│   │   │   ├── index.ts                          # Exportar todo
│   │   │   ├── constants/
│   │   │   │   ├── api.constants.ts              # URLs de APIs
│   │   │   │   └── redis-keys.constants.ts       # Claves Redis
│   │   │   ├── dtos/
│   │   │   │   ├── base-entity.dto.ts
│   │   │   │   └── pagination-query.dto.ts
│   │   │   ├── enums/
│   │   │   │   ├── enrollment-status.enum.ts
│   │   │   │   ├── ingestion-format.enum.ts
│   │   │   │   ├── risk-level.enum.ts
│   │   │   │   ├── role.enum.ts
│   │   │   │   ├── service-status.enum.ts
│   │   │   │   └── trend.enum.ts
│   │   │   ├── interfaces/
│   │   │   │   ├── api-response.interface.ts
│   │   │   │   ├── error-response.interface.ts
│   │   │   │   └── ...
│   │   │   └── schemas/
│   │   │       └── (Validación compartida)
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── shared-utils/                             # Utilidades reutilizables
│       ├── src/
│       │   ├── index.ts
│       │   ├── anonymization/                    # Anonimización de datos
│       │   ├── correlation/                      # ID de correlación
│       │   ├── date/                             # Utilidades de fecha
│       │   ├── pagination/                       # Paginación
│       │   └── response/                         # Formatos de respuesta
│       ├── package.json
│       └── tsconfig.json
│
├── 📂 contracts/                                  # 📋 Contratos OpenAPI
│   └── openapi-contracts.yaml                    # Definición de APIs
│
├── 📂 data-models/                                # 📊 Modelos de datos
│   └── data-models.yaml                          # Esquema compartido
│
├── 📂 infra/                                      # 🔧 Configuración infra
│   └── docker-compose.yml                        # Producción
│
├── 📂 sprint-plan/                                # 📅 Planificación
│   └── sprint-plan-and-checklist.yaml            # Plan del sprint
│
├── docker-compose.dev.yml                        # Docker Compose (dev)
├── package.json                                  # Root package
├── turbo.json                                    # Config Turbo (monorepo)
├── tsconfig.json                                 # TS config root
├── tsconfig.base.json                            # TS config base
├── .gitignore                                    # Archivos ignorados
├── .eslintrc.json                                # ESLint config
├── prettier.config.js                            # Prettier config
├── jest.config.js                                # Jest config root
├── README.md                                     # README principal
└── LICENSE                                       # Licencia del proyecto
```

---

## 📊 Capas por Servicio

### Auth Service

```
┌─────────────────────────────────────────┐
│ Infrastructure Layer                    │
│  Controllers → Filters → Interceptors   │
│  Persistence → Config → Cache           │
└────────────────────┬────────────────────┘
                     │
┌────────────────────▼────────────────────┐
│ Application Layer                       │
│  UseCase[Register, Login, etc]          │
│  DTOs → Ports → Mappers                 │
└────────────────────┬────────────────────┘
                     │
┌────────────────────▼────────────────────┐
│ Domain Layer                            │
│  UserEntity                             │
│  ValueObjects: Email, Password          │
│  Interfaces: IUserRepository, etc       │
└─────────────────────────────────────────┘
```

### Academic Service

```
┌─────────────────────────────────────────┐
│ Infrastructure Layer                    │
│  Controllers → Health Check             │
│  Persistence → Repositories             │
└────────────────────┬────────────────────┘
                     │
┌────────────────────▼────────────────────┐
│ Application Layer                       │
│  UseCase[Enroll, Grade, Eval]           │
│  DTOs → Ports                           │
└────────────────────┬────────────────────┘
                     │
┌────────────────────▼────────────────────┐
│ Domain Layer                            │
│  Entities: Subject, Enrollment, etc     │
│  Interfaces: ISubjectRepo, etc          │
└─────────────────────────────────────────┘
```

---

## 🔄 Flujo de Datos

```
Cliente HTTP
    ↓
Controller (HTTP Endpoint)
    ↓
DTO Validator (class-validator)
    ↓
UseCase (Lógica de flujo)
    ↓
Domain Entity (Lógica de negocio)
    ↓
Repository (Acceso a datos)
    ↓
ORM Entity ← → PostgreSQL DB
    ↓
Response Mapper (Entity → DTO)
    ↓
HTTP Response
```

---

## 🔐 Separación de Responsabilidades

| Capa | Responsabilidad | Ejemplo |
|------|-----------------|---------|
| **Domain** | Lógica de negocio pura | Email.create() valida formato |
| **Application** | Orquestación | RegisterUserUseCase coordina |
| **Infrastructure** | Detalles técnicos | BcryptAdapter implementa hash |

---

## 📦 Distribución de Archivos

```
Líneas de código aproximadas:

auth-service/
├── src/
│   ├── domain/          ~150 LOC (Entities, ValueObjects)
│   ├── application/     ~400 LOC (UseCases, DTOs, Ports)
│   └── infrastructure/  ~600 LOC (Controllers, Repos, Adapters)
└── Total: ~1,150 LOC

academic-service/
├── src/
│   ├── domain/          ~300 LOC (Entities)
│   ├── application/     ~400 LOC (UseCases, DTOs)
│   └── infrastructure/  ~800 LOC (Controllers, Repos)
└── Total: ~1,500 LOC

Proyecto Total: ~2,650 LOC (sin tests)
```

---

**Última actualización:** 2026-06-07
