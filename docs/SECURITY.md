# Seguridad

## 🔐 Medidas de Seguridad Implementadas

### 1. Autenticación JWT

**Algoritmo: RS256 (Recomendado para Producción)**
```typescript
// Asimétrico: La firma se hace con clave privada, 
// verificación con clave pública
// Seguro para comunicación entre servicios
```

**En Desarrollo:**
```typescript
// HS256 (Simétrico) - Solo para desarrollo
// Más simple, menos seguro
// Clave compartida entre servicios
```

**Configuración:**
```env
# Producción
JWT_ALGORITHM=RS256
JWT_PRIVATE_KEY=<private-key>
JWT_PUBLIC_KEY=<public-key>

# Desarrollo
JWT_ALGORITHM=HS256
JWT_SECRET=min-32-caracteres-alfanumericos
```

### 2. Hashing de Contraseñas

**Algoritmo: Bcrypt**
```typescript
// Salt Rounds: 12
// Tiempo de hash: ~100ms por contraseña
// Seguro contra ataques de fuerza bruta

const hash = await bcrypt.hash(password, 12);
const valid = await bcrypt.compare(inputPassword, hash);
```

**Configuración de Contraseña:**
- Mínimo 8 caracteres
- Mayúscula, minúscula, número, carácter especial
- No puede ser vacía

```typescript
// Validación en PasswordVO
export class Password {
  private constructor(readonly raw: string) {}

  static create(password: string): Result<Password> {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!regex.test(password)) {
      return Result.fail('Password does not meet requirements');
    }
    return Result.ok(new Password(password));
  }
}
```

---

## 🛡️ Rate Limiting

### Protección contra Brute Force (Auth Service)

**Límites:**
- Máximo 10 intentos de login fallidos
- Ventana de tiempo: 15 minutos
- Almacenado en Redis para rapidez

**Implementación:**
```typescript
// En LoginUserUseCase
const attempts = await this.cache.incrementLoginAttempts(ip, RATE_LIMIT_TTL);
if (attempts > MAX_LOGIN_ATTEMPTS) {
  throw new ForbiddenException('Too many login attempts');
}

// Después de login exitoso
await this.cache.deleteLoginAttempts(ip);
```

**Claves Redis:**
```
RATE_LIMIT:LOGIN:192.168.1.1 = 5
RATE_LIMIT:LOGIN:192.168.1.2 = 10 (bloqueado)
```

---

## 🔑 Gestión de Tokens

### Access Token (JWT - 15 minutos)

```typescript
{
  "sub": "user-id",
  "email": "user@uce.edu.ec",
  "role": "STUDENT",
  "iat": 1717767400,
  "exp": 1717768300  // 15 minutos después
}
```

**Usado para:** Autenticación en endpoints

**Expiración:** Corta, reduce riesgo si se compromete

### Refresh Token (JWT - 7 días)

```typescript
{
  "sub": "user-id",
  "type": "refresh",
  "iat": 1717767400,
  "exp": 1718372200  // 7 días después
}
```

**Almacenamiento:** Redis (no en Base de Datos)

**Ventaja:** Puede ser revocado instantáneamente

**Renovación:** Cuando access token expira, usar refresh token para obtener nuevo access token

---

## 🚀 CORS (Cross-Origin Resource Sharing)

**Configuración en app.module.ts:**
```typescript
app.enableCors({
  origin: process.env.CORS_ORIGINS?.split(',') ?? 'http://localhost:3000',
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
});
```

**En Desarrollo:**
```env
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3003
```

**En Producción:**
```env
CORS_ORIGINS=https://app.mentorapredict.com,https://admin.mentorapredict.com
```

**Nota:** No usar wildcard (`*`) en producción

---

## 🔒 Validación de Entrada

### DTOs con Validadores

```typescript
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail() email!: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
  password!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName!: string;
}
```

**Automático en NestJS:**
```typescript
@Post('register')
async register(@Body() dto: RegisterDto) {
  // DTO validado automáticamente
  // Si falla validación → 400 Bad Request
}
```

---

## 🛡️ Guards y Autenticación

### JWT Guard

```typescript
// Proteger endpoints que requieren autenticación
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@AuthUser() user: UserEntity) {
  return user;
}
```

### Roles Guard

```typescript
// Proteger endpoints por rol
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Delete('users/:id')
deleteUser(@Param('id') id: string) {
  // Solo ADMIN puede ejecutar
}
```

---

## 🔐 Secretos y Configuración

### Variables de Entorno

**NUNCA guardar en el código:**
```typescript
// ❌ INCORRECTO
const JWT_SECRET = 'my-secret-key-in-code';

// ✅ CORRECTO
const JWT_SECRET = process.env.JWT_SECRET;
```

**Gestión:**
```bash
# .env (local, no commitear)
JWT_SECRET=super-secret-key-min-32-chars
POSTGRES_PASSWORD=secure-password

# .env.example (commitear, sin valores reales)
JWT_SECRET=<change-me-in-production>
POSTGRES_PASSWORD=<change-me-in-production>
```

### Validación de Env

```typescript
// config/env-validation.schema.ts
const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production'),
  JWT_SECRET: Joi.string().required().min(32),
  POSTGRES_PASSWORD: Joi.string().required(),
  REDIS_HOST: Joi.string().required(),
  // ... más validaciones
});
```

