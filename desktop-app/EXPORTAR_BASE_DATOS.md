# 💾 CÓMO EXPORTAR LA BASE DE DATOS POSTGRESQL

## 📋 Guía Rápida

Esta guía te muestra cómo exportar tu base de datos PostgreSQL con todos los datos para incluirla en el paquete de instalación.

---

## 🔍 PASO 1: Identificar tu Base de Datos

Primero, necesitas saber el nombre de tu base de datos. Normalmente es:
- **Nombre de BD**: `farmacia_gs`
- **Usuario**: `postgres` (o el usuario que uses)
- **Puerto**: `5432` (por defecto)

---

## 💾 PASO 2: Exportar la Base de Datos

### Opción A: Usando pgAdmin (Interfaz Gráfica) ✅ RECOMENDADO

1. **Abre pgAdmin**
   - Busca "pgAdmin" en tu PC

2. **Conecta a tu servidor**
   - Expande "Servers"
   - Expande "PostgreSQL"

3. **Selecciona tu base de datos**
   - Clic derecho en `farmacia_gs` (o el nombre de tu BD)
   - Selecciona **"Backup..."**

4. **Configura el backup**
   - **Filename**: Clic en el ícono de carpeta
   - Navega a: `C:\Farmacia GS\desktop-app\paquete-despliegue\`
   - Nombre del archivo: `farmacia_gs_backup.sql`
   - **Format**: Plain (SQL)
   - **Encoding**: UTF8

5. **Opciones importantes**
   - Pestaña "Data/Objects":
     - ✅ Marca "Data" (para incluir los datos)
     - ✅ Marca "Schema" (para incluir la estructura)
   - Pestaña "Options":
     - ✅ Marca "Include CREATE DATABASE statement"
     - ✅ Marca "Include DROP DATABASE statement"

6. **Ejecutar**
   - Clic en "Backup"
   - Espera a que termine

---

### Opción B: Usando Línea de Comandos (PowerShell)

```powershell
# 1. Navegar a la carpeta de PostgreSQL
cd "C:\Program Files\PostgreSQL\14\bin"

# 2. Exportar la base de datos
.\pg_dump.exe -U postgres -d farmacia_gs -F p -f "C:\Farmacia GS\desktop-app\paquete-despliegue\farmacia_gs_backup.sql"

# Te pedirá la contraseña de PostgreSQL
```

**Parámetros explicados:**
- `-U postgres` = Usuario de PostgreSQL
- `-d farmacia_gs` = Nombre de la base de datos
- `-F p` = Formato plain (SQL)
- `-f` = Archivo de salida

---

### Opción C: Backup Completo con Estructura y Datos

```powershell
# Backup completo (recomendado)
cd "C:\Program Files\PostgreSQL\14\bin"

.\pg_dump.exe -U postgres -d farmacia_gs --clean --create --if-exists -F p -f "C:\Farmacia GS\desktop-app\paquete-despliegue\farmacia_gs_backup.sql"
```

**Opciones adicionales:**
- `--clean` = Incluye comandos DROP antes de CREATE
- `--create` = Incluye comando CREATE DATABASE
- `--if-exists` = Usa IF EXISTS en los DROP

---

## 📦 PASO 3: Verificar el Archivo

1. **Verifica que el archivo se creó**
   - Ve a: `C:\Farmacia GS\desktop-app\paquete-despliegue\`
   - Deberías ver: `farmacia_gs_backup.sql`

2. **Verifica el tamaño**
   - El archivo debería tener varios KB o MB (depende de tus datos)
   - Si es muy pequeño (menos de 1 KB), algo salió mal

3. **Abre el archivo** (opcional)
   - Abre con Notepad
   - Deberías ver comandos SQL como:
     ```sql
     CREATE TABLE...
     INSERT INTO...
     ```

---

## 📝 PASO 4: Crear Instrucciones de Restauración

Voy a crear un archivo con instrucciones para restaurar la base de datos.

---

## ✅ VERIFICACIÓN RÁPIDA

Tu carpeta `paquete-despliegue` ahora debería tener:

```
paquete-despliegue/
├── farmacia-gs-frontend-final.zip
├── farmacia_gs_backup.sql          ← NUEVO
├── LEEME_PRIMERO.md
├── CHECKLIST_DESPLIEGUE_FINAL.md
├── GUIA_SERVIDOR_PROPIO.md
├── CONFIGURAR_URL_BACKEND.md
├── ARCHIVOS_DESPLIEGUE.md
├── PROYECTO_LISTO.md
└── .env.production
```

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### Error: "pg_dump no se reconoce como comando"

**Solución**: Agrega PostgreSQL al PATH o usa la ruta completa:

```powershell
# Encuentra tu versión de PostgreSQL
dir "C:\Program Files\PostgreSQL\"

