# 🚀 Guía de Despliegue - Farmacia GS

## 📋 Requisitos Previos

1. **Backend desplegado** - Tu API debe estar corriendo en un servidor
2. **Dominio configurado** - Tener un dominio o subdominio listo
3. **Servicio de hosting** - Elegir una plataforma de despliegue

---

## 🏗️ Paso 1: Construir la Aplicación

```bash
cd "c:\Farmacia GS\desktop-app"
npm run build
```

Esto generará una carpeta `dist/` con todos los archivos optimizados.

---

## 🌐 Paso 2: Opciones de Hosting

### Opción A: **Vercel** (Recomendado - Gratis y Fácil)

#### Instalación de Vercel CLI:
```bash
npm install -g vercel
```

#### Despliegue:
```bash
cd "c:\Farmacia GS\desktop-app"
vercel
```

Sigue las instrucciones:
1. Conecta tu cuenta de GitHub/GitLab
2. Selecciona el proyecto
3. Confirma la configuración
4. ¡Listo! Te dará una URL

#### Configurar dominio personalizado:
```bash
vercel --prod
vercel domains add tudominio.com
```

---

### Opción B: **Netlify** (También Gratis)

#### Instalación de Netlify CLI:
```bash
npm install -g netlify-cli
```

#### Despliegue:
```bash
cd "c:\Farmacia GS\desktop-app"
netlify deploy --prod --dir=dist
```

O usa la interfaz web:
1. Ve a https://app.netlify.com
2. Arrastra la carpeta `dist` al área de despliegue
3. Configura tu dominio personalizado

---

### Opción C: **GitHub Pages** (Gratis para repositorios públicos)

#### 1. Instalar gh-pages:
```bash
npm install --save-dev gh-pages
```

#### 2. Agregar scripts en `package.json`:
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

#### 3. Configurar base en `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/nombre-repositorio/',
  // ... resto de configuración
})
```

#### 4. Desplegar:
```bash
npm run deploy
```

Tu sitio estará en: `https://tu-usuario.github.io/nombre-repositorio/`

---

### Opción D: **Servidor Propio (VPS/Hosting Compartido)**

#### 1. Subir archivos:
Usa FTP/SFTP para subir el contenido de la carpeta `dist/` a tu servidor.

#### 2. Configurar servidor web (Nginx):
```nginx
server {
    listen 80;
    server_name tudominio.com;
    root /var/www/farmacia-gs;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Configurar CORS si es necesario
    location /api {
        proxy_pass http://tu-backend:4004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 3. Configurar Apache (.htaccess):
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## ⚙️ Paso 3: Configurar Variables de Entorno

### Crear archivo `.env.production`:
```env
VITE_API_URL=https://api.tudominio.com
```

### Actualizar `src/services/api.ts`:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4004/api';
```

---

## 🔒 Paso 4: Configurar HTTPS (SSL)

### Con Vercel/Netlify:
✅ HTTPS automático incluido

### Con servidor propio (usando Certbot):
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tudominio.com
```

---

## 📊 Paso 5: Verificar el Despliegue

1. **Probar la aplicación**: Visita tu dominio
2. **Verificar API**: Asegúrate que el backend esté accesible
3. **Revisar consola**: Abre DevTools (F12) y verifica que no haya errores
4. **Probar funcionalidades**: Login, dashboard, etc.

---

## 🔄 Actualizaciones Futuras

### Con Vercel/Netlify:
```bash
# Simplemente haz push a tu repositorio
git add .
git commit -m "Actualización"
git push

# O redespliega manualmente
vercel --prod
# o
netlify deploy --prod --dir=dist
```

### Con servidor propio:
1. Construir nueva versión: `npm run build`
2. Subir archivos de `dist/` vía FTP/SFTP
3. Limpiar caché del navegador

---

## 📝 Checklist de Despliegue

- [ ] Backend desplegado y accesible
- [ ] Variables de entorno configuradas
- [ ] Aplicación construida (`npm run build`)
- [ ] Archivos subidos al hosting
- [ ] Dominio configurado
- [ ] HTTPS habilitado
- [ ] CORS configurado en el backend
- [ ] Pruebas de funcionalidad completadas
- [ ] Monitoreo configurado (opcional)

---

## 🐛 Solución de Problemas Comunes

### Error: "Failed to fetch"
- Verifica que la URL del API sea correcta
- Revisa la configuración de CORS en el backend

### Página en blanco
- Revisa la consola del navegador (F12)
- Verifica que `base` en `vite.config.ts` sea correcto

### Imágenes no cargan
- Asegúrate que las rutas sean relativas o absolutas correctas
- Verifica que la carpeta `public/imagenes` esté incluida en el build

### Rutas no funcionan (404)
- Configura el servidor para redirigir todo a `index.html`
- Verifica la configuración de `.htaccess` o Nginx

---

## 💡 Recomendaciones

1. **Usa Vercel o Netlify** para empezar - Son gratis y muy fáciles
2. **Configura CI/CD** - Despliegue automático con cada push
3. **Monitorea tu aplicación** - Usa herramientas como Sentry para errores
4. **Optimiza imágenes** - Comprime las imágenes antes de subirlas
5. **Configura caché** - Mejora el rendimiento con headers de caché

---

## 📞 Soporte

Si tienes problemas, verifica:
- Logs del servidor
- Consola del navegador
- Network tab en DevTools
- Configuración de CORS

¡Buena suerte con tu despliegue! 🚀
