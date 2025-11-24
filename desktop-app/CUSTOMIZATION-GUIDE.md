# 🎨 **PERSONALIZACIÓN DE FARMACIA GS DESKTOP**

## 📍 **1. CAMBIAR EL LOGO DE LA BARRA DE TAREAS**

### Ubicaciones del Logo:

#### A) **Logo de la Ventana** (aparece en barra de tareas y título):
📂 **Archivo**: `c:\Farmacia GS\desktop-app\electron\main.js`
📍 **Línea 44**:
```javascript
icon: path.join(__dirname, '../public/imagenes/logo.png'),
```

#### B) **Logo del Instalador** (aparece en el archivo .exe):
📂 **Archivo**: `c:\Farmacia GS\desktop-app\package.json`
📍 **Sección "build" > "win"**:
```json
"win": {
  "icon": "public/imagenes/icon.ico"
}
```

### 🔧 **Cómo Cambiar el Logo**:

1. **Para la aplicación en ejecución**:
   - Reemplaza `public/imagenes/logo.png` con tu nuevo logo
   - Formato: PNG, tamaño recomendado: 256x256 píxeles

2. **Para el instalador**:
   - Reemplaza `public/imagenes/icon.ico` con tu nuevo icono
   - Formato: ICO, múltiples tamaños (16x16, 32x32, 48x48, 256x256)

3. **Regenerar aplicación**:
   ```bash
   npm run build
   npm run electron:dist
   ```

---

## 🪟 **2. OPCIÓN PARA MÚLTIPLES VENTANAS**

### ✅ **YA IMPLEMENTADO**: 
- **Menú**: Ventana > Nueva Ventana
- **Atajo**: `Ctrl+N` (Windows/Linux) o `Cmd+N` (Mac)

### 🔧 **Funcionalidad Añadida**:

#### En el Menú:
```javascript
{
  label: 'Nueva Ventana',
  accelerator: 'CmdOrCtrl+N',
  click: () => this.createNewWindow()
}
```

#### Método Implementado:
- Cada nueva ventana es independiente
- Mismo contenido que la ventana principal
- Se pueden abrir múltiples instancias
- Cada ventana mantiene su propio estado

### 🎯 **Cómo Usar**:
1. **Desde menú**: Ventana → Nueva Ventana
2. **Con teclado**: Presiona `Ctrl+N`
3. **Resultado**: Se abre una nueva ventana independiente

---

## 🎬 **3. VENTANA DE CARGA MEJORADA**

### 📂 **Archivo**: `c:\Farmacia GS\desktop-app\electron\splash.html`

### ✨ **Mejoras Implementadas**:

#### **Diseño Visual**:
- ✅ Fondo con gradiente moderno
- ✅ Contenedor con efecto glassmorphism
- ✅ Logo más grande con animación flotante
- ✅ Spinner de carga animado
- ✅ Barra de progreso visual
- ✅ Efectos de sombra y backdrop-filter

#### **Funcionalidad**:
- ✅ Mensajes de carga dinámicos
- ✅ Auto-cierre después de 8 segundos máximo
- ✅ Animaciones suaves y profesionales
- ✅ Responsive y centrado perfectamente

#### **Mensajes Dinámicos**:
```javascript
'Iniciando aplicación...'
'Cargando componentes...'
'Conectando al servidor...'
'Preparando interfaz...'
'Casi listo...'
```

### 🎨 **Configuración del Splash**:

#### **Tamaño y Posición**:
```javascript
width: 450,
height: 350,
frame: false,        // Sin bordes
alwaysOnTop: true,   // Siempre visible
transparent: true,   // Fondo transparente
center: true         // Centrado en pantalla
```

---

## 🔧 **CONFIGURACIONES ADICIONALES**

### **Logo del Splash Screen**:
📍 **Referencia**: `../public/imagenes/logo.png`
🔧 **Para cambiar**: Reemplaza el archivo logo.png

### **Título de la Aplicación**:
📂 **Archivo**: `electron/main.js`
📍 **Línea**: `title: 'Farmacia GS - Sistema de Gestión'`

### **Información del Desarrollador**:
📂 **Archivo**: `electron/splash.html`
📍 **Sección**: `<div class="info">`

---

## 🚀 **COMANDOS PARA APLICAR CAMBIOS**

```bash
# Desarrollo (ver cambios inmediatamente)
npm run electron:dev

# Producción (crear nuevo instalador)
npm run build
npm run electron:dist
```

---

## 📁 **ESTRUCTURA DE ARCHIVOS IMPORTANTES**

```
desktop-app/
├── electron/
│   ├── main.js          ← Logo de ventana + Múltiples ventanas
│   └── splash.html      ← Pantalla de carga
├── public/imagenes/
│   ├── logo.png         ← Logo de la aplicación
│   └── icon.ico         ← Icono del instalador
└── package.json         ← Configuración del instalador
```

---

## ✅ **RESUMEN DE CAMBIOS REALIZADOS**

1. **✅ Logo**: Configurado en main.js y package.json
2. **✅ Múltiples Ventanas**: Menú + función createNewWindow()
3. **✅ Splash Screen**: Completamente rediseñado con animaciones
4. **✅ Auto-close**: Splash se cierra automáticamente
5. **✅ Responsive**: Todos los elementos son adaptativos

### 🎉 **¡Todo Listo para Usar!**

Ejecuta `npm run electron:dev` para ver todos los cambios en acción.