---

## 🚨 Manejo de Errores

### No Exponer Información Sensible

```typescript
// ✅ CORRECTO
@Catch(Exception)
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: Exception, host: ArgumentsHost) {
    // Log interno (con detalles)
    console.error('Database error:', exception.query, exception.message);

    // Respuesta al cliente (sin detalles)
    response.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      error: 'InternalServerError'
    });
  }
}

// ❌ INCORRECTO - Expone detalles
response.status(500).json({
  statusCode: 500,
  message: 'Database connection failed at 192.168.1.100:5432',
  error: exception.message  // Stack trace
});
```

---

## 📊 Logging de Seguridad

### Eventos a Registrar

```typescript
// Registro de autenticación
logger.log(`User login: ${email} from IP ${ip}`);
logger.warn(`Failed login attempt: ${email} (${attempts}/10)`);
logger.error(`Rate limit exceeded for IP: ${ip}`);

// Registro de acceso
logger.log(`User accessed /api/v1/users/:id with role ${role}`);
logger.warn(`Unauthorized access attempt: ${userId} to ${resource}`);

// Cambios de datos
logger.log(`User ${userId} updated profile`);
logger.warn(`Grade modified: student ${studentId}, evaluation ${evalId}`);
```

### NO Loguear

```typescript
// ❌ NUNCA loguear
logger.log(`User password: ${password}`);
logger.log(`Token: ${accessToken}`);
logger.log(`Database password: ${dbPassword}`);
```

---

## 🔄 Comunicación Segura entre Servicios

### Service-to-Service Authentication

**En Sprint 2:**
```typescript
// Auth Service expone clave pública
// Otros servicios verifican tokens con clave pública

const publicKey = fs.readFileSync('public-key.pem');
const verified = jwt.verify(token, publicKey, {
  algorithms: ['RS256']
});
```

**En Desarrollo:**
```typescript
// Todos usan JWT_SECRET compartido
const verified = jwt.verify(token, process.env.JWT_SECRET);
```

---

## 🗄️ Seguridad de Base de Datos

### Credentials

```env
# Desarrollo
POSTGRES_USER=mp_user
POSTGRES_PASSWORD=mp_pass
POSTGRES_DB=mentorapredict

# Producción
POSTGRES_USER=<usuario-único>
POSTGRES_PASSWORD=<contraseña-64-caracteres>
POSTGRES_DB=mentorapredict_prod
```

### Conexión Segura

```typescript
// Con SSL en producción
const connection = await createConnection({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});
```

---

## 🚀 Seguridad en Producción

### Checklist Pre-Deploy

- [ ] `NODE_ENV=production`
- [ ] `JWT_ALGORITHM=RS256` con llaves simétricas
- [ ] Todos los `process.env.*` no tiene valores hardcoded
- [ ] CORS_ORIGINS limitado a dominios conocidos
- [ ] HTTPS obligatorio (redireccionar HTTP → HTTPS)
- [ ] Database SSL habilitado
- [ ] Rate limiting activo (10 intentos / 15 min)
- [ ] Logging de eventos de seguridad
- [ ] Contraseñas de BD ≥ 32 caracteres
- [ ] Headers de seguridad (HSTS, CSP, X-Frame-Options)

### Headers de Seguridad

```typescript
// En middleware
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
```

---

## 📚 Mejores Prácticas

### ✅ DO

- Usar HTTPS en producción
- Validar ALL inputs
- Hash contraseñas con Bcrypt
- Rate limit en login
- Usar JWT con RS256
- Logs de seguridad
- Rotar secretos regularmente
- Use environment variables
- Update dependencies regularmente

### ❌ DON'T

- Usar contraseñas en plain text
- Exponer mensajes de error detallados
- Hardcode secrets en código
- Usar algoritmos débiles (MD5, SHA1)
- Confiar en validación del cliente
- Loguear información sensible
- Usar default credentials
- Permitir CORS = '*'

---

## 🔐 Cambios de Contraseña

**Endpoint (Sprint 2):**
```
POST /api/v1/auth/change-password

{
  "currentPassword": "CurrentPass123!",
  "newPassword": "NewPass456@"
}
```

**Validación:**
1. Verificar currentPassword es correcta
2. Verificar newPassword es diferente
3. Hash newPassword
4. Actualizar en BD
5. Invalidar todos los refresh tokens

---

## 🆘 Vulnerabilidades Conocidas

### SQL Injection

**Prevenido por:** TypeORM (parametrized queries)

```typescript
// ✅ SEGURO - TypeORM previene injection
const user = await repo.find({ where: { email } });

// ❌ NO SEGURO - Raw query
const user = await query(`SELECT * FROM users WHERE email = '${email}'`);
```

### Cross-Site Scripting (XSS)

**Prevenido por:**
- Validación en DTOs
- class-validator sanitiza inputs
- Angular/React escapa outputs

### Cross-Site Request Forgery (CSRF)

**Prevenido por:**
- Tokens JWT (no cookies con credenciales)
- CORS policy
- Origin headers

---

**Última actualización:** 2026-06-07
**Nivel de Seguridad:** Desarrollo ✅ / Producción 🔄 (En Progreso)
