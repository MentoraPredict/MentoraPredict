# Configuración Inicial del Proyecto

## 📋 Requisitos del Sistema

### Mínimos

- Node.js 18.x o superior
- npm 9.x o superior
- Git 2.x

### Recomendados

- Node.js 20.x LTS
- npm 10.x
- IDE: VS Code con extensiones
- Terminal: PowerShell o bash

---

## 🔧 Instalación de Dependencias

### 1. Instalar Node.js

**Windows:**
```bash
# Descargar desde https://nodejs.org/
# O usar chocolatey
choco install nodejs
```

**macOS:**
```bash
brew install node
```

**Linux:**
```bash
sudo apt-get install nodejs npm
```

### 2. Verificar Instalación

```bash
node --version    # v20.x.x
npm --version     # 10.x.x
```

---

## 🐳 Configurar Docker (Infraestructura)

### 1. Instalar Docker

**Windows:**
```bash
# Descargar Docker Desktop desde https://www.docker.com/products/docker-desktop
```

**macOS:**
```bash
brew install --cask docker
```

### 2. Verificar Docker

```bash
docker --version
docker ps
```

### 3. Iniciar Servicios

```bash
# Navegar a raíz del proyecto
cd mentorapredict

# Iniciar PostgreSQL y Redis
docker-compose -f docker-compose.dev.yml up -d

# Verificar servicios
docker ps
```

---

## 💾 Configurar Base de Datos

### 1. Esperar a que PostgreSQL esté listo

```bash
# Ver logs
docker logs mentorapredict_postgres

# Esperar mensaje: "database system is ready to accept connections"
```

### 2. Conectarse a PostgreSQL

```bash
# Desde el contenedor
docker exec -it mentorapredict_postgres psql -U mp_user -d mentorapredict

# O desde cliente local (psql debe estar instalado)
psql -h localhost -U mp_user -d mentorapredict
```

### 3. Verificar Base de Datos

```sql
-- Dentro de psql
\dt                -- Listar tablas
SELECT * FROM users;  -- Debería estar vacía inicialmente
\q                -- Salir
```

---

## 📦 Clonar y Configurar Proyecto

### 1. Clonar Repositorio

```bash
git clone https://github.com/tu-usuario/mentorapredict.git
cd mentorapredict
```

### 2. Instalar Dependencias Root

```bash
npm install

# Esto instala dependencias de:
# - Root
# - Todos los servicios en /services
# - Todos los packages en /packages
```

### 3. Configurar Variables de Entorno

**auth-service:**
```bash
cd services/auth-service

# Copiar template
cp .env.example .env

# Editar .env
# NODE_ENV=development
# APP_PORT=3001
# POSTGRES_HOST=localhost
# POSTGRES_PORT=5432
# POSTGRES_USER=mp_user
# POSTGRES_PASSWORD=mp_pass
# POSTGRES_DB=mentorapredict
# REDIS_HOST=localhost
# REDIS_PORT=6379
# JWT_SECRET=dev-secret-change-in-prod-min-32-chars
# CORS_ORIGINS=http://localhost:3000

cd ../..
```

**academic-service:**
```bash
cd services/academic-service

cp .env.example .env

# Editar .env (similar a auth-service)
# APP_PORT=3003

cd ../..
```

---

## 🚀 Compilar y Ejecutar

### 1. Compilar Todos los Servicios

```bash
npm run build

# O compilar individual
cd services/auth-service
npm run build
cd ../..
```

### 2. Iniciar Servicios

**Opción A: Todos a la vez**
```bash
npm run dev
```

**Opción B: Individual en terminales separadas**

Terminal 1 - Auth Service:
```bash
cd services/auth-service
npm run dev
# Ver: auth-service running on http://localhost:3001
```

Terminal 2 - Academic Service:
```bash
cd services/academic-service
npm run dev
# Ver: academic-service running on http://localhost:3003
```

---

## ✅ Verificar Instalación

### 1. Health Check - Auth Service

```bash
curl http://localhost:3001/health

# Respuesta esperada:
# {"status":"UP","services":{"database":"UP","redis":"UP"}}
```

### 2. Health Check - Academic Service

```bash
curl http://localhost:3003/health

# Respuesta esperada:
# {"status":"UP","services":{"database":"UP"}}
```

### 3. Swagger Documentation

Abrir en navegador:
- Auth Service: http://localhost:3001/api/docs
- Academic Service: http://localhost:3003/api/docs

### 4. Realizar Test de Registro

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@uce.edu.ec",
    "password": "TestPass123!",
    "firstName": "Test",
    "lastName": "User"
  }'

# Respuesta esperada: Usuario creado con ID
```

---

## 🛑 Detener Servicios

```bash
# Detener Docker
docker-compose -f docker-compose.dev.yml down

# Detener procesos Node
# Presionar Ctrl+C en cada terminal
```

---

## 🔄 Limpiar y Resetear

### Resetear Base de Datos

```bash
# Eliminar contenedor PostgreSQL
docker rm mentorapredict_postgres

# Eliminar volumen de datos
docker volume rm mentorapredict_pgdata

# Reiniciar
docker-compose -f docker-compose.dev.yml up -d
```

### Limpiar node_modules

```bash
# En raíz del proyecto
rm -rf node_modules package-lock.json

# En cada servicio
cd services/auth-service && rm -rf node_modules && cd ../..
cd services/academic-service && rm -rf node_modules && cd ../..

# Reinstalar
npm install
npm run build
```

---

## 🐛 Problemas Comunes

### Puerto 3001 ya está en uso

```bash
# Encontrar proceso
lsof -i :3001

# Matar proceso
kill -9 <PID>

# O cambiar puerto en .env
APP_PORT=3011
```

### PostgreSQL no conecta

```bash
# Verificar Docker está corriendo
docker ps

# Verificar logs
docker logs mentorapredict_postgres

# Reiniciar
docker-compose down
docker-compose up -d
```

### node_modules corruptos

```bash
# Limpiar completamente
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm run build
```

---

## 📚 Próximos Pasos

1. Leer [ARCHITECTURE.md](./ARCHITECTURE.md)
2. Explorar [SERVICES.md](./SERVICES.md)
3. Revisar documentación específica de servicios
4. Ejecutar los ejemplos en [API.md](./API.md)
5. Empezar a desarrollar con [DEVELOPMENT.md](./DEVELOPMENT.md)

---

## 📞 Ayuda

Si encuentra problemas:
1. Ver [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Revisar logs: `docker logs <container-name>`
3. Ejecutar health checks arriba
4. Abrir issue en GitHub

---

**Última actualización:** 2026-06-07
