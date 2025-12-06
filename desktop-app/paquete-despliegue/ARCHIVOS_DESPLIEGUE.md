# 📦 ARCHIVOS DE DESPLIEGUE - Farmacia GS

## ⚠️ IMPORTANTE: Archivos NO incluidos en Git

Los siguientes archivos **NO están en el repositorio de Git** porque son muy grandes (>1GB):

- ❌ `farmacia-gs-frontend-final.zip` (1 GB)
- ❌ `farmacia-gs-frontend.zip` (1 GB)
- ❌ Carpeta `dist/` (archivos compilados)

**Razón:** GitHub tiene un límite de 100 MB por archivo.

---

## ✅ Cómo Obtener los Archivos de Despliegue

### Opción 1: Generar Localmente (Recomendado)

Si tienes el código fuente, genera los archivos tú mismo:

```powershell
# 1. Ir al directorio del proyecto
cd "c:\Farmacia GS\desktop-app"

# 2. Instalar dependencias (si no lo has hecho)
npm install

# 3. Construir para producción
npm run build

# 4. Comprimir los archivos
Compress-Archive -Path dist\* -DestinationPath farmacia-gs-frontend-final.zip -Force
```

**Resultado:** Tendrás el archivo `farmacia-gs-frontend-final.zip` listo para subir al servidor.

---

### Opción 2: Transferir Directamente al Servidor

En lugar de comprimir, puedes subir la carpeta `dist/` directamente:

```powershell
# Usando SCP
scp -r dist/* usuario@servidor:/var/www/farmacia-gs/frontend/

# O usando rsync (más eficiente)
rsync -avz dist/ usuario@servidor:/var/www/farmacia-gs/frontend/
```

---

### Opción 3: Usar un Servicio de Almacenamiento

Si necesitas compartir los archivos con tu equipo:

1. **Google Drive / OneDrive / Dropbox**
   - Sube `farmacia-gs-frontend-final.zip`
   - Comparte el enlace con tu equipo

2. **WeTransfer** (hasta 2GB gratis)
   - https://wetransfer.com
   - Envía el archivo por email

3. **GitHub Releases** (con Git LFS)
   - Requiere configurar Git Large File Storage
   - No recomendado para este caso

---

## 📋 Archivos SÍ Incluidos en Git

Estos archivos **SÍ están en el repositorio** y son importantes:

### Guías de Despliegue
- ✅ `CHECKLIST_DESPLIEGUE_FINAL.md` - Checklist completo
- ✅ `GUIA_SERVIDOR_PROPIO.md` - Guía detallada paso a paso
- ✅ `CONFIGURAR_URL_BACKEND.md` - Cómo configurar la URL del backend
- ✅ `GUIA_DESPLIEGUE.md` - Guía general

### Configuración
- ✅ `.env.production` - Variables de entorno (editar antes de build)
- ✅ `tsconfig.json` - Configuración TypeScript
- ✅ `vite.config.ts` - Configuración Vite
- ✅ `.gitignore` - Archivos ignorados por Git

### Scripts
- ✅ `preparar-despliegue.sh` - Script bash para preparar despliegue
- ✅ `package.json` - Dependencias y scripts

### Código Fuente
- ✅ Toda la carpeta `src/` con el código de la aplicación
- ✅ Carpeta `public/` con assets estáticos

---

## 🚀 Proceso Completo de Despliegue

### 1. Clonar el Repositorio
```bash
git clone https://github.com/AkikoToKatsumi/FarmaciGS.git
cd FarmaciGS/desktop-app
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
Edita `.env.production`:
```env
VITE_API_URL=https://tu-dominio.com/api
```

### 4. Construir para Producción
```bash
npm run build
```

### 5. Comprimir (Opcional)
```bash
# Windows PowerShell
Compress-Archive -Path dist\* -DestinationPath farmacia-gs-frontend.zip -Force

# Linux/Mac
tar -czf farmacia-gs-frontend.tar.gz dist/
```

### 6. Subir al Servidor
```bash
# Opción A: Subir archivo comprimido
scp farmacia-gs-frontend.zip usuario@servidor:/tmp/

# Opción B: Subir carpeta directamente
scp -r dist/* usuario@servidor:/var/www/farmacia-gs/frontend/
```

### 7. Descomprimir en el Servidor (si usaste Opción A)
```bash
# En el servidor
cd /var/www/farmacia-gs/frontend
unzip /tmp/farmacia-gs-frontend.zip
sudo chown -R www-data:www-data /var/www/farmacia-gs/frontend
```

---

## 📊 Tamaños de Archivos

| Archivo/Carpeta | Tamaño | ¿En Git? |
|----------------|--------|----------|
| `dist/` (sin comprimir) | ~5 MB | ❌ No |
| `farmacia-gs-frontend-final.zip` | ~1 GB | ❌ No |
| Código fuente (`src/`) | ~500 KB | ✅ Sí |
| `node_modules/` | ~300 MB | ❌ No |
| Guías y documentación | ~50 KB | ✅ Sí |

---

## 🔧 Solución de Problemas

### "No encuentro el archivo .zip"

**Solución:** Genera el archivo localmente:
```bash
npm run build
Compress-Archive -Path dist\* -DestinationPath farmacia-gs-frontend.zip -Force
```

### "El archivo es muy grande para transferir"

**Opciones:**
1. Sube la carpeta `dist/` directamente sin comprimir
2. Usa `rsync` para transferencia incremental
3. Construye directamente en el servidor (si tienes acceso)

### "Error al construir (npm run build)"

**Verifica:**
1. Node.js versión 18 o superior: `node --version`
2. Dependencias instaladas: `npm install`
3. Variables de entorno configuradas: `.env.production`

---

## 📝 Notas Importantes

1. **Siempre genera archivos frescos** antes de desplegar
2. **No compartas archivos .zip antiguos** - pueden estar desactualizados
3. **Verifica la URL del backend** en `.env.production` antes de construir
4. **Los archivos .zip son temporales** - puedes eliminarlos después de desplegar
5. **El código fuente está en Git** - siempre puedes regenerar los archivos

---

## ✅ Checklist Rápido

Antes de desplegar, verifica:

- [ ] Código fuente actualizado desde Git
- [ ] Dependencias instaladas (`npm install`)
- [ ] `.env.production` configurado con URL correcta
- [ ] Build exitoso (`npm run build`)
- [ ] Archivos generados en carpeta `dist/`
- [ ] Archivos comprimidos (si es necesario)
- [ ] Listos para subir al servidor

---

## 🆘 Necesitas Ayuda?

Consulta las guías incluidas en el repositorio:
- `CHECKLIST_DESPLIEGUE_FINAL.md`
- `GUIA_SERVIDOR_PROPIO.md`
- `CONFIGURAR_URL_BACKEND.md`

¡Buena suerte con tu despliegue! 🚀
