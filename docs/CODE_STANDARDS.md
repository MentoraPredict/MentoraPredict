# Estándares de Código

## 📝 Convenciones de Naming

### TypeScript/JavaScript

```typescript
// ✅ PascalCase para Clases
export class UserEntity { }
export class RegisterUserUseCase { }
export class UserRepository { }

// ✅ camelCase para Variables y Funciones
const userName: string = 'Victor';
function calculateGrade(): number { }
async function saveUser(): Promise<void> { }

// ✅ UPPER_SNAKE_CASE para Constantes
export const MAX_LOGIN_ATTEMPTS = 10;
export const REDIS_TTL_REFRESH_TOKEN = 604800; // 7 días

// ✅ PascalCase para Interfaces
export interface IUserRepository { }
export interface ITokenGenerator { }

// ✅ Sufijos descriptivos
export class UserOrmEntity { }  // ORM Entity
export class RegisterDto { }    // Data Transfer Object
export class Email { }          // Value Object
export class BcryptAdapter { }  // Adapter

// ❌ Evitar
export class user { }            // Minúsculas
const USER_NAME = 'Victor';     // Const como variable
interface Repository { }         // Sin "I"
```

### Archivos

```
// ✅ Nombres descriptivos y específicos
user.entity.ts                    # Entidad de Usuario
register-user.use-case.ts         # Caso de uso de Registro
user.repository.ts                # Repositorio de Usuario
jwt.adapter.ts                    # Adaptador JWT
register.dto.ts                   # DTO de Registro

// ❌ Evitar
user.ts                          # Muy genérico
usecase.ts                       # Falta especificidad
repo.ts                          # Abreviatura confusa
jwt-impl.ts                      # Nombre poco claro
```

---

## 📐 Estructura de Archivos

### Tamaño de Archivos

```typescript
// ✅ Recomendado
// - Controllers: 50-150 líneas
// - UseCases: 30-100 líneas
// - Entities: 20-80 líneas
// - DTOs: 10-40 líneas

// ❌ Evitar
// - Archivos > 300 líneas (dividir responsabilidades)
// - Métodos > 50 líneas (considerar refactoring)
// - Clases > 200 líneas (Single Responsibility)
```

### Organización de Imports

```typescript
// ✅ Orden de importaciones
// 1. Imports de librerías externas
import { Injectable, Inject } from '@nestjs/common';
import { getRepository } from 'typeorm';

// 2. Imports de otros módulos
import { UserEntity } from '../../domain/entities/user.entity';
import { IUserRepository } from '../ports/output/i-user.repository';

// 3. Imports locales
import { RegisterDto } from '../dtos';

// ❌ Evitar
import { Injectable, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import UserEntity from '../../domain/entities/user.entity';  // Default export
```

---

## 🏗️ Estructura de Clases

### Entity (Dominio)

```typescript
// ✅ Correcto
export class UserEntity {
  constructor(
    readonly id: string,
    readonly email: string,
    readonly passwordHash: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly role: UserRole,
    readonly isActive: boolean,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  // Métodos de negocio
  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  canLogin(): boolean {
    return this.isActive;
  }
}

// ❌ Evitar
export class User {
  id: string;
  email: string;
  // Setters que permiten mutación
  setEmail(email: string) { this.email = email; }
  // Métodos sin contexto de dominio
  getAll() { }
}
```

### UseCase

```typescript
// ✅ Correcto
@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject('IUserRepository') private userRepo: IUserRepository,
    @Inject('IPasswordHasher') private hasher: IPasswordHasher,
  ) {}

  async execute(dto: RegisterDto): Promise<UserDto> {
    // 1. Validación
    const email = Email.create(dto.email);
    const password = Password.create(dto.password);

    // 2. Verificar duplicados
    const existing = await this.userRepo.findByEmail(email.value);
    if (existing) throw new ConflictException('Email already registered');

    // 3. Hash de contraseña
    const hash = await this.hasher.hash(password.raw);

    // 4. Crear entidad
    const user = new UserEntity(/*...*/);

    // 5. Persistir
    const saved = await this.userRepo.save(user);

    // 6. Retornar DTO
    return UserMapper.toDomain(saved);
  }
}

// ❌ Evitar
export class RegisterUserUseCase {
  async execute(dto: RegisterDto) {
    // Lógica de infraestructura mezclada
    const db = new Database();
    const user = await db.query('INSERT INTO users...');
    
    // Múltiples responsabilidades
    const hash = bcrypt.hashSync(dto.password);
    sendEmail(user.email);
    // ...
  }
}
```

