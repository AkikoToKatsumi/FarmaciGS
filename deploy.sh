#!/bin/bash

# Script de deployment para Farmacia GS
# Este script automatiza el proceso de deployment en un servidor Ubuntu

set -e  # Salir si cualquier comando falla

echo "🚀 Iniciando deployment de Farmacia GS..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
PROJECT_DIR="/var/www/FarmaciGS"
BACKUP_DIR="/backups/farmacia"
NGINX_CONFIG="/etc/nginx/sites-available/farmacia"
DB_NAME="farmaciagsdb"

# Función para logs
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Verificar que se ejecuta como root o con sudo
if [[ $EUID -ne 0 ]]; then
   error "Este script debe ejecutarse como root o con sudo"
fi

# 1. Actualizar sistema
log "Actualizando sistema..."
apt update && apt upgrade -y

# 2. Instalar dependencias
log "Instalando dependencias..."
apt install -y nodejs npm postgresql nginx pm2 git certbot python3-certbot-nginx curl

# Verificar versiones
log "Verificando versiones instaladas..."
node --version
npm --version
psql --version

# 3. Configurar PostgreSQL
log "Configurando PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

# Crear usuario y base de datos si no existen
sudo -u postgres psql -c "CREATE USER farmacia_user WITH PASSWORD 'farmacia_secure_2025';" || true
sudo -u postgres psql -c "CREATE DATABASE farmaciagsdb OWNER farmacia_user;" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE farmaciagsdb TO farmacia_user;" || true

# 4. Clonar o actualizar repositorio
if [ -d "$PROJECT_DIR" ]; then
    log "Actualizando código existente..."
    cd $PROJECT_DIR
    git pull origin main
else
    log "Clonando repositorio..."
    mkdir -p /var/www
    cd /var/www
    git clone https://github.com/AkikoToKatsumi/FarmaciGS.git
    cd $PROJECT_DIR
fi

# Cambiar propietario
chown -R www-data:www-data $PROJECT_DIR

# 5. Configurar backend
log "Configurando backend..."
cd $PROJECT_DIR/backend

# Instalar dependencias
npm ci --only=production

# Crear directorio de logs
mkdir -p logs

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    log "Creando archivo .env para backend..."
    cat > .env << EOF
NODE_ENV=production
PORT=4004
DB_HOST=localhost
DB_PORT=5432
DB_NAME=farmaciagsdb
DB_USER=farmacia_user
DB_PASSWORD=farmacia_secure_2025
JWT_SECRET=$(openssl rand -base64 32)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=noreply@farmacia.com
EMAIL_PASSWORD=change_this_password
FRONTEND_URL=http://localhost
EOF
    warning "¡IMPORTANTE! Edita el archivo $PROJECT_DIR/backend/.env con tus configuraciones reales"
fi

# Importar schema de base de datos
log "Importando schema de base de datos..."
sudo -u postgres psql -d $DB_NAME -f $PROJECT_DIR/farmaciagsdb.sql || warning "Schema ya podría estar importado"

# Build del backend (si existe script)
if npm run | grep -q "build"; then
    npm run build
fi

# 6. Configurar frontend
log "Configurando frontend..."
cd $PROJECT_DIR/desktop-app

# Instalar dependencias
npm ci

# Build de producción
npm run build

# 7. Configurar PM2
log "Configurando PM2..."
cd $PROJECT_DIR/backend

# Instalar PM2 globalmente si no está instalado
npm install -g pm2

# Iniciar aplicación
pm2 delete farmacia-backend || true  # Eliminar si existe
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup | grep sudo | bash || true

# 8. Configurar Nginx
log "Configurando Nginx..."

cat > $NGINX_CONFIG << 'EOF'
server {
    listen 80;
    server_name _; # Cambiar por tu dominio

    # Logs
    access_log /var/log/nginx/farmacia_access.log;
    error_log /var/log/nginx/farmacia_error.log;

    # Frontend estático
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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF

# Habilitar sitio
ln -sf $NGINX_CONFIG /etc/nginx/sites-enabled/farmacia
rm -f /etc/nginx/sites-enabled/default

# Verificar configuración de Nginx
nginx -t || error "Error en configuración de Nginx"

# Reiniciar Nginx
systemctl restart nginx
systemctl enable nginx

# 9. Configurar firewall
log "Configurando firewall..."
ufw --force enable
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow 5432/tcp  # PostgreSQL (solo si es necesario)

# 10. Configurar backup automático
log "Configurando backup automático..."
mkdir -p $BACKUP_DIR

cat > /usr/local/bin/backup-farmacia.sh << EOF
#!/bin/bash
BACKUP_DIR="$BACKUP_DIR"
DATE=\$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U farmacia_user $DB_NAME > \$BACKUP_DIR/farmacia_\$DATE.sql
gzip \$BACKUP_DIR/farmacia_\$DATE.sql
# Mantener solo los últimos 7 backups
find \$BACKUP_DIR -name "farmacia_*.sql.gz" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-farmacia.sh

# Agregar al crontab (backup diario a las 2:00 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-farmacia.sh") | crontab -

# 11. Configurar SSL (opcional)
read -p "¿Deseas configurar SSL con Let's Encrypt? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Ingresa tu dominio (ej: farmacia.midominio.com): " DOMAIN
    if [ ! -z "$DOMAIN" ]; then
        log "Configurando SSL para $DOMAIN..."
        sed -i "s/server_name _;/server_name $DOMAIN;/" $NGINX_CONFIG
        systemctl reload nginx
        certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN || warning "Error configurando SSL"
    fi
fi

# 12. Verificaciones finales
log "Realizando verificaciones finales..."

# Verificar que PostgreSQL esté corriendo
systemctl is-active --quiet postgresql || error "PostgreSQL no está corriendo"

# Verificar que Nginx esté corriendo
systemctl is-active --quiet nginx || error "Nginx no está corriendo"

# Verificar que PM2 tenga la aplicación corriendo
pm2 list | grep -q farmacia-backend || error "La aplicación backend no está corriendo en PM2"

# Verificar que el puerto 4004 esté escuchando
netstat -tlnp | grep :4004 || warning "El puerto 4004 no está escuchando"

# Test de conectividad
curl -s http://localhost/api/test > /dev/null || warning "La API no responde correctamente"

log "✅ ¡Deployment completado exitosamente!"
echo
echo "📋 Información importante:"
echo "- URL del frontend: http://$(hostname -I | awk '{print $1}')"
echo "- API backend: http://$(hostname -I | awk '{print $1}')/api"
echo "- Logs de PM2: pm2 logs"
echo "- Logs de Nginx: /var/log/nginx/farmacia_*.log"
echo "- Configuración backend: $PROJECT_DIR/backend/.env"
echo "- Backups: $BACKUP_DIR"
echo
echo "🔧 Próximos pasos:"
echo "1. Editar $PROJECT_DIR/backend/.env con tus configuraciones"
echo "2. Configurar el dominio en DNS"
echo "3. Reiniciar PM2: pm2 restart farmacia-backend"
echo "4. Verificar logs: pm2 logs farmacia-backend"
echo
warning "¡IMPORTANTE! Cambia las contraseñas por defecto en el archivo .env"
