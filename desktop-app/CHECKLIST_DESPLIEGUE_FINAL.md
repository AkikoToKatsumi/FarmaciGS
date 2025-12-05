# ✅ CHECKLIST FINAL DE DESPLIEGUE - Farmacia GS

## 📦 ARCHIVOS LISTOS PARA DESPLEGAR

### Frontend (Ya compilado)
- ✅ `farmacia-gs-frontend-final.zip` - **ESTE ES EL ARCHIVO PARA SUBIR AL SERVIDOR**
- ✅ Carpeta `dist/` - Archivos compilados y optimizados
- ✅ Tamaño total: ~2MB comprimido, ~5MB descomprimido
- ✅ Build exitoso sin errores

### Backend
- ⚠️ **IMPORTANTE**: El backend debe estar en `c:\Farmacia GS\backend`
- ⚠️ Asegúrate de tener el archivo `.env` configurado en el backend

---

## 🔧 CONFIGURACIÓN ACTUAL

### Variables de Entorno (.env.production)
```
VITE_API_URL=https://tu-backend.com/api
```

⚠️ **ANTES DE DESPLEGAR**: Edita `.env.production` y cambia `https://tu-backend.com/api` por la URL real de tu servidor.

### API Configuration (src/services/api.ts)
- ✅ Configurado para usar variables de entorno
- ✅ Fallback a localhost para desarrollo

---

## 📋 PASOS PARA DESPLEGAR EN SERVIDOR PROPIO

### PASO 1: Preparar el Servidor
```bash
# Conectarse al servidor
ssh usuario@tu-servidor.com

# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependencias
sudo apt install -y nodejs npm postgresql nginx
sudo npm install -g pm2
```

### PASO 2: Configurar PostgreSQL
```bash
# Acceder a PostgreSQL
sudo -u postgres psql

# Crear base de datos y usuario
CREATE DATABASE farmacia_gs;
CREATE USER farmacia_user WITH ENCRYPTED PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE farmacia_gs TO farmacia_user;
\q
```

### PASO 3: Subir y Configurar Backend
```bash
# Crear directorio
sudo mkdir -p /var/www/farmacia-gs/backend
sudo chown -R $USER:$USER /var/www/farmacia-gs

# Subir backend (desde tu PC)
scp -r "c:\Farmacia GS\backend" usuario@servidor:/var/www/farmacia-gs/

# En el servidor, configurar .env
cd /var/www/farmacia-gs/backend
nano .env
```

Contenido del `.env` del backend:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=farmacia_gs
DB_USER=farmacia_user
DB_PASSWORD=tu_password_seguro

PORT=4004
NODE_ENV=production

JWT_SECRET=tu_secreto_super_seguro_cambiar_esto
JWT_EXPIRES_IN=7d

CORS_ORIGIN=https://tudominio.com
```

```bash
# Instalar dependencias y compilar
npm install --production
npm run build  # Si tienes TypeScript

# Iniciar con PM2
pm2 start npm --name "farmacia-backend" -- start
pm2 save
pm2 startup
```

### PASO 4: Subir Frontend
```bash
# Desde tu PC, subir el archivo
scp farmacia-gs-frontend-final.zip usuario@servidor:/tmp/

