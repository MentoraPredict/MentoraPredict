# MentoraPredict - Documentación

Bienvenido a la documentación del proyecto **MentoraPredict**, una plataforma de predicción y recomendación académica basada en datos históricos de estudiantes.

## 📋 Índice de Documentación

### Inicio Rápido
- **[README Principal](../README.md)** - Guía general del proyecto
- **[Guía de Configuración](./SETUP.md)** - Instalación y configuración inicial

### Arquitectura y Diseño
- **[Arquitectura General](./ARCHITECTURE.md)** - Diseño del sistema, patrones y decisiones
- **[Servicios Disponibles](./SERVICES.md)** - Lista completa de microservicios
- **[Estructura de Carpetas](./PROJECT_STRUCTURE.md)** - Organización del código

### Servicios (Microservicios)
- **[Auth Service](./services/auth-service.md)** ✅ Autenticación y autorización (FUNCIONAL)
- **[Academic Service](./services/academic-service.md)** ✅ Gestión académica (FUNCIONAL)
- **[Analytics Service](./services/analytics-service.md)** - Análisis de datos académicos
- **[Prediction Service](./services/prediction-service.md)** - Predicción de riesgo académico
- **[Recommendation Service](./services/recommendation-service.md)** - Recomendaciones personalizadas
- **[User Service](./services/user-service.md)** - Gestión de usuarios y perfiles
- **[Metrics Service](./services/metrics-service.md)** - Métricas y observabilidad

### Desarrollo
- **[Guía de Desarrollo](./DEVELOPMENT.md)** - Cómo desarrollar nuevas funcionalidades
- **[Estándares de Código](./CODE_STANDARDS.md)** - Convenciones y buenas prácticas
- **[Testing](./TESTING.md)** - Estrategia de pruebas

### API y Contratos
- **[API Reference](./API.md)** - Endpoints y contratos OpenAPI
- **[Contratos Compartidos](./CONTRACTS.md)** - DTOs y interfaces compartidas

### Operación
- **[Deployment](./DEPLOYMENT.md)** - Cómo desplegar el sistema
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Solución de problemas comunes

---

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 18+
- Docker y Docker Compose
- PostgreSQL 16
- Redis 7

### Instalación Rápida

```bash
# Clonar el repositorio
git clone <repo-url>
cd mentorapredict

# Instalar dependencias en todos los servicios
npm install

# Iniciar servicios con Docker Compose
docker-compose -f docker-compose.dev.yml up -d

# Compilar y iniciar los servicios
npm run dev
```

Consulta [SETUP.md](./SETUP.md) para instrucciones detalladas.

---

## 📦 Servicios Funcionales

| Servicio | Puerto | Estado | Descripción |
|----------|--------|--------|-------------|
| **auth-service** | 3001 | ✅ FUNCIONAL | Autenticación JWT RS256 y RBAC |
| **academic-service** | 3003 | ✅ FUNCIONAL | Gestión de asignaturas, matriculaciones y calificaciones |
| analytics-service | 3004 | 🔧 EN DESARROLLO | Análisis de datos académicos |
| prediction-service | 3005 | 🔧 EN DESARROLLO | Predicción de riesgo académico |
| recommendation-service | 3006 | 🔧 EN DESARROLLO | Sistema de recomendaciones |
| user-service | 3002 | 🔧 EN DESARROLLO | Gestión de perfiles de usuario |
| metrics-service | 3007 | 🔧 EN DESARROLLO | Métricas y observabilidad |

---

## 🏗️ Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────┐
│                      Cliente (Web/Mobile)               │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP/REST
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    API Gateway (Future)                 │
└─────┬──────────┬──────────┬─────────────┬───────────────┘
      │          │          │             │
      ▼          ▼          ▼             ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  Auth    │ │Academic  │ │Analytics │ │Prediction│
│Service   │ │Service   │ │Service   │ │Service   │
│(3001)    │ │(3003)    │ │(3004)    │ │(3005)    │
└────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
     │            │            │            │
     │   PostgreSQL            Redis        │
     └────────────┼─────────────┼───────────┘
                  │             │
              Database      Cache Layer
```

---

## 📝 Patrones Implementados

### **Domain-Driven Design (DDD)**
- Entities (Entidades de dominio)
- Value Objects (Objetos de valor)
- Use Cases (Casos de uso de aplicación)
- Repositories (Acceso a datos)

### **Clean Architecture**
- Separación de capas (Domain, Application, Infrastructure)
- Inyección de dependencias
- Inversión de control

### **SOLID Principles**
- Single Responsibility
- Open/Closed Principle
- Liskov Substitution
- Interface Segregation
- Dependency Inversion

---

## 🔐 Seguridad

- **Autenticación:** JWT RS256 con claves asimétricas
- **Autorización:** RBAC (Role-Based Access Control)
- **Rate Limiting:** Protección contra ataques de fuerza bruta
- **Hash:** Bcrypt con salt rounds configurables

Consulta [SECURITY.md](./SECURITY.md) para más detalles.

---

## 📞 Soporte

Para preguntas o problemas:
1. Consulta [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Revisa los logs de los servicios
3. Abre un issue en el repositorio

---

**Última actualización:** 2026-06-07