### Repository

```typescript
// ✅ Correcto
@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity) private db: Repository<UserOrmEntity>,
  ) {}

  async findById(id: string): Promise<UserEntity | null> {
    const orm = await this.db.findOne({ where: { id } });
    return orm ? this.toDomain(orm) : null;
  }

  private toDomain(orm: UserOrmEntity): UserEntity {
    return new UserEntity(
      orm.id,
      orm.email,
      orm.passwordHash,
      orm.firstName,
      orm.lastName,
      orm.role,
      orm.isActive,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  private toORM(domain: UserEntity): UserOrmEntity {
    const orm = new UserOrmEntity();
    orm.id = domain.id;
    // ...
    return orm;
  }
}

// ❌ Evitar
export class UserRepository {
  // Acceso directo a ORM
  async findById(id: string) {
    return UserOrmEntity.findOne(id);  // Expone ORM
  }

  // Métodos que retornan queries sin ejecutar
  getFindByEmailQuery() { }
}
```

### Controller

```typescript
// ✅ Correcto
@ApiTags('auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly registerUC: RegisterUserUseCase,
    private readonly loginUC: LoginUserUseCase,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User registered' })
  async register(@Body() dto: RegisterDto) {
    return this.registerUC.execute(dto);
  }
}

// ❌ Evitar
@Controller('auth')
export class AuthController {
  // Sin documentación Swagger
  @Post()
  register(dto: any) {  // Tipo 'any'
    // Lógica de negocio aquí
    if (!dto.email) throw new Error('Email required');
    // ...
  }
}
```

---

## 🎨 Estilo de Código

### Indentación y Espacios

```typescript
// ✅ Correcto (2 espacios)
export class UserEntity {
  constructor(
    readonly id: string,
    readonly email: string,
  ) {}

  getName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

// ❌ Inconsistente (tabs vs espacios)
export class UserEntity {
	constructor(readonly id: string, readonly email: string) {}
    getName(): string { return ""; }
}
```

### Longitud de Líneas

```typescript
// ✅ Correcto (≤ 100 caracteres)
const users = await this.userRepo.findByRole(
  UserRole.STUDENT,
);

// ❌ Muy larga (> 120 caracteres)
const users = await this.userRepository.findByRoleAndIsActiveAndCreatedAfterDate(UserRole.STUDENT, true, new Date());
```

### Condiciones

```typescript
// ✅ Correcto
if (!user) throw new NotFoundException();
if (user.isActive && user.role === UserRole.ADMIN) {
  // ...
}

// ❌ Evitar
if (user == null) throw new Error();
if (user && user.active == true && user.role == 'ADMIN') {
  // ...
}
```

---

## 📝 Documentación

### Comentarios

```typescript
// ✅ Comentarios útiles
// Rate limit: máximo 10 intentos de login por IP en 15 minutos
const attempts = await this.cache.incrementLoginAttempts(ip, RATE_LIMIT_TTL);
if (attempts > 10) throw new ForbiddenException('Too many attempts');

// ✅ Comentarios explicativos
// RS256 requires asymmetric keys; fall back to HS256 for development
const useAsymmetric = !!privateKey && !!publicKey;

// ❌ Comentarios obvios
const user = await this.userRepo.findById(id); // Find user by ID
if (!user) {
  // User not found
  throw new NotFoundException();
}

// ❌ Comentarios desactualizados
// TODO: Fix this later (desde hace 6 meses)
// Buggy code - do not use
```

