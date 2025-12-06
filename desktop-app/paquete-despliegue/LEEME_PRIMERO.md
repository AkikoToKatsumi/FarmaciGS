# 📦 PAQUETE DE INSTALACIÓN COMPLETO - Farmacia GS

**Para:** Administrador del Servidor
**De:** Equipo de Desarrollo Farmacia GS
**Fecha:** 5 de Diciembre, 2025

---

## 👋 BIENVENIDO

Este paquete contiene **TODO** lo necesario para instalar la aplicación **Farmacia GS** en el servidor de producción.

---

## 📁 CONTENIDO DEL PAQUETE

```
paquete-despliegue/
├── 📄 LEEME_PRIMERO.md                    ← ESTE ARCHIVO
├── 📦 farmacia-gs-frontend-final.zip      ← FRONTEND (1 GB)
├── 🗄️  Farmaciadb.sql                      ← BASE DE DATOS
├── 🔧 backend/                             ← BACKEND (Node.js)
│   ├── src/                                ← Código fuente
│   ├── package.json                        ← Dependencias
│   ├── .env.example                        ← Ejemplo de configuración
│   └── README.md                           ← Instrucciones del backend
├── 📋 CHECKLIST_DESPLIEGUE_FINAL.md       ← GUÍA PRINCIPAL
├── 📖 GUIA_SERVIDOR_PROPIO.md             ← Instrucciones detalladas
├── 🔧 CONFIGURAR_URL_BACKEND.md           ← Configuración de URL
├── 🔄 RESTAURAR_BASE_DATOS.md             ← Restaurar base de datos
├── 📚 ARCHIVOS_DESPLIEGUE.md              ← Gestión de archivos
├── 📊 PROYECTO_LISTO.md                   ← Resumen ejecutivo
└── ⚙️  .env.production                     ← Variables frontend
```

---

## 🚀 INICIO RÁPIDO (3 PASOS)

### PASO 1: Lee la Documentación
1. Abre `PROYECTO_LISTO.md` para ver el resumen completo
2. Abre `CHECKLIST_DESPLIEGUE_FINAL.md` - Esta es tu guía principal

### PASO 2: Prepara el Servidor
Necesitas un servidor con:
- Ubuntu 20.04 LTS o superior
- Node.js 18+
- PostgreSQL 14+
- Nginx
- Acceso SSH con sudo

### PASO 3: Sigue el Checklist
Sigue paso a paso el archivo `CHECKLIST_DESPLIEGUE_FINAL.md`

---

## 📋 ORDEN DE LECTURA RECOMENDADO

1. **PRIMERO**: `PROYECTO_LISTO.md` (5 min)
   - Te da una visión general completa

2. **SEGUNDO**: `CONFIGURAR_URL_BACKEND.md` (3 min)
   - Aprende qué URL usar según tu caso

3. **TERCERO**: `CHECKLIST_DESPLIEGUE_FINAL.md` (Guía principal)
   - Sigue esto paso a paso durante la instalación

4. **REFERENCIA**: `GUIA_SERVIDOR_PROPIO.md`
   - Consulta esto si necesitas más detalles

5. **BACKEND**: `backend/README.md`
   - Instrucciones específicas del backend

6. **BASE DE DATOS**: `RESTAURAR_BASE_DATOS.md`
   - Cómo restaurar la base de datos

---

## ⚡ INSTALACIÓN RÁPIDA (Resumen)

### En el Servidor:

```bash
# 1. Instalar dependencias del sistema
sudo apt update && sudo apt upgrade -y
sudo apt install -y nodejs npm postgresql nginx
sudo npm install -g pm2

# 2. Configurar PostgreSQL
sudo -u postgres psql
CREATE DATABASE "Farmaciadb";
CREATE USER farmacia_user WITH PASSWORD 'password_seguro';
GRANT ALL PRIVILEGES ON DATABASE "Farmaciadb" TO farmacia_user;
\q

# 3. Restaurar base de datos
sudo -u postgres psql Farmaciadb < Farmaciadb.sql

# 4. Configurar Backend
cd backend
npm install --production
nano .env  # Configurar variables de entorno
pm2 start npm --name "farmacia-backend" -- start
pm2 save

# 5. Desplegar Frontend
mkdir -p /var/www/farmacia-gs/frontend
unzip farmacia-gs-frontend-final.zip -d /var/www/farmacia-gs/frontend/

# 6. Configurar Nginx
# (Ver GUIA_SERVIDOR_PROPIO.md para configuración completa)

# 7. Configurar SSL
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tudominio.com
```

---

## 🔧 CONFIGURACIÓN IMPORTANTE

### Antes de Desplegar:

**IMPORTANTE**: Configura las variables de entorno:

#### Frontend (`.env.production`):
```env
VITE_API_URL=https://tudominio.com/api
```

#### Backend (`backend/.env`):
```env
DB_HOST=localhost
DB_NAME=Farmaciadb
DB_USER=farmacia_user
DB_PASSWORD=tu_password_seguro

PORT=4004
NODE_ENV=production

JWT_SECRET=genera_un_secreto_super_largo_y_aleatorio
CORS_ORIGIN=https://tudominio.com
```

---

## 📊 ARQUITECTURA DEL SISTEMA

```
┌─────────────────────────────────────────────────────────┐
│                    SERVIDOR PRODUCCIÓN                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Frontend   │  │   Backend    │  │  PostgreSQL  │ │
│  │   (React)    │  │   (Node.js)  │  │   Database   │ │
│  │              │  │  Puerto 4004 │  │  Puerto 5432 │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│         │                 │                  │          │
│         └─────────────────┴──────────────────┘          │
│                    Nginx (Puerto 80/443)                │
│                    SSL/HTTPS (Let's Encrypt)            │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ CHECKLIST PRE-INSTALACIÓN

Antes de comenzar, verifica que tienes:

- [ ] Acceso SSH al servidor
- [ ] Privilegios sudo en el servidor
- [ ] Dominio configurado (o IP del servidor)
- [ ] Este paquete completo descargado y descomprimido
- [ ] 30-60 minutos de tiempo disponible
- [ ] Conexión a internet estable

---

## 🆘 SOPORTE

### Si tienes problemas:

1. **Consulta la documentación**:
   - `CHECKLIST_DESPLIEGUE_FINAL.md` tiene solución de problemas
   - `GUIA_SERVIDOR_PROPIO.md` tiene troubleshooting detallado
   - `backend/README.md` para problemas del backend

2. **Errores comunes**:
   - Error 502: Backend no está corriendo → `pm2 restart farmacia-backend`
   - CORS Error: Verificar CORS_ORIGIN en backend/.env
   - SSL Error: Verificar certificado → `sudo certbot renew`
   - DB Error: Verificar PostgreSQL → `sudo systemctl status postgresql`

3. **Logs útiles**:
   ```bash
   pm2 logs farmacia-backend
   sudo tail -f /var/log/nginx/error.log
   sudo -u postgres psql -l
   ```

---

## 📞 INFORMACIÓN DE CONTACTO

### Repositorio del Proyecto:
- GitHub: https://github.com/AkikoToKatsumi/FarmaciGS

### Desarrolladores:
- Gabriela García (Matrícula: 2023-0105)
- Dauris Santana (Matrícula: 2023-0253)

---

## 🎯 OBJETIVO FINAL

Al terminar la instalación, deberías tener:

✅ Aplicación accesible en `https://tudominio.com`
✅ Backend funcionando en puerto 4004
✅ Base de datos PostgreSQL configurada y con datos
✅ SSL/HTTPS activo y funcionando
✅ Todas las funcionalidades operativas

---

## 📝 NOTAS IMPORTANTES

1. **Seguridad**: Cambia todas las contraseñas por defecto
2. **Backups**: Configura backups automáticos de la base de datos
3. **Monitoreo**: Revisa los logs regularmente
4. **Actualizaciones**: Mantén el sistema actualizado
5. **Variables de entorno**: Configura TODOS los valores en .env

---

## 🚀 ¡COMENCEMOS!

**Siguiente paso**: Abre `CHECKLIST_DESPLIEGUE_FINAL.md` y comienza la instalación.

**Tiempo estimado**: 30-60 minutos

**Dificultad**: Media (requiere conocimientos básicos de Linux)

---

## ✨ CARACTERÍSTICAS DE LA APLICACIÓN

- 🏥 Gestión completa de farmacia
- 💊 Control de inventario
- 👥 Gestión de clientes
- 📊 Reportes y estadísticas
- 🔒 Sistema de autenticación seguro (JWT)
- 📱 Diseño responsive
- 🌐 Interfaz moderna y profesional
- 🔄 API REST completa
- 🗄️ Base de datos PostgreSQL

---

## 📦 CONTENIDO TÉCNICO

### Frontend:
- React 18
- Vite 5
- TypeScript
- Styled Components
- Recharts (gráficos)

### Backend:
- Node.js
- Express
- PostgreSQL
- JWT Authentication
- CORS configurado

### Base de Datos:
- PostgreSQL 14+
- Todas las tablas incluidas
- Datos de ejemplo/producción

---

**¡Buena suerte con la instalación!** 🚀

Si sigues la guía paso a paso, todo funcionará correctamente.

---

*Documento generado automáticamente*
*Última actualización: 5 de Diciembre, 2025*
