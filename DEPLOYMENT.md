# 🌐 Guía de Deployment - Farmacia GS

## 🎯 Opciones de Deployment

### 1. **Servidor VPS/Dedicado (Recomendado para Producción)**
- **Ventajas:** Control total, mejor rendimiento, datos privados
- **Costos:** $10-50/mes
- **Proveedores:** DigitalOcean, Linode, AWS EC2, Google Cloud

### 2. **Hosting Compartido con Node.js**
- **Ventajas:** Más barato, fácil setup
- **Costos:** $5-20/mes
- **Proveedores:** Hostinger, A2 Hosting, InMotion

### 3. **Plataformas Cloud (Desarrollo/Testing)**
- **Ventajas:** Deploy rápido, escalable
- **Costos:** Gratis/limitado, luego $10-30/mes
- **Proveedores:** Vercel, Netlify, Railway, Render

## 🚀 Método 1: VPS Ubuntu (Paso a Paso)

### Paso 1: Preparar el Servidor
```bash
# Conectar al servidor via SSH
ssh root@tu-servidor-ip

# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependencias básicas
sudo apt install -y curl wget git unzip
```

### Paso 2: Instalar Node.js 20
```bash
# Agregar repositorio NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Instalar Node.js
sudo apt install -y nodejs

# Verificar instalación
node --version  # Debe mostrar v20.x.x
npm --version
```

### Paso 3: Instalar PostgreSQL
```bash
# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Iniciar servicio
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Configurar usuario y base de datos
sudo -u postgres psql << EOF
CREATE USER farmacia_user WITH PASSWORD 'password_seguro_aqui';
CREATE DATABASE farmaciagsdb OWNER farmacia_user;
GRANT ALL PRIVILEGES ON DATABASE farmaciagsdb TO farmacia_user;
\q
EOF
```

### Paso 4: Clonar y Configurar Proyecto
```bash
# Ir al directorio web
cd /var/www

# Clonar repositorio
sudo git clone https://github.com/AkikoToKatsumi/FarmaciGS.git
cd FarmaciGS

# Cambiar permisos
sudo chown -R $USER:$USER /var/www/FarmaciGS
```

### Paso 5: Configurar Backend
```bash
cd backend

# Instalar dependencias
npm ci --only=production

# Crear archivo de configuración
nano .env
```

**Contenido del archivo .env:**
```env
NODE_ENV=production
PORT=4004
DB_HOST=localhost
DB_PORT=5432
DB_NAME=farmaciagsdb
DB_USER=farmacia_user
DB_PASSWORD=password_seguro_aqui
JWT_SECRET=12345
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_password_app
FRONTEND_URL=https://tu-dominio.com
```

### Paso 6: Importar Base de Datos
```bash
# Desde el directorio raíz del proyecto
sudo -u postgres psql -d farmaciagsdb -f farmaciagsdb.sql
```

### Paso 7: Build del Frontend
```bash
cd ../desktop-app

# Instalar dependencias
npm ci

# Crear build de producción
npm run build
```

### Paso 8: Instalar PM2
```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Configurar PM2 para el backend
cd ../backend

# Iniciar aplicación
pm2 start ecosystem.config.js --env production

# Guardar configuración
pm2 save

# Configurar inicio automático
pm2 startup
# Ejecutar el comando que PM2 te muestre
```

### Paso 9: Instalar y Configurar Nginx
```bash
# Instalar Nginx
sudo apt install -y nginx

# Crear configuración del sitio
sudo nano /etc/nginx/sites-available/farmacia
```

**Configuración de Nginx:**
```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    # Frontend
    location / {
        root /var/www/FarmaciGS/desktop-app/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Cache para archivos estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API Backend
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
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/farmacia /etc/nginx/sites-enabled/

# Desactivar sitio por defecto
sudo rm /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Paso 10: Configurar SSL con Let's Encrypt
```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Verificar renovación automática
sudo certbot renew --dry-run
```

### Paso 11: Configurar Firewall
```bash
# Habilitar firewall
sudo ufw enable

# Permitir SSH
sudo ufw allow ssh

# Permitir HTTP y HTTPS
sudo ufw allow 'Nginx Full'

# Verificar estado
sudo ufw status
```

## 🚀 Método 2: Script Automatizado

**¡Más fácil!** Usa el script que creamos:

```bash
# Descargar y ejecutar script
wget https://raw.githubusercontent.com/AkikoToKatsumi/FarmaciGS/main/deploy.sh
chmod +x deploy.sh
sudo ./deploy.sh
```

## 🌐 Método 3: Deployment Cloud (Railway)

### Para el Backend:
1. Ve a [Railway.app](https://railway.app)
2. Conecta tu cuenta de GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Selecciona `FarmaciGS`
5. Railway detectará automáticamente el backend
6. Agrega las variables de entorno:
   ```
   NODE_ENV=production
   PORT=4004
   DATABASE_URL=postgresql://user:pass@host:port/db
   JWT_SECRET=tu_jwt_secret
   ```
7. Deploy automático

### Para el Frontend:
1. Ve a [Vercel.com](https://vercel.com)
2. "New Project" → Import Git Repository
3. Selecciona la carpeta `desktop-app`
4. Configurar build:
   ```
   Build Command: npm run build
   Output Directory: dist
   ```
5. Agrega variable de entorno:
   ```
   VITE_API_URL=https://tu-backend.railway.app
   ```

## 🛠️ Configuración del Dominio

### Paso 1: Comprar Dominio
- **Registradores:** Namecheap, GoDaddy, Google Domains
- **Costo:** $10-15/año

### Paso 2: Configurar DNS
En tu panel de dominio, agrega estos registros:

```
Tipo: A
Nombre: @
Valor: IP_DE_TU_SERVIDOR

Tipo: A  
Nombre: www
Valor: IP_DE_TU_SERVIDOR

Tipo: CNAME
Nombre: api
Valor: tu-dominio.com
```

### Paso 3: Verificar Propagación
```bash
# Verificar que el dominio apunta a tu servidor
nslookup tu-dominio.com
ping tu-dominio.com
```

## 📊 Monitoreo y Mantenimiento

### Comandos Útiles:
```bash
# Ver logs de la aplicación
pm2 logs farmacia-backend

# Reiniciar aplicación
pm2 restart farmacia-backend

# Ver estado de servicios
sudo systemctl status nginx
sudo systemctl status postgresql

# Ver logs de Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Backup manual de BD
pg_dump -h localhost -U farmacia_user farmaciagsdb > backup_$(date +%Y%m%d).sql
```

### Actualizaciones:
```bash
cd /var/www/FarmaciGS

# Descargar última versión
git pull origin main

# Actualizar backend
cd backend
npm ci --only=production
pm2 restart farmacia-backend

# Actualizar frontend
cd ../desktop-app
npm ci
npm run build
sudo systemctl reload nginx
```

## 🔒 Consideraciones de Seguridad

1. **Cambiar contraseñas por defecto**
2. **Configurar SSL/HTTPS**
3. **Actualizar sistema regularmente**
4. **Configurar backups automáticos**
5. **Monitorear logs de acceso**
6. **Restringir acceso SSH por IP**

## 📞 Soporte

Si necesitas ayuda:
1. Revisa los logs: `pm2 logs`
2. Verifica servicios: `systemctl status nginx postgresql`
3. Contacta soporte técnico de UCATECI/INFOTEP

¡Tu sistema Farmacia GS estará funcionando en producción! 🎉
