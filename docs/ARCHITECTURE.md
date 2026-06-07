# Arquitectura de MentoraPredict

## Descripción General

MentoraPredict es una plataforma de **predicción y recomendación académica** basada en arquitectura de **microservicios**. Utiliza:

- **Domain-Driven Design (DDD)** para modelado de dominio
- **Clean Architecture** para separación de responsabilidades
- **Event-Driven Architecture** (planeado) para comunicación entre servicios

---

## Capas Arquitectónicas

Cada microservicio sigue la estructura de capas:

```
┌─────────────────────────────────────────┐
│   INFRASTRUCTURE (Expresión)            │
│  ┌─────────────────────────────────┐    │
│  │ Controllers (Endpoints HTTP)    │    │
│  │ Filters, Interceptors, Guards   │    │
│  │ Persistence (ORM Entities)      │    │
│  │ External Integrations           │    │
│  └─────────────────────────────────┘    │
├─────────────────────────────────────────┤
│   APPLICATION (Orquestación)            │
│  ┌─────────────────────────────────┐    │
│  │ Use Cases (Lógica de flujo)     │    │
│  │ DTOs (Data Transfer Objects)    │    │
│  │ Ports (Interfaces)              │    │
│  │ Mappers (Transformación)        │    │
│  └─────────────────────────────────┘    │
├─────────────────────────────────────────┤
│   DOMAIN (Lógica de Negocio)            │
│  ┌─────────────────────────────────┐    │
│  │ Entities (Agregados)            │    │
│  │ Value Objects (Inmutables)      │    │
│  │ Domain Services (Lógica pesada) │    │
│  │ Domain Events (Eventos)         │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### Capa de Dominio (Domain)

**Responsabilidad:** Encapsular la lógica de negocio pura

**Componentes:**
- **Entities:** Objetos con identidad única (ej: User, Grade)
- **Value Objects:** Objetos inmutables sin identidad (ej: Email, Password)
- **Services:** Lógica de dominio compleja que involucra múltiples agregados

**Ejemplo - auth-service:**
```typescript
// Entity
class UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

