# 🌐 Guía: Configurar URL del Backend

## ❓ ¿Qué URL debo usar?

### 📊 Diagrama de Decisión

```
┌─────────────────────────────────────────┐
│ ¿Tienes un dominio?                     │
└────────────┬────────────────────────────┘
             │
      ┌──────┴──────┐
      │             │
     SÍ            NO
      │             │
      │             └──> Usa IP del servidor
      │                  http://123.456.789.012:4004/api
      │
      ▼
┌─────────────────────────────────────────┐
│ ¿Frontend y Backend en mismo servidor?  │
└────────────┬────────────────────────────┘
             │
      ┌──────┴──────┐
      │             │
     SÍ            NO
      │             │
      │             └──> Usa URL del servidor backend
      │                  https://servidor-backend.com/api
      │
      ▼
  Usa tu dominio
  https://tudominio.com/api
```

---

## 📝 Ejemplos Según tu Caso

### **CASO 1: Mismo Servidor + Dominio (MÁS COMÚN) ✅**

**Situación:**
- Frontend y backend en el mismo servidor
- Tienes dominio: `farmacia-gs.com`
- Nginx hace proxy reverso

**Configuración:**
```env
VITE_API_URL=https://farmacia-gs.com/api
```

**Cómo funciona:**
```
Usuario → https://farmacia-gs.com/
         ↓
      Nginx (puerto 80/443)
         ↓
    ┌────┴────┐
    │         │
Frontend   Backend
(archivos) (puerto 4004)
```

---

### **CASO 2: Mismo Servidor + IP (Sin dominio aún)**

**Situación:**
- No tienes dominio todavía
- Accedes por IP: `192.168.1.100`

**Configuración:**
```env
VITE_API_URL=http://192.168.1.100:4004/api
```

⚠️ **Temporal**: Configura un dominio y HTTPS pronto.

---

### **CASO 3: Subdominio para API**

**Situación:**
- Frontend: `farmacia-gs.com`
- Backend: `api.farmacia-gs.com`

**Configuración:**
```env
VITE_API_URL=https://api.farmacia-gs.com/api
```

**Requiere:**
- Configurar DNS para `api.farmacia-gs.com`
- Certificado SSL para el subdominio

---

### **CASO 4: Servidores Separados**

**Situación:**
- Frontend en: `farmacia-gs.com`
- Backend en: `backend-server.com`

**Configuración:**
```env
VITE_API_URL=https://backend-server.com/api
```

**Importante:**
- Configurar CORS en el backend para permitir `farmacia-gs.com`

---

## 🔍 Verificar tu Configuración

### Paso 1: Identifica tu dominio/IP

```bash
# Si tienes dominio
ping tudominio.com

# Si usas IP
ip addr show  # En el servidor
```

### Paso 2: Verifica que el backend esté corriendo

```bash
# En el servidor
curl http://localhost:4004/api/health
# o
curl http://localhost:4004/api/
```

### Paso 3: Prueba la URL completa

```bash
# Con dominio
curl https://tudominio.com/api/health

# Con IP
curl http://tu-ip:4004/api/health
```

---

## 📋 Checklist de Configuración

- [ ] Identificar si tengo dominio o solo IP
- [ ] Verificar si frontend y backend están en el mismo servidor
- [ ] Decidir la URL correcta según mi caso
- [ ] Editar `.env.production` con la URL correcta
- [ ] Reconstruir el frontend: `npm run build`
- [ ] Comprimir: `Compress-Archive -Path dist\* -DestinationPath farmacia-gs-frontend-final.zip -Force`
- [ ] Subir al servidor
- [ ] Probar en el navegador

---

## ⚙️ Configuración de Nginx (Importante)

Si usas el **CASO 1** (mismo servidor), tu Nginx debe tener:

```nginx
# Frontend
location / {
    root /var/www/farmacia-gs/frontend;
    try_files $uri $uri/ /index.html;
}

# Backend API - Proxy Reverso
location /api {
    proxy_pass http://localhost:4004;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Esto hace que:
- `https://tudominio.com/` → Frontend
- `https://tudominio.com/api` → Backend (puerto 4004)

---

## 🐛 Solución de Problemas

### Error: "Failed to fetch" o "Network Error"

**Causa:** URL incorrecta o backend no accesible

**Solución:**
1. Verifica que el backend esté corriendo: `pm2 status`
2. Prueba la URL directamente: `curl https://tudominio.com/api/health`
3. Revisa los logs: `pm2 logs farmacia-backend`

### Error: "CORS policy"

**Causa:** Backend no permite peticiones desde tu dominio

**Solución:**
Edita el `.env` del backend:
```env
CORS_ORIGIN=https://tudominio.com
```

Reinicia el backend:
```bash
pm2 restart farmacia-backend
```

### Error: "SSL certificate problem"

**Causa:** Certificado SSL no configurado o inválido

**Solución:**
```bash
sudo certbot --nginx -d tudominio.com
sudo systemctl reload nginx
```

---

## 💡 Recomendaciones

1. **Usa HTTPS siempre en producción**
   - Configura SSL con Let's Encrypt (gratis)
   - Nunca uses HTTP en producción

2. **Mismo servidor es más simple**
   - Menos configuración
   - Nginx maneja todo
   - Un solo certificado SSL

3. **Documenta tu configuración**
   - Guarda la URL que usaste
   - Documenta cualquier cambio

4. **Prueba antes de desplegar**
   - Verifica que el backend responda
   - Prueba con curl o Postman

---

## 📞 Ejemplos Reales

### Ejemplo 1: Farmacia Local
```env
VITE_API_URL=https://farmacia-local.com/api
```

### Ejemplo 2: Desarrollo con IP
```env
VITE_API_URL=http://192.168.1.50:4004/api
```

### Ejemplo 3: Producción con subdominio
```env
VITE_API_URL=https://api.farmacia-gs.com/api
```

---

## ✅ Resumen Rápido

**Para la mayoría de casos:**
```env
VITE_API_URL=https://TU-DOMINIO-AQUI.com/api
```

**Reemplaza `TU-DOMINIO-AQUI.com` con:**
- Tu dominio real (ej: `farmacia-gs.com`)
- O tu IP si no tienes dominio (ej: `192.168.1.100:4004`)

**Después de editar:**
```bash
npm run build
Compress-Archive -Path dist\* -DestinationPath farmacia-gs-frontend-final.zip -Force
```

¡Listo para desplegar! 🚀
