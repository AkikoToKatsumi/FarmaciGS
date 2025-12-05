# 🖥️ Guía de Despliegue en Servidor Propio - Farmacia GS

## 📋 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    SERVIDOR PROPIO                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Frontend   │  │   Backend    │  │  PostgreSQL  │ │
│  │   (React)    │  │   (Node.js)  │  │   Database   │ │
│  │   Puerto 80  │  │  Puerto 4004 │  │  Puerto 5432 │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│         │                 │                  │          │
│         └─────────────────┴──────────────────┘          │
│                    Nginx (Reverse Proxy)                │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Requisitos del Servidor

### Especificaciones Mínimas:
- **OS:** Ubuntu 20.04 LTS o superior (recomendado)
- **RAM:** 2GB mínimo, 4GB recomendado
- **CPU:** 2 cores
- **Disco:** 20GB mínimo
- **Acceso:** SSH con privilegios sudo

### Software Necesario:
- Node.js 18+ y npm
- PostgreSQL 14+
- Nginx
- PM2 (para gestión de procesos)
- Certbot (para SSL/HTTPS)

---

## 📦 PARTE 1: Preparar el Servidor

### 1.1 Conectarse al Servidor

```bash
ssh usuario@tu-servidor.com
# o
ssh usuario@IP_DEL_SERVIDOR
```

### 1.2 Actualizar el Sistema

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.3 Instalar Node.js y npm

```bash
# Instalar Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación
node --version
npm --version
```

### 1.4 Instalar PostgreSQL

```bash
# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Verificar que esté corriendo
sudo systemctl status postgresql

# Iniciar PostgreSQL si no está corriendo
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 1.5 Instalar Nginx

```bash
sudo apt install -y nginx

# Verificar instalación
sudo systemctl status nginx

# Iniciar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 1.6 Instalar PM2 (Gestor de Procesos)

```bash
sudo npm install -g pm2
```

---

## 🗄️ PARTE 2: Configurar PostgreSQL

### 2.1 Crear Usuario y Base de Datos

```bash
# Acceder a PostgreSQL
sudo -u postgres psql

# Dentro de PostgreSQL, ejecutar:
CREATE DATABASE farmacia_gs;
CREATE USER farmacia_user WITH ENCRYPTED PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE farmacia_gs TO farmacia_user;

# Salir
\q
```

### 2.2 Configurar Acceso Remoto (si es necesario)

```bash
# Editar postgresql.conf
sudo nano /etc/postgresql/14/main/postgresql.conf

# Buscar y cambiar:
listen_addresses = 'localhost'
# Por:
listen_addresses = '*'

# Editar pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Agregar al final:
host    all             all             0.0.0.0/0               md5

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

### 2.3 Restaurar Base de Datos (si tienes un backup)

```bash
# Si tienes un archivo .sql
psql -U farmacia_user -d farmacia_gs -f backup.sql

# Si tienes un dump
pg_restore -U farmacia_user -d farmacia_gs backup.dump
```

---

## 🚀 PARTE 3: Desplegar el Backend

### 3.1 Crear Directorio del Proyecto

```bash
sudo mkdir -p /var/www/farmacia-gs
sudo chown -R $USER:$USER /var/www/farmacia-gs
cd /var/www/farmacia-gs
```

### 3.2 Subir el Código del Backend

**Opción A: Usando Git (Recomendado)**

```bash
cd /var/www/farmacia-gs
git clone https://github.com/tu-usuario/farmacia-gs-backend.git backend
cd backend
```

**Opción B: Usando SCP/SFTP**

Desde tu computadora local:
```bash
# Comprimir el backend
cd "c:\Farmacia GS\backend"
tar -czf backend.tar.gz .

# Subir al servidor
scp backend.tar.gz usuario@servidor:/var/www/farmacia-gs/

# En el servidor, descomprimir
cd /var/www/farmacia-gs
tar -xzf backend.tar.gz -C backend
```

### 3.3 Configurar Variables de Entorno del Backend

```bash
cd /var/www/farmacia-gs/backend
nano .env
```

Contenido del `.env`:
```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=farmacia_gs
DB_USER=farmacia_user
DB_PASSWORD=tu_password_seguro

# Servidor
PORT=4004
NODE_ENV=production

# JWT
JWT_SECRET=tu_secreto_super_seguro_aqui_cambiar
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://tudominio.com

# Otros
API_URL=https://tudominio.com/api
```

### 3.4 Instalar Dependencias y Compilar

```bash
cd /var/www/farmacia-gs/backend
npm install --production
npm run build  # Si tienes TypeScript
```

### 3.5 Iniciar Backend con PM2

```bash
cd /var/www/farmacia-gs/backend

