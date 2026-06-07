# Solución de Problemas

## 🔴 Problemas Comunes

### 1. "Cannot find module" Error

**Síntoma:**
```
Error: Cannot find module '@nestjs/common'
```

**Causas posibles:**
- Dependencias no instaladas
- node_modules corruptos
- package-lock.json desincronizado

**Solución:**
```bash
# Opción 1: Reinstalar en el servicio específico
cd services/auth-service
rm -rf node_modules package-lock.json
npm install
npm run build

# Opción 2: Limpiar todo el proyecto
cd mentorapredict
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm run build
```

---

### 2. Puerto Ya en Uso

**Síntoma:**
```
listen EADDRINUSE: address already in use :::3001
```

**Causas posibles:**
- Proceso Node anterior aún corriendo
- Otro servicio usa el mismo puerto
- Docker container aún activo

**Solución:**
```bash
# Opción 1: Ver qué proceso usa el puerto
lsof -i :3001

# Opción 2: Matar el proceso
kill -9 <PID>

# Opción 3: Cambiar puerto en .env
# APP_PORT=3011

# Opción 4: Docker
docker ps  # Ver containers
docker kill <CONTAINER_ID>
```

---

### 3. Conexión a PostgreSQL Rechazada

**Síntoma:**
```
connect ECONNREFUSED 127.0.0.1:5432
error: connect ECONNREFUSED
```

**Causas posibles:**
- PostgreSQL no está corriendo
- Docker container parado
- Credenciales incorrectas en .env
- Port forwarding incorrecto

**Solución:**
```bash
# 1. Verificar Docker está corriendo
docker ps

# 2. Si no, iniciar servicios
docker-compose -f docker-compose.dev.yml up -d

# 3. Verificar logs
docker logs mentorapredict_postgres

# 4. Esperar mensaje de listo
# "database system is ready to accept connections"

# 5. Verificar credentials en .env
cat .env | grep POSTGRES

# 6. Si aún no funciona, resetear BD
docker rm mentorapredict_postgres
docker volume rm mentorapredict_pgdata
docker-compose -f docker-compose.dev.yml up -d
```

---

### 4. Redis Connection Error

**Síntoma:**
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Causas posibles:**
- Redis no está corriendo
- Puerto incorrecto en .env
- Docker container parado

**Solución:**
```bash
# 1. Verificar Redis en Docker
docker ps | grep redis

# 2. Iniciar si no está
docker-compose -f docker-compose.dev.yml up -d redis

# 3. Verificar logs
docker logs mentorapredict_redis

# 4. Probar conexión
docker exec -it mentorapredict_redis redis-cli ping
# Debería responder: PONG

# 5. Conectarse y ver keys
docker exec -it mentorapredict_redis redis-cli
> KEYS *
> exit
```

---

### 5. "Entity metadata" Error

**Síntoma:**
```
Error: EntityMetadataNotFoundError: No metadata for "UserOrmEntity" was found.
```

**Causas posibles:**
- ORM Entity no está registrada en TypeOrmModule
- Ruta de importación incorrecta
- Entidad no tiene decorador @Entity

**Solución:**
```typescript
// ✅ Correcto en app.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity, GradeOrmEntity]),  // ← Registrar
  ],
})

// ✅ Correcto en ORM Entity
@Entity('users')  // ← Decorador requerido
export class UserOrmEntity {
  @PrimaryColumn() id!: string;
}

// ❌ Incorrecto - Falta @Entity
export class UserOrmEntity {
  id!: string;
}
```

---

### 6. JWT Token Invalid

**Síntoma:**
```
UnauthorizedException: Invalid token
```

**Causas posibles:**
- Token expirado (15 minutos)
- Clave pública incorrecta
- Token malformado
- Algoritmo incorrecto

**Solución:**
```bash
# 1. Generar nuevo token con login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"Pass123"}'

# 2. Usar token en requests
curl -H "Authorization: Bearer <TOKEN>" http://localhost:3001/api/v1/auth/profile

# 3. Si token expiró, usar refresh token
curl -X POST http://localhost:3001/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<REFRESH_TOKEN>"}'

# 4. Verificar JWT_SECRET en .env
echo $JWT_SECRET
```

---

### 7. "Too Many Login Attempts"

**Síntoma:**
```
ForbiddenException: Too many login attempts. Try again in 15 minutes.
```

**Causas:**
- Más de 10 intentos fallidos desde la misma IP
- Rate limiting activado

**Solución:**
```bash
# Opción 1: Esperar 15 minutos

# Opción 2: Contactar administrador (reset manual)

# Opción 3: Cambiar IP (si es local)
# - Usar VPN
# - Cambiar red WiFi
# - Usar docker para cambiar IP

# Opción 4: En desarrollo, aumentar límite
# Editar auth-service/.env o login-user.use-case.ts
```

