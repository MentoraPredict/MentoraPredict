# 🚀 Deployment Guide — MentoraPredict en Producción

## 📋 Resumen Rápido

Este documento explica cómo desplegar MentoraPredict en **producción** en `https://mentorapredictqa.programacionwebuce.net` usando Docker Compose.

---

## 🔧 Configuración Necesaria

### **1. Variables de Entorno**

Copia el archivo de ejemplo y llenalo con datos reales:

```bash
cp infra/.env.prod.example .env.prod
# O si usas .env directamente:
cp infra/.env.prod.example .env
```

**Variables críticas para Swagger:**

```env
# Desarrollo local
SWAGGER_SERVER_URL=http://localhost:8000

# Producción
SWAGGER_SERVER_URL=https://mentorapredictqa.programacionwebuce.net
```

**Otras variables críticas:**

```env
NODE_ENV=production
POSTGRES_PASSWORD=CAMBIAR_EN_PRODUCCION
REDIS_PASSWORD=CAMBIAR_EN_PRODUCCION
MONGO_PASSWORD=CAMBIAR_EN_PRODUCCION
CORS_ORIGINS=https://mentorapredictqa.programacionwebuce.net,https://www.mentorapredictqa.programacionwebuce.net
LOG_LEVEL=warn
```

### **2. Claves JWT**

Las claves RSA deben estar en `infra/keys/`:

```bash
# Si no existen, generarlas:
cd infra/kong
bash generate-keys.sh
```

Verifica que existan:
```bash
ls -la infra/keys/
# Debe mostrar: private.pem, public.pem
```

---

## 🐳 Deployment con Docker Compose

### **Opción A: Usando docker-compose.prod.yml**

```bash
# 1. Ir al directorio del proyecto
cd MentoraPredict

# 2. Crear/actualizar .env con valores de producción
nano .env  # o .env.prod

# 3. Desplegar
docker compose -f docker-compose.prod.yml up -d

# 4. Verificar estado
docker compose -f docker-compose.prod.yml ps
```

### **Opción B: Usando docker-compose.yml con --env-file**

```bash
docker compose --env-file .env -f docker-compose.prod.yml up -d
```

---

## ✅ Verificación Post-Deployment

### **1. Chequear que los servicios estén corriendo:**

```bash
docker compose -f docker-compose.prod.yml ps
```

Deberías ver:
```
NAME                STATUS
mp_auth_service     Up (healthy)
mp_academic_service Up (healthy)
mp_web              Up (healthy)
```

### **2. Acceder a Swagger UI:**

- **Auth Service:** `https://mentorapredictqa.programacionwebuce.net/api/docs`
- **Academic Service:** `https://mentorapredictqa.programacionwebuce.net/api/docs` (si está expuesto en Kong)

**Nota:** Esto depende de cómo esté configurado Kong en tu servidor proxy.

### **3. Prueba de Health Check:**

```bash
curl -i https://mentorapredictqa.programacionwebuce.net/health
# Debe retornar 200 OK
```

### **4. Prueba de Login:**

```bash
curl -X POST https://mentorapredictqa.programacionwebuce.net/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@example.com","password":"password123"}'

# Debe retornar un accessToken
```

---

## 🔐 Configuración de HTTPS

**En producción, HTTPS es obligatorio.** Usa **Nginx** o **Caddy** como proxy inverso:

### **Usando Nginx:**

```nginx
server {
    listen 443 ssl http2;
    server_name mentorapredictqa.programacionwebuce.net;

    ssl_certificate /etc/letsencrypt/live/mentorapredictqa.programacionwebuce.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mentorapredictqa.programacionwebuce.net/privkey.pem;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/docs {
        proxy_pass http://localhost:3001/api/docs;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name mentorapredictqa.programacionwebuce.net;
    return 301 https://$server_name$request_uri;
}
```

### **Generar Certificado con Let's Encrypt:**

```bash
sudo certbot certonly --standalone \
  -d mentorapredictqa.programacionwebuce.net \
  --email admin@example.com
```

---

## 📊 Estructura de Puertos

| Servicio | Puerto Interno | Expuesto | URL |
|----------|----------------|----------|-----|
| **Kong Proxy** | 8000 | Sí (via Nginx:443) | https://mentorapredictqa.programacionwebuce.net |
| **Kong Admin** | 8001 | No (solo localhost) | http://localhost:8001 |
| **Auth Service** | 3001 | No (solo Kong) | http://localhost:3001/api/docs |
| **Academic Service** | 3003 | No (solo Kong) | http://localhost:3003/api/docs |
| **PostgreSQL** | 5432 | No (solo Docker network) | postgres:5432 |
| **Redis** | 6379 | No (solo Docker network) | redis:6379 |
| **MongoDB** | 27017 | No (solo Docker network) | mongo:27017 |

---

## 🔄 Mantenimiento

### **Ver logs:**

```bash
# Todos los servicios
docker compose -f docker-compose.prod.yml logs -f

# Servicio específico
docker compose -f docker-compose.prod.yml logs -f mp_auth_service
```

### **Reiniciar servicios:**

```bash
# Un servicio
docker compose -f docker-compose.prod.yml restart mp_auth_service

# Todos
docker compose -f docker-compose.prod.yml restart
```

### **Detener deployment:**

```bash
docker compose -f docker-compose.prod.yml down
```

### **Actualizar imágenes:**

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

---

## 🚨 Troubleshooting

### **Problema: Swagger muestra página en blanco**

**Solución:**
1. Verifica que `SWAGGER_SERVER_URL` en `.env` sea `https://mentorapredictqa.programacionwebuce.net`
2. Reinicia los servicios: `docker compose -f docker-compose.prod.yml restart`

### **Problema: 401 Unauthorized en endpoints**

**Solución:**
1. Verifica que Kong está funcionando: `curl -i http://localhost:8001/health`
2. Verifica que las claves JWT están presentes: `ls -la infra/keys/`
3. Revisa logs: `docker compose -f docker-compose.prod.yml logs kong`

### **Problema: CORS error**

**Solución:**
Verifica `CORS_ORIGINS` en `.env`:
```env
CORS_ORIGINS=https://mentorapredictqa.programacionwebuce.net,https://www.mentorapredictqa.programacionwebuce.net
```

### **Problema: Base de datos no conecta**

**Solución:**
1. Verifica credenciales en `.env`: `POSTGRES_PASSWORD`, `POSTGRES_HOST`
2. Verifica que PostgreSQL está corriendo: `docker compose -f docker-compose.prod.yml ps postgres`
3. Revisa logs: `docker compose -f docker-compose.prod.yml logs postgres`

---

## 📝 Checklist de Deployment

- [ ] Variables de entorno configuradas (`.env` o `.env.prod`)
- [ ] Claves JWT generadas (`infra/keys/private.pem`, `infra/keys/public.pem`)
- [ ] `SWAGGER_SERVER_URL` = `https://mentorapredictqa.programacionwebuce.net`
- [ ] `CORS_ORIGINS` incluye dominio de producción
- [ ] Certificado HTTPS instalado (Let's Encrypt o propio)
- [ ] Nginx/proxy inverso configurado
- [ ] Logs verificados para errores
- [ ] Health check responde: `curl https://mentorapredictqa.programacionwebuce.net/health`
- [ ] Login funciona y retorna token
- [ ] Swagger UI carga correctamente

---

**Última actualización:** 2025-01-15  
**Estado:** ✅ Listo para producción