# Iniciar la aplicación
pm2 start npm --name "farmacia-backend" -- start

# O si tienes un archivo específico:
pm2 start dist/index.js --name "farmacia-backend"

# Guardar la configuración de PM2
pm2 save

# Configurar PM2 para iniciar al arrancar el servidor
pm2 startup
# Ejecutar el comando que PM2 te muestre
```

### 3.6 Verificar que el Backend Esté Corriendo

```bash
pm2 status
pm2 logs farmacia-backend

# Probar la API
curl http://localhost:4004/api/health
```

---

## 🎨 PARTE 4: Desplegar el Frontend

### 4.1 Preparar el Build del Frontend

**En tu computadora local:**

```bash
cd "c:\Farmacia GS\desktop-app"

# Actualizar la URL del API en .env.production
# Editar .env.production:
VITE_API_URL=https://tudominio.com/api

# Construir para producción
npm run build
```

### 4.2 Subir el Frontend al Servidor

**Opción A: Usando SCP**

Desde tu computadora local:
```bash
cd "c:\Farmacia GS\desktop-app"

# Comprimir la carpeta dist
tar -czf dist.tar.gz dist/

# Subir al servidor
scp dist.tar.gz usuario@servidor:/var/www/farmacia-gs/
```

**En el servidor:**
```bash
cd /var/www/farmacia-gs
mkdir -p frontend
tar -xzf dist.tar.gz -C frontend --strip-components=1
```

**Opción B: Usando Git**

```bash
cd /var/www/farmacia-gs
git clone https://github.com/tu-usuario/farmacia-gs-frontend.git frontend-src
cd frontend-src
npm install
npm run build
cp -r dist/* /var/www/farmacia-gs/frontend/
```

### 4.3 Configurar Permisos

```bash
sudo chown -R www-data:www-data /var/www/farmacia-gs/frontend
sudo chmod -R 755 /var/www/farmacia-gs/frontend
```

---

## 🌐 PARTE 5: Configurar Nginx

### 5.1 Crear Configuración de Nginx

```bash
sudo nano /etc/nginx/sites-available/farmacia-gs
```

**Contenido del archivo:**

```nginx
# Redirigir HTTP a HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name tudominio.com www.tudominio.com;
    
    # Redirigir todo el tráfico HTTP a HTTPS
    return 301 https://$server_name$request_uri;
}

# Configuración HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name tudominio.com www.tudominio.com;

    # Certificados SSL (se configurarán con Certbot)
    ssl_certificate /etc/letsencrypt/live/tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tudominio.com/privkey.pem;
    
    # Configuración SSL recomendada
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Logs
    access_log /var/log/nginx/farmacia-gs-access.log;
    error_log /var/log/nginx/farmacia-gs-error.log;

    # Tamaño máximo de archivos
    client_max_body_size 50M;

    # Frontend - Servir archivos estáticos
    location / {
        root /var/www/farmacia-gs/frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Headers de seguridad
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }

    # Backend API - Proxy reverso
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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Caché para archivos estáticos
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        root /var/www/farmacia-gs/frontend;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 5.2 Activar la Configuración

```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/farmacia-gs /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Si todo está bien, recargar Nginx
sudo systemctl reload nginx
```

---

## 🔒 PARTE 6: Configurar SSL/HTTPS con Let's Encrypt

### 6.1 Instalar Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 6.2 Obtener Certificado SSL

```bash
# Obtener certificado para tu dominio
sudo certbot --nginx -d tudominio.com -d www.tudominio.com

# Seguir las instrucciones:
# 1. Ingresar email
# 2. Aceptar términos
# 3. Elegir si compartir email (opcional)
# 4. Elegir redirección HTTPS (opción 2 - recomendado)
```

### 6.3 Configurar Renovación Automática

```bash
# Probar renovación
sudo certbot renew --dry-run

# Certbot configurará automáticamente un cron job
# Verificar:
sudo systemctl status certbot.timer
```

---

## 🔥 PARTE 7: Configurar Firewall

```bash
# Permitir SSH
sudo ufw allow OpenSSH

# Permitir HTTP y HTTPS
sudo ufw allow 'Nginx Full'

# Permitir PostgreSQL solo desde localhost (más seguro)
# Si necesitas acceso remoto:
# sudo ufw allow 5432/tcp

# Habilitar firewall
sudo ufw enable

# Verificar estado
sudo ufw status
```

---

## ✅ PARTE 8: Verificación y Pruebas

### 8.1 Verificar Servicios

```bash
# PostgreSQL
sudo systemctl status postgresql

# Backend (PM2)
pm2 status
pm2 logs farmacia-backend

# Nginx
sudo systemctl status nginx
sudo nginx -t
```

### 8.2 Probar la Aplicación

```bash
# Probar backend
curl https://tudominio.com/api/health

# Probar frontend
curl https://tudominio.com
```

### 8.3 Verificar en el Navegador

1. Abre `https://tudominio.com`
2. Verifica que el certificado SSL sea válido (candado verde)
3. Prueba el login
4. Verifica que todas las funcionalidades funcionen

---

## 📊 PARTE 9: Monitoreo y Mantenimiento

### 9.1 Comandos Útiles de PM2

```bash
# Ver logs en tiempo real
pm2 logs farmacia-backend

# Reiniciar aplicación
pm2 restart farmacia-backend

# Detener aplicación
pm2 stop farmacia-backend

# Ver uso de recursos
pm2 monit

# Ver información detallada
pm2 show farmacia-backend
```

### 9.2 Backup de Base de Datos

```bash
# Crear script de backup
sudo nano /usr/local/bin/backup-farmacia-db.sh
```

Contenido del script:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/farmacia-gs"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup de PostgreSQL
pg_dump -U farmacia_user farmacia_gs > $BACKUP_DIR/farmacia_gs_$DATE.sql

# Comprimir
gzip $BACKUP_DIR/farmacia_gs_$DATE.sql

# Eliminar backups antiguos (más de 7 días)
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completado: farmacia_gs_$DATE.sql.gz"
```

```bash
# Dar permisos de ejecución
sudo chmod +x /usr/local/bin/backup-farmacia-db.sh

# Configurar cron para backup diario a las 2 AM
sudo crontab -e

# Agregar:
0 2 * * * /usr/local/bin/backup-farmacia-db.sh
```

### 9.3 Logs de Nginx

```bash
# Ver logs de acceso
sudo tail -f /var/log/nginx/farmacia-gs-access.log

# Ver logs de errores
sudo tail -f /var/log/nginx/farmacia-gs-error.log
```

---

## 🔄 PARTE 10: Actualizar la Aplicación

### 10.1 Actualizar Backend

```bash
cd /var/www/farmacia-gs/backend

# Si usas Git
git pull origin main
npm install --production
npm run build

# Reiniciar con PM2
pm2 restart farmacia-backend
```

### 10.2 Actualizar Frontend

**En tu computadora local:**
```bash
cd "c:\Farmacia GS\desktop-app"
npm run build
scp -r dist/* usuario@servidor:/var/www/farmacia-gs/frontend/
```

**En el servidor:**
```bash
sudo chown -R www-data:www-data /var/www/farmacia-gs/frontend
```

No necesitas reiniciar Nginx, los cambios son inmediatos.

---

## 🐛 Solución de Problemas

### Backend no inicia
```bash
pm2 logs farmacia-backend
# Verificar errores de conexión a DB, puertos, etc.
```

### Error 502 Bad Gateway
```bash
# Verificar que el backend esté corriendo
pm2 status

# Verificar logs de Nginx
sudo tail -f /var/log/nginx/farmacia-gs-error.log
```

### No se puede conectar a PostgreSQL
```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Verificar conexión
psql -U farmacia_user -d farmacia_gs -h localhost
```

### Certificado SSL no funciona
```bash
# Renovar certificado
sudo certbot renew

# Verificar configuración de Nginx
sudo nginx -t
sudo systemctl reload nginx
```

---

## 📋 Checklist de Despliegue

- [ ] Servidor configurado y actualizado
- [ ] Node.js y npm instalados
- [ ] PostgreSQL instalado y configurado
- [ ] Base de datos creada y usuario configurado
- [ ] Nginx instalado
- [ ] PM2 instalado
- [ ] Backend desplegado y corriendo
- [ ] Frontend construido y desplegado
- [ ] Nginx configurado correctamente
- [ ] SSL/HTTPS configurado con Let's Encrypt
- [ ] Firewall configurado
- [ ] Backups automáticos configurados
- [ ] Aplicación probada y funcionando
- [ ] Dominio apuntando al servidor

---

## 📞 Comandos de Referencia Rápida

```bash
# Ver estado de todos los servicios
sudo systemctl status postgresql nginx
pm2 status

# Reiniciar todo
sudo systemctl restart postgresql nginx
pm2 restart all

# Ver logs
pm2 logs
sudo tail -f /var/log/nginx/error.log

# Backup manual
pg_dump -U farmacia_user farmacia_gs > backup_$(date +%Y%m%d).sql
```

---

¡Buena suerte con tu despliegue! 🚀