### JSDoc

```typescript
// ✅ Correcto
/**
 * Registra un nuevo usuario en el sistema
 *
 * @param dto - Datos del usuario (email, contraseña, nombre)
 * @returns Usuario creado con rol STUDENT
 * @throws ConflictException si el email ya existe
 * @throws BadRequestException si los datos no son válidos
 */
async register(dto: RegisterDto): Promise<UserDto> {
  // ...
}

// ❌ Incompleto
async register(dto: RegisterDto) {
  // Register a user
}
```

---

## 🧪 Tests

### Naming

```typescript
// ✅ Nombres descriptivos
describe('RegisterUserUseCase', () => {
  it('should register user successfully when email is unique', async () => {
    // ...
  });

  it('should throw ConflictException when email already exists', async () => {
    // ...
  });

  it('should hash password with bcrypt before saving', async () => {
    // ...
  });
});

// ❌ Nombres genéricos
it('works', () => {});
it('test 1', () => {});
it('should register', () => {});
```

### Estructura AAA

```typescript
// ✅ Arrange-Act-Assert
it('should register user', async () => {
  // Arrange
  const dto = new RegisterDto('email', 'password', 'John', 'Doe');
  const expectedUser = { id: '123', email: 'email' };

  // Act
  const result = await useCase.execute(dto);

  // Assert
  expect(result).toEqual(expectedUser);
  expect(repository.save).toHaveBeenCalledWith(expect.any(UserEntity));
});

// ❌ Todo mezclado
it('should register', async () => {
  const dto = new RegisterDto();
  const result = await useCase.execute(dto);
  expect(result).toBeDefined();
  const user = await repository.findById(result.id);
  expect(user).toBeDefined();
});
```

---

## 🔒 Seguridad

### Contraseñas

```typescript
// ✅ Correcto
const hash = await bcrypt.hash(password, 12);  // 12 salt rounds
const valid = await bcrypt.compare(input, hash);

// ❌ Incorrecto
const hash = MD5(password);  // Hash débil
const valid = input === hash;  // Comparación simple
```

### Inyección de Dependencias

```typescript
// ✅ Correcto
@Injectable()
export class MyService {
  constructor(
    @Inject('IRepository') private repo: IRepository,
  ) {}
}

// ❌ Incorrecto
export class MyService {
  private repo = new Repository();  // Hard dependency
}
```

---

## 🚀 Performance

### Async/Await

```typescript
// ✅ Correcto - Paralelo cuando es posible
const [user, roles] = await Promise.all([
  this.userRepo.findById(id),
  this.roleRepo.findByUser(id),
]);

// ❌ Incorrecto - Secuencial innecesario
const user = await this.userRepo.findById(id);
const roles = await this.roleRepo.findByUser(id);
```

### Queries

```typescript
// ✅ Correcto - Usar índices, limit
const users = await this.userRepo.find({
  where: { isActive: true },
  take: 100,
  skip: (page - 1) * 100,
});

// ❌ Incorrecto - Traer todo, filtrar en memoria
const users = await this.userRepo.find();
const active = users.filter(u => u.isActive).slice(0, 100);
```

---

## 📋 Checklist Pre-Commit

- [ ] Código compila sin errores
- [ ] No hay `console.log()` en producción
- [ ] Todos los files tienen `@Injectable()` cuando corresponde
- [ ] DTOs tienen validadores con `@Is*` decorators
- [ ] Controllers tienen `@ApiOperation()` y `@ApiResponse()`
- [ ] Nombres siguen convenciones (PascalCase, camelCase, UPPER_SNAKE)
- [ ] Métodos son < 50 líneas
- [ ] Archivos son < 300 líneas
- [ ] Imports están organizados
- [ ] No hay comentarios obvios
- [ ] Tests pasan: `npm test`
- [ ] Lint pasa: `npm run lint`

---

**Última actualización:** 2026-06-07
