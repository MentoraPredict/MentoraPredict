# Guía de Desarrollo

## 📝 Antes de Comenzar

1. Leer [ARCHITECTURE.md](./ARCHITECTURE.md) - Entender el diseño
2. Leer [SERVICES.md](./SERVICES.md) - Conocer los servicios
3. Completar [SETUP.md](./SETUP.md) - Configurar tu ambiente

---

## 🎯 Crear un Nuevo Servicio

### 1. Estructura Básica

```bash
# Crear carpeta
mkdir services/nuevo-service
cd services/nuevo-service

# Crear structure
mkdir -p src/{domain/{entities,value-objects,services},application/{use-cases,dtos,ports/{input,output},mappers},infrastructure/{controllers,persistence,config,filters,interceptors}}

# Crear archivos base
touch src/main.ts
touch src/app.module.ts
touch package.json
touch tsconfig.json
```

### 2. Package.json

```json
{
  "name": "@mentorapredict/nuevo-service",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "pnpm exec nest build",
    "dev": "nest start --watch",
    "start": "node dist/main",
    "test": "jest --passWithNoTests"
  },
  "dependencies": {
    "@nestjs/common": "^10.3.0",
    "@nestjs/config": "^3.2.0",
    "@nestjs/core": "^10.3.0",
    "@nestjs/platform-express": "^10.3.0",
    "@nestjs/swagger": "^7.3.0",
    "@nestjs/typeorm": "^10.0.2",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "pg": "^8.11.5",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1",
    "typeorm": "^0.3.20"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.3.2",
    "@types/node": "^20.12.0",
    "typescript": "^5.4.0"
  }
}
```

### 3. Tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 🏗️ Crear un Nuevo Use Case

### Paso 1: Definir Puertos (Interfaces)

```typescript
// application/ports/output/i-nuevo.repository.ts
import { NuevoEntity } from "../../../domain/entities/nuevo.entity";

export interface INuevoRepository {
  findById(id: string): Promise<NuevoEntity | null>;
  save(entity: NuevoEntity): Promise<NuevoEntity>;
}
```

### Paso 2: Crear Use Case

```typescript
// application/use-cases/crear-nuevo.use-case.ts
import { Injectable, Inject } from "@nestjs/common";
import { INuevoRepository } from "../ports/output/i-nuevo.repository";
import { CrearNuevoDto } from "../dtos/crear-nuevo.dto";
import { NuevoEntity } from "../../domain/entities/nuevo.entity";

@Injectable()
export class CrearNuevoUseCase {
  constructor(@Inject("INuevoRepository") private repo: INuevoRepository) {}

  async execute(dto: CrearNuevoDto): Promise<NuevoEntity> {
    // Lógica de negocio
    const entity = new NuevoEntity(/*...*/);
    return this.repo.save(entity);
  }
}
```

### Paso 3: Crear DTO

```typescript
// application/dtos/crear-nuevo.dto.ts
import { IsString, IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CrearNuevoDto {
  @ApiProperty()
  @IsUUID()
  id!: string;

  @ApiProperty()
  @IsString()
  name!: string;
}
```

### Paso 4: Implementar Repository

```typescript
// infrastructure/persistence/nuevo.repository.ts
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { INuevoRepository } from "../../application/ports/output/i-nuevo.repository";
import { NuevoEntity } from "../../domain/entities/nuevo.entity";
import { NuevoOrmEntity } from "./nuevo.orm-entity";

@Injectable()
export class NuevoRepository implements INuevoRepository {
  constructor(
    @InjectRepository(NuevoOrmEntity)
    private db: Repository<NuevoOrmEntity>,
  ) {}

  async findById(id: string): Promise<NuevoEntity | null> {
    const orm = await this.db.findOne({ where: { id } });
    return orm ? this.toDomain(orm) : null;
  }

  async save(entity: NuevoEntity): Promise<NuevoEntity> {
    const orm = this.toORM(entity);
    const saved = await this.db.save(orm);
    return this.toDomain(saved);
  }

  private toDomain(orm: NuevoOrmEntity): NuevoEntity {
    return new NuevoEntity(/*...*/);
  }

  private toORM(domain: NuevoEntity): NuevoOrmEntity {
    return {
      /*...*/
    };
  }
}
```

### Paso 5: Crear ORM Entity