# En el servidor
cd /var/www/farmacia-gs
mkdir -p frontend
cd frontend
unzip /tmp/farmacia-gs-frontend-final.zip
sudo chown -R www-data:www-data /var/www/farmacia-gs/frontend
```

### PASO 5: Configurar Nginx
```bash
sudo nano /etc/nginx/sites-available/farmacia-gs
```

Pega esta configuración (reemplaza `tudominio.com`):
```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tudominio.com www.tudominio.com;

    ssl_certificate /etc/letsencrypt/live/tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tudominio.com/privkey.pem;

    client_max_body_size 50M;

    # Frontend
    location / {
        root /var/www/farmacia-gs/frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:4004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activar configuración
sudo ln -s /etc/nginx/sites-available/farmacia-gs /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### PASO 6: Configurar SSL (HTTPS)
```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tudominio.com -d www.tudominio.com

# Seguir las instrucciones en pantalla
```

### PASO 7: Configurar Firewall
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## ✅ VERIFICACIÓN FINAL

### En el Servidor
```bash
# Verificar PostgreSQL
sudo systemctl status postgresql

# Verificar Backend
pm2 status
pm2 logs farmacia-backend

# Verificar Nginx
sudo systemctl status nginx
sudo nginx -t

# Probar API
curl http://localhost:4004/api/health
```

### En el Navegador
1. Visita `https://tudominio.com`
2. Verifica el certificado SSL (candado verde)
3. Prueba el login
4. Verifica todas las funcionalidades

---

## 📊 INFORMACIÓN DEL BUILD

### Archivos Generados
```
dist/index.html                          0.97 kB │ gzip:   0.46 kB
dist/assets/main-6sQjjW2o.css            1.78 kB │ gzip:   0.72 kB
dist/assets/purify.es-B6FQ9oRL.js       22.57 kB │ gzip:   8.74 kB
dist/assets/react-vendor-BSqpAEj4.js   141.38 kB │ gzip:  45.45 kB
dist/assets/index.es-CPtmr4TU.js       150.52 kB │ gzip:  51.45 kB
dist/assets/html2canvas.esm-BfxBtG_O.js 201.41 kB │ gzip:  48.03 kB
dist/assets/chart-vendor-zMnqkuAc.js   333.44 kB │ gzip:  99.38 kB
dist/assets/main-Bc4sZAbD.js         1,212.99 kB │ gzip: 375.90 kB
```

### Características
- ✅ Optimizado para producción
- ✅ Código minificado
- ✅ Assets comprimidos con gzip
- ✅ Imágenes incluidas
- ✅ Variables de entorno configuradas
- ✅ Sin errores de compilación

---

## 🔄 ACTUALIZACIONES FUTURAS

### Para actualizar el Frontend:
```bash
# En tu PC
cd "c:\Farmacia GS\desktop-app"
npm run build
Compress-Archive -Path dist\* -DestinationPath farmacia-gs-frontend-update.zip -Force

# Subir al servidor
scp farmacia-gs-frontend-update.zip usuario@servidor:/tmp/

# En el servidor
cd /var/www/farmacia-gs/frontend
rm -rf *
unzip /tmp/farmacia-gs-frontend-update.zip
sudo chown -R www-data:www-data /var/www/farmacia-gs/frontend
```

### Para actualizar el Backend:
```bash
# En el servidor
cd /var/www/farmacia-gs/backend
git pull  # Si usas Git
npm install --production
npm run build
pm2 restart farmacia-backend
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error 502 Bad Gateway
```bash
pm2 status
pm2 logs farmacia-backend
sudo systemctl restart nginx
```

### No se puede conectar a la base de datos
```bash
sudo systemctl status postgresql
psql -U farmacia_user -d farmacia_gs -h localhost
```

### Certificado SSL no funciona
```bash
sudo certbot renew
sudo systemctl reload nginx
```

---

## 📞 COMANDOS ÚTILES

```bash
# Ver logs del backend
pm2 logs farmacia-backend

# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log

# Reiniciar todo
sudo systemctl restart postgresql nginx
pm2 restart all

# Backup de base de datos
pg_dump -U farmacia_user farmacia_gs > backup_$(date +%Y%m%d).sql
```

---

## 📁 ARCHIVOS IMPORTANTES

### En tu PC (c:\Farmacia GS\desktop-app)
- `farmacia-gs-frontend-final.zip` - **Archivo para subir**
- `GUIA_SERVIDOR_PROPIO.md` - Guía detallada completa
- `.env.production` - Variables de entorno (editar antes de build)

### En el Servidor
- `/var/www/farmacia-gs/frontend/` - Frontend desplegado
- `/var/www/farmacia-gs/backend/` - Backend desplegado
- `/etc/nginx/sites-available/farmacia-gs` - Configuración Nginx
- `/var/backups/farmacia-gs/` - Backups de base de datos

---

## ✅ CHECKLIST FINAL ANTES DE DESPLEGAR

- [ ] Servidor preparado (Ubuntu, Node.js, PostgreSQL, Nginx)
- [ ] PostgreSQL configurado con base de datos y usuario
- [ ] Backend subido y configurado con .env correcto
- [ ] Backend corriendo con PM2
- [ ] Frontend subido (`farmacia-gs-frontend-final.zip`)
- [ ] Nginx configurado correctamente
- [ ] SSL/HTTPS configurado con Let's Encrypt
- [ ] Firewall configurado
- [ ] Dominio apuntando al servidor
- [ ] Pruebas realizadas y funcionando

---

## 🎉 ¡TODO LISTO!

Tu aplicación está completamente preparada para despliegue en servidor propio.

**Archivo principal para subir**: `farmacia-gs-frontend-final.zip`

**Próximo paso**: Seguir la `GUIA_SERVIDOR_PROPIO.md` paso a paso.

¡Buena suerte con tu despliegue! 🚀
