# 🚀 **GUÍA RÁPIDA: EJECUTAR FARMACIA GS DESKTOP**

## ⚠️ **PROBLEMA COMÚN: PowerShell y Rutas**

### **Error típico:**
```powershell
PS C:\> start-app.bat
# ERROR: El término 'start-app.bat' no se reconoce
```

### **✅ SOLUCIÓN:**
```powershell
# 1. Ir al directorio correcto PRIMERO
cd "c:\Farmacia GS\desktop-app"

# 2. LUEGO ejecutar con .\ (punto barra)
.\start-app.bat
```

---

## 🎯 **MÉTODOS PARA EJECUTAR LA APP**

### **Método 1: Script Automático** ⭐ **RECOMENDADO**
```powershell
# Abrir PowerShell como administrador
cd "c:\Farmacia GS\desktop-app"
.\start-app.bat
```

### **Método 2: Comandos Manuales**
```powershell
# Ir al directorio
cd "c:\Farmacia GS\desktop-app"

# Ejecutar comando simplificado
npm run electron
```

### **Método 3: Doble Click** 🖱️ **MÁS FÁCIL**
1. Abrir explorador de Windows
2. Navegar a: `c:\Farmacia GS\desktop-app\`
3. **Doble click** en `start-app.bat`
4. ¡Listo!

---

## 📋 **VERIFICACIÓN PASO A PASO**

### **Paso 1: Verificar Ubicación**
```powershell
# Debe mostrar el directorio correcto
pwd
# Resultado esperado: C:\Farmacia GS\desktop-app
```

### **Paso 2: Verificar Archivos**
```powershell
# Debe mostrar start-app.bat
ls *.bat
```

### **Paso 3: Ejecutar**
```powershell
# Sintaxis correcta en PowerShell
.\start-app.bat
```

---

## 🔧 **SOLUCIÓN AL ERROR COMÚN**

### **PowerShell NO reconoce archivos sin .\ **

❌ **Incorrecto:**
```powershell
start-app.bat
```

✅ **Correcto:**
```powershell
.\start-app.bat
```

### **Explicación:**
- PowerShell requiere `.\` para ejecutar archivos en el directorio actual
- Es una medida de seguridad
- Siempre usar `.\` antes del nombre del archivo

---

## 🎮 **FLUJO COMPLETO SIN ERRORES**

### **Opción A: Terminal**
```powershell
# 1. Abrir PowerShell
Windows + R → powershell → Enter

# 2. Navegar al directorio
cd "c:\Farmacia GS\desktop-app"

# 3. Ejecutar aplicación
.\start-app.bat
```

### **Opción B: Explorador** 🖱️
```
1. Abrir Explorador de Windows
2. Ir a: c:\Farmacia GS\desktop-app\
3. Doble click en: start-app.bat
4. ¡La app se ejecuta automáticamente!
```

---

## ✅ **QUÉ ESPERAR**

### **Salida Normal:**
```
=========================================
       FARMACIA GS - DESKTOP APP
=========================================

[1/2] Compilando aplicacion...
✓ Compilación exitosa

[2/2] Iniciando Electron...
- Se eliminaron los errores de GPU
- La aplicacion se abrira en unos segundos
```

### **Ventanas que Aparecen:**
1. **Splash Screen** - Pantalla de carga (3-5 segundos)
2. **Ventana Principal** - Aplicación completa
3. **Sin errores GPU** - Funcionamiento silencioso

---

## 🚨 **SOLUCIÓN DE PROBLEMAS**

### **Error: "No se reconoce el comando"**
```powershell
# Verificar directorio actual
pwd

# Si no estás en desktop-app:
cd "c:\Farmacia GS\desktop-app"

# Luego ejecutar con .\
.\start-app.bat
```

### **Error: "Fallo en la compilación"**
```powershell
# Verificar dependencias
npm install --legacy-peer-deps

# Luego intentar de nuevo
.\start-app.bat
```

---

## 🎉 **RESUMEN EJECUTIVO**

### **✅ COMANDO MÁS SIMPLE:**
1. Abrir explorador
2. Ir a `c:\Farmacia GS\desktop-app\`
3. Doble click en `start-app.bat`
4. **¡Aplicación ejecutándose sin errores GPU!**

### **⚡ COMANDO DE TERMINAL:**
```powershell
cd "c:\Farmacia GS\desktop-app" && .\start-app.bat
```

**¡Tu aplicación desktop ya funciona perfectamente!** 🎊