```typescript
// infrastructure/persistence/nuevo.orm-entity.ts
import { Entity, PrimaryColumn, Column, CreateDateColumn } from "typeorm";

@Entity("nuevos")
export class NuevoOrmEntity {
  @PrimaryColumn("uuid") id!: string;
  @Column() name!: string;
  @CreateDateColumn() createdAt!: Date;
}
```

### Paso 6: Crear Entidad de Dominio

```typescript
// domain/entities/nuevo.entity.ts
export class NuevoEntity {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly createdAt: Date,
  ) {}
}
```

### Paso 7: Crear Controlador

```typescript
// infrastructure/controllers/nuevo.controller.ts
import { Controller, Post, Body } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { CrearNuevoUseCase } from "../../application/use-cases/crear-nuevo.use-case";
import { CrearNuevoDto } from "../../application/dtos/crear-nuevo.dto";

@ApiTags("nuevo")
@Controller("api/v1/nuevo")
export class NuevoController {
  constructor(private readonly crearNuevoUC: CrearNuevoUseCase) {}

  @Post()
  @ApiOperation({ summary: "Crear nuevo" })
  async crear(@Body() dto: CrearNuevoDto) {
    return this.crearNuevoUC.execute(dto);
  }
}
```

### Paso 8: Registrar en Módulo

```typescript
// app.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([NuevoOrmEntity])],
  controllers: [NuevoController],
  providers: [
    { provide: "INuevoRepository", useClass: NuevoRepository },
    CrearNuevoUseCase,
  ],
})
export class AppModule {}
```

---

## 📝 Convenciones de Código

### Naming

```typescript
// Entidades de dominio
export class UserEntity {}

// Value Objects
export class Email {}

// ORM Entities
export class UserOrmEntity {}

// Interfaces / Puertos
export interface IUserRepository {}

// Use Cases
export class RegisterUserUseCase {}

// DTOs
export class RegisterDto {}

// Adaptadores
export class BcryptAdapter implements IPasswordHasher {}
```

### Estructura de Carpetas

```
service/src
├── domain/              # Lógica de negocio pura
├── application/         # Orquestación
├── infrastructure/      # Detalles técnicos
├── main.ts
└── app.module.ts
```

### Inyección de Dependencias

```typescript
// ✅ Correcto
@Injectable()
export class MyUseCase {
  constructor(@Inject("IMyRepository") private repo: IMyRepository) {}
}

// ❌ Incorrecto
export class MyUseCase {
  private repo = new MyRepository(); // Hard dependency
}
```

---

## 🧪 Testing

### Estructura de Tests

```typescript
// application/use-cases/__tests__/mi-use-case.spec.ts
describe("MiUseCase", () => {
  let useCase: MiUseCase;
  let repo: IMyRepository;

  beforeEach(() => {
    repo = mock<IMyRepository>();
    useCase = new MiUseCase(repo);
  });

  it("debe hacer algo", async () => {
    // Arrange
    const input = {
      /* ... */
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result).toBeDefined();
  });
});
```

---

## 🔄 Flujo de Desarrollo

### 1. Crear Feature

```bash
git checkout -b feature/nueva-funcionalidad
```

### 2. Desarrollar

- Crear DTOs
- Crear entidades de dominio
- Crear use case con @Injectable()
- Crear interfaces (puertos)
- Implementar repositories
- Crear controlador
- Registrar en módulo

### 3. Compilar

```bash
npm run build
```

### 4. Testing

```bash
npm test
npm run test:cov
```

### 5. Commit

```bash
git add .
git commit -m "feat: agregar nueva funcionalidad"
git push origin feature/nueva-funcionalidad
```

### 6. Pull Request

Crear PR en GitHub con descripción.

---

## ⚠️ Checklist antes de Commit

- [ ] Código compila sin errores
- [ ] Tests pasen
- [ ] Sin `console.log()` en código
- [ ] Decorador `@Injectable()` en use-cases
- [ ] DTOs tienen validadores
- [ ] Controladores usan `@ApiOperation()` y `@ApiResponse()`
- [ ] Repositorio implementa interfaz correctamente
- [ ] Archivos siguien convenciones de naming
- [ ] Sin hard dependencies (inyección correcta)

---

## 🚀 Publicar a Producción

```bash
# 1. Build
npm run build

# 2. Test
npm test

# 3. Lint
npm run lint

# 4. Deploy
# (Instrucciones en DEPLOYMENT.md)
```

---

**Última actualización:** 2026-06-07