// Value Object
class Email {
  private readonly _value: string;
  static create(raw: string): Email { /* validación */ }
}
```

### Capa de Aplicación (Application)

**Responsabilidad:** Orquestar la lógica de negocio del dominio

**Componentes:**
- **Use Cases:** Implementan los flujos de negocio (ej: RegisterUser)
- **DTOs:** Objetos de transferencia entre capas
- **Ports (Interfaces):** Contratos que depende el use case
- **Mappers:** Convertir entre entidades y DTOs

**Flujo típico:**
```
Controller → DTO → UseCase → Entity → Repository → Database
```

### Capa de Infraestructura (Infrastructure)

**Responsabilidad:** Detalles técnicos de implementación

**Componentes:**
- **Controllers:** Endpoints HTTP (Express/NestJS)
- **Persistence:** ORM Entities, Repositories
- **Cache:** Redis Adapter, Token management
- **External Services:** Integraciones externas
- **Filters/Interceptors:** Middleware de HTTP

---

## Comunicación Entre Servicios

### Síncrona (HTTP/REST)
```typescript
// academic-service llama a auth-service para verificar token
const response = await fetch('http://auth-service:3001/api/v1/auth/verify', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Asíncrona (Eventos - Planeado)
```typescript
// academic-service emite evento cuando se registra una calificación
eventBus.emit('grade.recorded', {
  studentId: '...',
  subjectId: '...',
  value: 8.5
});

// analytics-service se suscribe
eventBus.on('grade.recorded', async (data) => {
  await updateStudentMetrics(data);
});
```

---

## Patrones de Diseño

### 1. Repository Pattern
Abstrae el acceso a datos, permitiendo cambiar la implementación sin afectar la lógica.

```typescript
// Puerto (Interfaz)
interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  save(user: UserEntity): Promise<UserEntity>;
}

// Adaptador (Implementación)
class UserRepository implements IUserRepository {
  constructor(private dataSource: DataSource) {}
  
  async findById(id: string): Promise<UserEntity | null> {
    // Implementación con TypeORM
  }
}
```

### 2. Dependency Injection
NestJS maneja la inyección automática de dependencias:

```typescript
@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject('IUserRepository') private userRepo: IUserRepository,
    @Inject('IPasswordHasher') private hasher: IPasswordHasher,
  ) {}
}
```

### 3. Data Mapper Pattern
Separa las entidades de dominio de las entidades ORM:

```typescript
// Entity de Dominio (Puro, sin decoradores)
class UserEntity {
  id: string;
  email: string;
  passwordHash: string;
}

// ORM Entity (Acoplado a TypeORM)
@Entity('users')
export class UserOrmEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column() email!: string;
  @Column() passwordHash!: string;
}
```

### 4. Hexagonal Architecture (Puertos y Adaptadores)
```
┌─────────────────────────────────┐
│     Puertos (Interfaces)        │
│  - IUserRepository              │
│  - IPasswordHasher              │
│  - ITokenGenerator              │
└──────────────┬──────────────────┘
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
  Adaptadores  Adaptadores
  (UserRepo)   (BcryptAdapter)
```

---

## Flujos Clave

### Flujo de Autenticación (auth-service)

```
1. Cliente → POST /api/v1/auth/register
2. RegisterUserUseCase.execute(dto)
   ├─ Validar email (Email.create())
   ├─ Validar contraseña (Password.create())
   ├─ Verificar no existe (userRepo.findByEmail())
   ├─ Hash contraseña (BcryptAdapter.hash())
   ├─ Crear UserEntity
   └─ Guardar (userRepo.save())
3. Retornar UserDTO al cliente
```

### Flujo de Matriculación (academic-service)

```
1. Cliente → POST /api/v1/academic/enrollments
2. EnrollStudentUseCase.execute(dto)
   ├─ Validar asignatura existe (subjectRepo.findById())
   ├─ Verificar no está matriculado (enrollRepo.findByStudentAndSubject())
   ├─ Crear EnrollmentEntity
   ├─ Guardar (enrollRepo.save())
   └─ Retornar EnrollmentDTO
3. Retornar al cliente
```

---

## Decisiones de Diseño

### ¿Por qué microservicios?

✅ **Escalabilidad:** Cada servicio se puede escalar independientemente
✅ **Independencia:** Equipos pueden trabajar en servicios paralelos
✅ **Resiliencia:** Falla de un servicio no derriba todo
✅ **Tecnología:** Cada servicio puede usar diferentes tecnologías

⚠️ **Tradeoffs:** Complejidad operacional, consistencia distribuida, debugging

### ¿Por qué PostgreSQL + Redis?

- **PostgreSQL:** Datos persistentes, transacciones ACID, relaciones complejas
- **Redis:** Cache de tokens JWT, rate limiting, sesiones

### ¿Por qué JWT RS256 (Asimétrico)?

- **Seguridad:** Clave privada solo en auth-service, clave pública en otros servicios
- **Escalabilidad:** Otros servicios pueden verificar sin consultar a auth-service
- **Estándar:** RS256 es el estándar en microservicios

---

## Extensibilidad

### Agregar Nuevo Servicio

1. Crear carpeta `services/nuevo-service`
2. Seguir estructura: `src/{domain,application,infrastructure}`
3. Definir puertos en `application/ports/`
4. Implementar adaptadores en `infrastructure/`
5. Crear use cases en `application/use-cases/`
6. Exponer endpoints en `infrastructure/controllers/`

### Agregar Nueva Funcionalidad

1. **Domain:** Crear o extender Entities/ValueObjects
2. **Application:** Crear nuevo UseCase
3. **Infrastructure:** Implementar Repositories/Controllers
4. **Testing:** Agregar tests en cada capa

---

## Herramientas y Frameworks

| Capa | Tecnología | Propósito |
|------|-----------|----------|
| Framework | NestJS | Framework web TypeScript |
| ORM | TypeORM | Mapeo objeto-relacional |
| DB | PostgreSQL | Base de datos relacional |
| Cache | Redis | Cache en memoria |
| Auth | JWT + Passport | Autenticación |
| Validation | class-validator | Validación de DTOs |
| API Doc | Swagger/OpenAPI | Documentación interactiva |
| Testing | Jest | Framework de testing |
| Build | TypeScript | Compilación a JavaScript |

---

## Próximos Pasos

- [ ] Implementar API Gateway (Kong/Nginx)
- [ ] Event Bus con RabbitMQ/Kafka
- [ ] Circuit Breaker para resiliencia
- [ ] Distributed Tracing (Jaeger)
- [ ] Logging centralizado (ELK Stack)
- [ ] Monitoreo (Prometheus + Grafana)

---

**Última actualización:** 2026-06-07