---

### 8. TypeScript Compilation Error

**Síntoma:**
```
error TS7005: Variable 'something' implicitly has type 'any'
```

**Causas posibles:**
- strict: true en tsconfig.json
- Tipo no especificado
- Imports incorrectos

**Solución:**
```typescript
// ❌ Incorrecto
const user = await this.userRepo.findById(id);

// ✅ Correcto
const user: UserEntity | null = await this.userRepo.findById(id);

// ✅ O con inferencia
const user = await this.userRepo.findById(id) as UserEntity | null;
```

---

### 9. "Duplicate Key" Error en Base de Datos

**Síntoma:**
```
QueryFailedError: duplicate key value violates unique constraint
```

**Causas posibles:**
- Email ya existe
- Usuario ya matriculado en la asignatura
- Evaluación duplicada

**Solución:**
```typescript
// Agregar validación previa
const existing = await this.repo.findByEmail(email);
if (existing) {
  throw new ConflictException('Email already registered');
}

// O manejar el error
try {
  await this.repo.save(entity);
} catch (error) {
  if (error.code === '23505') {  // Unique constraint violation
    throw new ConflictException('Resource already exists');
  }
  throw error;
}
```

---

### 10. Cambios en Código No Se Reflejan

**Síntoma:**
- Cambias código pero la app sigue igual
- Después de npm run build funciona

**Causa:**
- Código no compilado
- Watch mode no activo

**Solución:**
```bash
# Opción 1: Compilar nuevamente
npm run build

# Opción 2: Usar desarrollo con watch
npm run dev

# Opción 3: Reiniciar servicio
npm start  # Después de build
```

---

## 🔧 Herramientas de Debugging

### Ver Logs de Docker

```bash
# Últimos 50 líneas
docker logs -n 50 mentorapredict_postgres

# Con timestamps
docker logs -t mentorapredict_postgres

# En vivo (follow)
docker logs -f mentorapredict_postgres
```

### Acceder a PostgreSQL

```bash
# Conectarse
docker exec -it mentorapredict_postgres psql -U mp_user -d mentorapredict

# Comandos útiles
\dt              # Listar tablas
\d users         # Describir tabla
SELECT * FROM users;  # Ver contenido
DELETE FROM users;    # Limpiar datos
\q               # Salir
```

### Acceder a Redis

```bash
# Conectarse
docker exec -it mentorapredict_redis redis-cli

# Comandos útiles
KEYS *           # Listar todas las claves
GET key          # Ver valor
DEL key          # Eliminar clave
FLUSHDB          # Limpiar todo
exit             # Salir
```

### Verificar Puertos

```bash
# Ver qué puertos están en uso
netstat -tuln | grep LISTEN

# En Windows
netstat -ano | findstr :3001

# Ver qué proceso usa puerto
lsof -i :3001

# En Windows
netstat -ano | findstr :3001
tasklist | findstr PID
```

---

## 📊 Monitoring

### Health Checks

```bash
# Auth Service
curl http://localhost:3001/health

# Academic Service
curl http://localhost:3003/health

# Respuesta esperada:
# {"status":"UP","services":{"database":"UP","redis":"UP"}}
```

### Swagger UI

- Auth Service: http://localhost:3001/api/docs
- Academic Service: http://localhost:3003/api/docs

---

## 🆘 Cuando Nada Funciona

### "Nuclear Option" (Reset Completo)

```bash
# 1. Detener todo
docker-compose -f docker-compose.dev.yml down -v

# 2. Limpiar proyecto
rm -rf node_modules
rm -rf services/*/node_modules
rm -rf services/*/dist
rm package-lock.json

# 3. Limpiar cache npm
npm cache clean --force

# 4. Instalar de nuevo
npm install

# 5. Compilar
npm run build

# 6. Iniciar infraestructura
docker-compose -f docker-compose.dev.yml up -d

# 7. Esperar 10 segundos

# 8. Iniciar servicios
npm run dev
```

---

## 📞 Cuando Necesites Ayuda

**Información a proporcionar:**

1. **Comando que ejecutaste:**
   ```bash
   npm run dev
   ```

2. **Error exacto:**
   ```
   Error: listen EADDRINUSE: address already in use :::3001
   ```

3. **Output de sistema:**
   ```bash
   node --version
   npm --version
   docker --version
   ```

4. **Status de Docker:**
   ```bash
   docker ps
   ```

5. **Logs relevantes:**
   ```bash
   docker logs mentorapredict_postgres
   ```

---

## 📚 Recursos Útiles

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Docs](https://typeorm.io)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- [Redis CLI](https://redis.io/commands)
- [Node.js Docs](https://nodejs.org/docs)

---

**Última actualización:** 2026-06-07
