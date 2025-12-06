# 🔧 BACKEND - Farmacia GS

## 📦 Contenido

Esta carpeta contiene el código fuente del backend (API) de Farmacia GS.

---

## 🚀 INSTALACIÓN EN EL SERVIDOR

### Paso 1: Subir al Servidor

```bash
# Desde tu PC, sube la carpeta backend al servidor
scp -r backend usuario@servidor:/var/www/farmacia-gs/
```

### Paso 2: Instalar Dependencias

```bash
# En el servidor
cd /var/www/farmacia-gs/backend
npm install --production
```

### Paso 3: Configurar Variables de Entorno

Crea o edita el archivo `.env`:

```bash
nano .env
```

Contenido del `.env`:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Farmaciadb
DB_USER=postgres
DB_PASSWORD=tu_password_seguro_aqui

# Servidor
PORT=4004
NODE_ENV=production

# JWT
JWT_SECRET=cambia_esto_por_un_secreto_super_seguro_y_largo
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://tudominio.com

# API
API_URL=https://tudominio.com/api
```

**IMPORTANTE**: Cambia todos los valores por los reales de tu servidor.

### Paso 4: Compilar (si usa TypeScript)

```bash
# Si el proyecto usa TypeScript
npm run build
```

### Paso 5: Iniciar con PM2

```bash
# Instalar PM2 si no lo tienes
sudo npm install -g pm2

# Iniciar el backend
pm2 start npm --name "farmacia-backend" -- start

# O si tienes un archivo específico:
pm2 start dist/index.js --name "farmacia-backend"

# Guardar configuración
pm2 save

# Configurar inicio automático
pm2 startup
# Ejecuta el comando que PM2 te muestre
```

### Paso 6: Verificar

```bash
# Ver estado
pm2 status

# Ver logs
pm2 logs farmacia-backend

# Probar la API
curl http://localhost:4004/api/health
```

---

## 📋 ESTRUCTURA DEL PROYECTO

```
backend/
├── src/                    # Código fuente
│   ├── controllers/        # Controladores
│   ├── routes/            # Rutas de la API
│   ├── models/            # Modelos de datos
│   ├── middlewares/       # Middlewares
│   └── index.js           # Punto de entrada
├── .env                   # Variables de entorno (crear)
├── package.json           # Dependencias
└── README.md             # Este archivo
```

---

## 🔧 COMANDOS ÚTILES

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Modo producción
npm start

# Ver logs con PM2
pm2 logs farmacia-backend

# Reiniciar
pm2 restart farmacia-backend

# Detener
pm2 stop farmacia-backend
```

---

## 🔒 SEGURIDAD

### Cambiar Valores Importantes:

1. **JWT_SECRET**: Genera uno nuevo
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **DB_PASSWORD**: Usa una contraseña fuerte

3. **CORS_ORIGIN**: Pon tu dominio real

---

## 📊 VERIFICACIÓN

### Probar que el backend funciona:

```bash
# Desde el servidor
curl http://localhost:4004/api/health

# Desde fuera (si está configurado Nginx)
curl https://tudominio.com/api/health
```

Deberías recibir una respuesta JSON.

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "Cannot find module"
```bash
npm install
```

### Error: "Port already in use"
```bash
# Cambiar el puerto en .env
PORT=4005
```

### Error: "Database connection failed"
```bash
# Verificar PostgreSQL
sudo systemctl status postgresql

# Verificar credenciales en .env
```

### Ver logs de errores
```bash
pm2 logs farmacia-backend --err
```

---

## 📝 NOTAS

- El backend usa **Node.js** y **Express**
- Base de datos: **PostgreSQL**
- Autenticación: **JWT**
- Puerto por defecto: **4004**

---

## 🔗 ENDPOINTS PRINCIPALES

- `GET /api/health` - Estado del servidor
- `POST /api/auth/login` - Login
- `GET /api/dashboard/stats` - Estadísticas
- `GET /api/products` - Productos
- `GET /api/sales` - Ventas
- Y más...

---

**Para más detalles, consulta la documentación principal en las guías del paquete.**

---

*Última actualización: 5 de Diciembre, 2025*