# Usa la ruta completa (ajusta la versión)
"C:\Program Files\PostgreSQL\14\bin\pg_dump.exe" -U postgres -d farmacia_gs -f "C:\Farmacia GS\desktop-app\paquete-despliegue\farmacia_gs_backup.sql"
```

---

### Error: "password authentication failed"

**Solución**: Verifica tu contraseña de PostgreSQL

```powershell
# Prueba conectarte primero
"C:\Program Files\PostgreSQL\14\bin\psql.exe" -U postgres -d farmacia_gs

# Si funciona, entonces usa pg_dump
```

---

### El archivo está vacío o muy pequeño

**Causas posibles:**
1. Base de datos vacía (sin datos)
2. Nombre de BD incorrecto
3. Permisos insuficientes

**Solución**: Verifica que la BD tenga datos:

```powershell
# Conecta a PostgreSQL
"C:\Program Files\PostgreSQL\14\bin\psql.exe" -U postgres -d farmacia_gs

# Dentro de psql, ejecuta:
\dt                    # Ver tablas
SELECT COUNT(*) FROM users;  # Ver si hay datos
\q                     # Salir
```

---

## 📊 TIPOS DE BACKUP

### 1. Solo Estructura (Schema)
```powershell
.\pg_dump.exe -U postgres -d farmacia_gs -s -f "schema_only.sql"
```

### 2. Solo Datos
```powershell
.\pg_dump.exe -U postgres -d farmacia_gs -a -f "data_only.sql"
```

### 3. Estructura + Datos (RECOMENDADO) ✅
```powershell
.\pg_dump.exe -U postgres -d farmacia_gs -f "farmacia_gs_backup.sql"
```

### 4. Formato Comprimido (más pequeño)
```powershell
.\pg_dump.exe -U postgres -d farmacia_gs -F c -f "farmacia_gs_backup.dump"
```

---

## 🎯 COMANDO RECOMENDADO (Copia y Pega)

```powershell
# Ajusta la versión de PostgreSQL si es diferente
cd "C:\Program Files\PostgreSQL\14\bin"

# Backup completo con todas las opciones
.\pg_dump.exe -U postgres -d farmacia_gs --clean --create --if-exists --inserts -F p -f "C:\Farmacia GS\desktop-app\paquete-despliegue\farmacia_gs_backup.sql"

# Ingresa tu contraseña cuando te la pida
```

**Opciones adicionales:**
- `--inserts` = Usa INSERT en lugar de COPY (más compatible)

---

## 📋 CHECKLIST

- [ ] Identificar nombre de la base de datos
- [ ] Abrir pgAdmin o PowerShell
- [ ] Ejecutar comando de backup
- [ ] Ingresar contraseña de PostgreSQL
- [ ] Verificar que el archivo se creó
- [ ] Verificar el tamaño del archivo
- [ ] Archivo guardado en `paquete-despliegue/`

---

## 🚀 SIGUIENTE PASO

Una vez que tengas el archivo `farmacia_gs_backup.sql`:

1. Actualiza el mensaje de WhatsApp para mencionar la base de datos
2. Las instrucciones de restauración ya están en las guías

---

## 💡 CONSEJO PRO

Si tu base de datos es muy grande (>100 MB), considera:

1. **Comprimir el backup:**
   ```powershell
   Compress-Archive -Path "farmacia_gs_backup.sql" -DestinationPath "farmacia_gs_backup.zip"
   ```

2. **Usar formato comprimido desde el inicio:**
   ```powershell
   .\pg_dump.exe -U postgres -d farmacia_gs -F c -f "farmacia_gs_backup.dump"
   ```

---

**¡Listo!** Ahora tu paquete incluye la base de datos completa con todos los datos. 🎉

---

*Última actualización: 5 de Diciembre, 2025*
