# 🏥 Farmacia GS - Sistema de Gestión Farmacéutica

## 📋 Descripción
Sistema completo de gestión farmacéutica desarrollado por estudiantes de UCATECI para INFOTEP. Incluye gestión de inventario, ventas, clientes, recetas médicas, auditoría y reportes.

## 👨‍💻 Desarrolladores
- **Gabriela García** - Matrícula: 2023-0105
- **Dauris Santana** - Matrícula: 2023-0253
- **Institución:** Universidad Católica Tecnológica del Cibao (UCATECI)
- **Programa:** Ingeniería en Sistemas Computacionales

## 🛠️ Tecnologías Utilizadas

### Backend
- Node.js 18+
- TypeScript
- Express.js
- PostgreSQL 14+
- JWT Authentication
- PDFKit para generación de facturas
- Nodemailer para emails

### Frontend
- React 18
- TypeScript
- Vite
- Styled Components
- Axios
- Zustand (State Management)
- Lucide React (Icons)

### Base de Datos
- PostgreSQL 14+
- Schema con validaciones y constraints
- Auditoría completa
- Backup automático

## 📦 Requisitos del Sistema

### Requisitos Mínimos
- **Node.js:** v18.0.0 o superior
- **PostgreSQL:** v14.0 o superior
- **RAM:** 4GB mínimo
- **Almacenamiento:** 10GB disponible
- **Sistema Operativo:** Windows 10+, Ubuntu 20.04+, macOS 12+

### Requisitos Recomendados
- **Node.js:** v20.0.0
- **PostgreSQL:** v15.0
- **RAM:** 8GB
- **Almacenamiento:** 50GB SSD
- **CPU:** 4 cores

## 🚀 Instalación para Desarrollo

### 1. Clonar el Repositorio
```bash
git clone https://github.com/AkikoToKatsumi/FarmaciGS.git
cd FarmaciGS
```

### 2. Configurar Base de Datos
```bash
# Crear base de datos PostgreSQL
createdb farmaciagsdb

# Importar schema
psql -d farmaciagsdb -f farmaciagsdb.sql
```

### 3. Configurar Backend
```bash
cd backend
npm install
```

Crear archivo `.env`:
```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=farmaciagsdb
DB_USER=tu_usuario
DB_PASSWORD=tu_password

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui

# Email (Opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_password_app

# Puerto del servidor
PORT=4004
NODE_ENV=development
```

### 4. Configurar Frontend
```bash
cd ../desktop-app
npm install
```

### 5. Ejecutar en Desarrollo
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd desktop-app
npm run dev
```

## 🌐 Deployment en Producción

### Opción 1: Servidor VPS/Dedicado

#### 1. Preparar el Servidor
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y
sudo apt install nodejs npm postgresql nginx pm2 -y

# Configurar PostgreSQL
sudo -u postgres createuser --interactive farmacia_user
sudo -u postgres createdb farmaciagsdb -O farmacia_user
```

#### 2. Clonar y Configurar
```bash
cd /var/www
sudo git clone https://github.com/AkikoToKatsumi/FarmaciGS.git
sudo chown -R $USER:$USER FarmaciGS
cd FarmaciGS
```

#### 3. Build de Producción
```bash
# Backend
cd backend
npm ci --only=production
npm run build

# Frontend
cd ../desktop-app
npm ci
npm run build
```

#### 4. Configurar PM2
```bash
cd backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 5. Configurar Nginx
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    # Frontend
    location / {
        root /var/www/FarmaciGS/desktop-app/dist;
        try_files $uri $uri/ /index.html;
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

### Opción 2: Vercel + PlanetScale/Supabase

#### 1. Frontend en Vercel
```bash
cd desktop-app
vercel --prod
```

#### 2. Backend en Railway/Render
```bash
# En Railway o Render, conectar repositorio
# Configurar variables de entorno
# Deploy automático desde main branch
```

## 🔧 Configuración de Producción

### Variables de Entorno de Producción
```env
NODE_ENV=production
DB_HOST=tu_host_postgres
DB_PORT=5432
DB_NAME=farmaciagsdb
DB_USER=farmacia_user
DB_PASSWORD=password_seguro
JWT_SECRET=jwt_secret_super_seguro_256_bits
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=noreply@tu-dominio.com
EMAIL_PASSWORD=password_app
FRONTEND_URL=https://tu-dominio.com
```

### SSL/HTTPS con Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
sudo systemctl reload nginx
```

## 📊 Monitoreo y Mantenimiento

### Logs del Sistema
```bash
# Ver logs de PM2
pm2 logs

# Ver logs de Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Backup Automático
```bash
# Crear script de backup
sudo crontab -e

# Agregar backup diario a las 2:00 AM
0 2 * * * pg_dump farmaciagsdb > /backups/farmacia_$(date +\%Y\%m\%d).sql
```

### Actualizar Sistema
```bash
cd /var/www/FarmaciGS
git pull origin main
cd backend && npm ci --only=production && npm run build
cd ../desktop-app && npm ci && npm run build
pm2 restart all
```

## 🔒 Seguridad

### Firewall
```bash
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
```

### Base de Datos
- Cambiar passwords por defecto
- Configurar conexiones SSL
- Restringir acceso por IP
- Backups encriptados

## 📞 Soporte

Para soporte técnico contactar a través de UCATECI o INFOTEP.

## 📄 Licencia

Este software es propiedad intelectual de Gabriela García y Dauris Santana, donado exclusivamente a INFOTEP para fines educativos. Prohibida su venta o uso comercial no autorizado.

## 🏆 Agradecimientos

- Universidad Católica Tecnológica del Cibao (UCATECI)
- Instituto Nacional de Formación Técnico Profesional (INFOTEP)
- Comunidad de desarrollo open source

---
© 2025 Farmacia GS. Desarrollado con ❤️ para INFOTEP.
