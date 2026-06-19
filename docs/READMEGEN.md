# MentoraPredict - Plataforma de Predicción y Recomendación Académica

[![Status](https://img.shields.io/badge/status-active-success)]()
[![Node Version](https://img.shields.io/badge/node-18%2B-green)]()
[![NestJS](https://img.shields.io/badge/nestjs-10%2B-red)](https://nestjs.com)
[![License](https://img.shields.io/badge/license-MIT-blue)]()

## 📋 Descripción

**MentoraPredict** es una plataforma integral de **predicción y recomendación académica** que utiliza análisis de datos históricos para:

✅ Predecir riesgo académico de estudiantes  
✅ Proporcionar recomendaciones personalizadas  
✅ Identificar patrones de desempeño  
✅ Apoyar la toma de decisiones educativas  

Construida con **microservicios**, **arquitectura limpia** y **buenas prácticas de software**.

---

## 🚀 Inicio Rápido

### Requisitos Previos

- **Node.js** 18+
- **npm** 9+
- **Docker** y **Docker Compose**
- **PostgreSQL** 16
- **Redis** 7

### Instalación (5 minutos)

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd mentorapredict

# 2. Instalar dependencias en todos los servicios
npm install

# 3. Iniciar servicios de infraestructura
docker-compose -f docker-compose.dev.yml up -d

# 4. Compilar servicios
npm run build

# 5. Iniciar servicios
npm run dev
```

### Verificar Servicios

```bash
# Auth Service
curl http://localhost:3001/health

# Academic Service
curl http://localhost:3003/health

# Swagger Documentation
# Auth: http://localhost:3001/api/docs
# Academic: http://localhost:3003/api/docs
```

---

## 📦 Servicios Disponibles

### ✅ Servicios Funcionales (Sprint 1)

| Servicio | Puerto | Descripción | Estado |
|----------|--------|-------------|--------|
| **Auth Service** | 3001 | Autenticación JWT RS256 y RBAC | ✅ FUNCIONAL |
| **Academic Service** | 3003 | Gestión de asignaturas, matriculaciones y calificaciones | ✅ FUNCIONAL |

### 🔧 Servicios en Desarrollo (Sprint 2+)

| Servicio | Puerto | Descripción | Estado |
|----------|--------|-------------|--------|
| User Service | 3002 | Gestión de perfiles y roles | 🔧 Planeado |
| Analytics Service | 3004 | Análisis de datos académicos | 🔧 Planeado |
| Prediction Service | 3005 | ML para predicción de riesgo | 🔧 Planeado |
| Recommendation Service | 3006 | Sistema de recomendaciones | 🔧 Planeado |
| Metrics Service | 3007 | Monitoreo y observabilidad | 🔧 Planeado |

---

## 🏗️ Estructura del Proyecto

```
mentorapredict/
├── docs/                          # 📚 Documentación completa
│   ├── README.md                  # Índice de documentación
│   ├── ARCHITECTURE.md            # Diseño del sistema
│   ├── SERVICES.md                # Descripción de servicios
│   ├── services/
│   │   ├── auth-service.md
│   │   └── academic-service.md
│   └── ...
│
├── services/                      # 🎯 Microservicios
│   ├── auth-service/
│   │   ├── src/
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   └── infrastructure/
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── academic-service/
│   │   ├── src/
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── analytics-service/
│   ├── prediction-service/
│   ├── recommendation-service/
│   ├── user-service/
│   └── metrics-service/
│
├── packages/                      # 📦 Paquetes compartidos
│   ├── shared-config/             # Configuración centralizada
│   ├── shared-types/              # Types y DTOs compartidos
│   └── shared-utils/              # Utilidades reutilizables
│
├── contracts/                     # 📋 Contratos OpenAPI
│   └── openapi-contracts.yaml
│
├── infra/                         # 🔧 Infraestructura
│   └── docker-compose.yml
│
├── sprint-plan/                   # 📅 Planificación
│   └── sprint-plan-and-checklist.yaml
│
├── docker-compose.dev.yml         # Docker Compose (desarrollo)
├── package.json                   # Root package
├── turbo.json                     # Configuración de build
└── README.md                      # Este archivo
```

---

## 🔐 Seguridad

### Autenticación

- **JWT RS256** (Asymmetric) - Recomendado para producción
- **HS256** - Para desarrollo
- Clave privada solo en auth-service

### Autorización

- **RBAC** (Role-Based Access Control)
- Roles: STUDENT, TEACHER, ADMIN

### Protección de Datos

- Contraseñas con **Bcrypt** (12 salt rounds)
- **Rate limiting** contra ataques de fuerza bruta
- **CORS** configurable

---

## 📚 Documentación

Documentación completa disponible en la carpeta `docs/`:

### 📖 Documentación Completa

#### Para Principiantes
- **[docs/README.md](./docs/README.md)** - Índice de documentación (punto de entrada)
- **[docs/SETUP.md](./docs/SETUP.md)** - Instalación paso a paso
- **[docs/SERVICES.md](./docs/SERVICES.md)** - Descripción general de servicios

#### Arquitectura
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Arquitectura del sistema (DDD, Clean Arch)
- **[docs/PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md)** - Estructura completa del proyecto

#### Servicios Específicos
- **[docs/services/auth-service.md](./docs/services/auth-service.md)** - Auth Service (autenticación, JWT, RBAC)
- **[docs/services/academic-service.md](./docs/services/academic-service.md)** - Academic Service (asignaturas, calificaciones)

#### Desarrollo
- **[docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)** - Guía para crear nuevas funcionalidades
- **[docs/CODE_STANDARDS.md](./docs/CODE_STANDARDS.md)** - Convenciones de código y estándares
- **[docs/API.md](./docs/API.md)** - Referencia completa de APIs con ejemplos

#### Producción
- **[docs/SECURITY.md](./docs/SECURITY.md)** - Medidas de seguridad implementadas
- **[docs/CONTRACTS.md](./docs/CONTRACTS.md)** - DTOs, enums y contratos compartidos
- **[docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)** - Solución de problemas comunes

---

## 🛠️ Scripts Disponibles

### Root Level

```bash
# Instalar dependencias en todos los servicios
npm install

# Build de todos los servicios
npm run build

# Iniciar todos los servicios en modo desarrollo
npm run dev

# Ejecutar tests
npm test

# Linting
npm run lint
```

### Por Servicio

```bash
cd services/auth-service

# Desarrollo (watch mode)
npm run dev

# Build
npm run build

# Producción
npm start

# Tests
npm test
```

---

## 🐳 Docker

### Iniciar Infraestructura

```bash
# Iniciar PostgreSQL y Redis
docker-compose -f docker-compose.dev.yml up -d

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f

# Detener
docker-compose -f docker-compose.dev.yml down
```

### Base de Datos

```bash
# Acceder a PostgreSQL
docker exec -it mentorapredict_postgres psql -U mp_user -d mentorapredict

# Ver tablas
\dt

# Salir
\q
```

### Redis

```bash
# Acceder a Redis CLI
docker exec -it mentorapredict_redis redis-cli

# Listar claves
KEYS *

# Salir
exit
```

---

## 📋 Ejemplos de Uso

### 1. Registrar Usuario (Auth Service)

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "victor@uce.edu.ec",
    "password": "SecurePass123!",
    "firstName": "Victor",
    "lastName": "Cañar"
  }'

# Respuesta:
{
  "id": "550e8400-...",
  "email": "victor@uce.edu.ec",
  "firstName": "Victor",
  "lastName": "Cañar",
  "role": "STUDENT",
  "createdAt": "2026-06-07T..."
}
```

### 2. Login (Auth Service)

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "victor@uce.edu.ec",
    "password": "SecurePass123!"
  }'

# Respuesta:
{
  "accessToken": "<access-token-example>",
  "refreshToken": "<refresh-token-example>",
  "expiresIn": 900,
  "tokenType": "Bearer"
}
```

### 3. Matricular Estudiante (Academic Service)

```bash
curl -X POST http://localhost:3003/api/v1/academic/enrollments \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "550e8400-...",
    "subjectId": "660e8400-..."
  }'

# Respuesta:
{
  "id": "770e8400-...",
  "studentId": "550e8400-...",
  "subjectId": "660e8400-...",
  "status": "ACTIVE",
  "enrolledAt": "2026-06-07T..."
}
```

---

## 🔗 APIs y Documentación Interactiva

### Swagger UI

- **Auth Service:** http://localhost:3001/api/docs
- **Academic Service:** http://localhost:3003/api/docs

### OpenAPI Contracts

Ver archivo [contracts/openapi-contracts.yaml](./contracts/openapi-contracts.yaml)

---

## 🧪 Testing

```bash
# Ejecutar tests unitarios
npm test

# Coverage
npm run test:cov

# Watch mode
npm test -- --watch
```

---

## 🚀 Deployment

### Desarrollo

```bash
npm run dev
```

### Producción

```bash
npm run build
npm start
```

Ver [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) para instrucciones detalladas.

---

## 🐛 Troubleshooting

### Problema: "Cannot find module"

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Problema: Puerto ya en uso

```bash
# Cambiar puerto en .env
APP_PORT=3001

# O liberar puerto
lsof -i :3001
kill -9 <PID>
```

### Problema: Conexión a BD rechazada

```bash
# Verificar Docker está corriendo
docker ps

# Verificar variables .env
cat .env

# Reiniciar Docker
docker-compose down
docker-compose up -d
```

Ver [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) para más ayuda.

---

## 👥 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver [LICENSE](./LICENSE) para detalles.

---

## 📞 Contacto

**Desarrollado por:** Victor Cañar  
**Institución:** Universidad Central del Ecuador  
**Curso:** Programación Web (Séptimo Semestre)  
**Proyecto:** MentoraPredict Sprint 1

---

## 🔗 Enlaces Útiles

- [Documentación Completa](./docs/README.md)
- [Arquitectura del Sistema](./docs/ARCHITECTURE.md)
- [Guía de Desarrollo](./docs/DEVELOPMENT.md)
- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Passport.js](https://www.passportjs.org)

---

## 📅 Historial de Cambios

### Sprint 1 (Actual)
- ✅ Auth Service - Autenticación con JWT
- ✅ Academic Service - Gestión académica
- ✅ Documentación completa
- ✅ Docker Compose setup

### Sprint 2 (Próximo)
- 🔧 User Service
- 🔧 Analytics Service
- 🔧 API Gateway
- 🔧 JWT en Academic Service

### Sprint 3+
- 🔧 Prediction Service (ML)
- 🔧 Recommendation Service
- 🔧 Event Bus / Message Queue
- 🔧 Metrics y Monitoring

---

**Última actualización:** 2026-06-07  
**Versión:** 1.0.0  
**Estado:** ✅ Producción Ready (Sprint 1)
