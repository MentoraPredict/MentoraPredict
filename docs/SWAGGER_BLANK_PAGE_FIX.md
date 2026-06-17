# 🔧 Fix: Swagger UI Mostrando Página en Blanco

## El Problema

Cuando accedes a Swagger UI en el navegador, ves una **página completamente en blanco** en lugar de la interfaz normal de Swagger.

## ✅ Solución (3 Pasos Rápidos)

### **Paso 1: Verifica el archivo `.env`**

Abre `infra/.env` y busca la línea `SWAGGER_SERVER_URL`. Debe estar así:

```env
# ─── Swagger UI ──────────────────────────────────────────────
SWAGGER_SERVER_URL=http://localhost:8000
```

Si **no existe esa línea**, agrégala en la sección de CORS.

### **Paso 2: Reinicia los contenedores**

```bash
# Detén todos los contenedores
docker compose down

# Inicia nuevamente
docker compose up -d
```

Espera ~10 segundos para que los servicios se inicien.

### **Paso 3: Accede a Swagger**

Abre en tu navegador:
```
http://localhost:3001/api/docs
```

**Deberías ver ahora la interfaz normal de Swagger** con la lista de endpoints.

---

## ❓ ¿Por qué pasaba esto?

La variable de entorno `SWAGGER_SERVER_URL` estaba mal configurada o no estaba establecida. El código en `services/auth-service/src/main.ts` usa esta variable para decirle a Swagger cuál es la URL del servidor API.

**Sin la variable correcta:** Swagger UI se renderiza pero no sabe dónde apuntar las peticiones → Página en blanco.

**Con la variable correcta:** Swagger UI funciona correctamente y puede comunicarse con la API.

---

## 📍 URLs Correctas para Desarrollo Local

```
Auth Service:     http://localhost:3001/api/docs
User Service:     http://localhost:3002/api/docs
Academic Service: http://localhost:3003/api/docs
Analytics Service: http://localhost:3004/api/docs
```

---

## 🚨 Si Sigue en Blanco

Intenta estos pasos adicionales:

### **1. Verifica que el contenedor está corriendo:**
```bash
docker ps | grep auth-service
```

Deberías ver una línea con `mp_dev_auth_service`.

### **2. Revisa los logs del contenedor:**
```bash
docker logs mp_dev_auth_service
```

Busca mensajes de error sobre `SWAGGER_SERVER_URL`.

### **3. Prueba con cURL:**
```bash
curl -s http://localhost:3001/api/docs | head -50
```

Si ves HTML con `<!DOCTYPE html>` y contenido de Swagger, el servidor está sirviendo la página correctamente.

### **4. Limpia caché del navegador:**
- Presiona `Ctrl+Shift+Delete` (o `Cmd+Shift+Delete` en Mac)
- Borra cookies y caché
- Abre nuevamente `http://localhost:3001/api/docs`

---

## ✨ Cuando Funciona Correctamente

- ✅ Ves la interfaz de Swagger con logo y tema
- ✅ En la esquina superior derecha aparece un botón "**Authorize**"
- ✅ Se listan todos los endpoints en la página
- ✅ Puedes hacer clic en endpoints para expandirlos

---

## 🎯 Próximo Paso

Una vez que Swagger UI se cargue correctamente, ve a [SWAGGER_UI_GUIDE.md](./SWAGGER_UI_GUIDE.md) para aprender cómo **obtener y usar un JWT token en Swagger**.

---

**Última actualización:** 2025-01-15  
**Problema Resuelto:** ✅ Sí
