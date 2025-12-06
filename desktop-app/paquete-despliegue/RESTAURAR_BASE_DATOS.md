# 🔄 CÓMO RESTAURAR LA BASE DE DATOS

## 📋 Instrucciones para el Administrador del Servidor

Esta guía explica cómo restaurar la base de datos PostgreSQL en el servidor de producción.

---

## ✅ REQUISITOS PREVIOS

Antes de comenzar, asegúrate de tener:
- [ ] PostgreSQL instalado en el servidor
- [ ] Archivo `farmacia_gs_backup.sql` subido al servidor
- [ ] Acceso con privilegios de superusuario (postgres)

---

## 🚀 MÉTODO 1: Restauración Automática (RECOMENDADO)

### Paso 1: Subir el archivo al servidor

```bash
# Desde tu PC local
scp farmacia_gs_backup.sql usuario@servidor:/tmp/
```

### Paso 2: Conectarse al servidor

```bash
ssh usuario@servidor
```

### Paso 3: Restaurar la base de datos

```bash
# Opción A: Si el backup incluye CREATE DATABASE
sudo -u postgres psql < /tmp/farmacia_gs_backup.sql

# Opción B: Si necesitas crear la BD primero
sudo -u postgres createdb farmacia_gs
sudo -u postgres psql farmacia_gs < /tmp/farmacia_gs_backup.sql
```

---

## 🔧 MÉTODO 2: Restauración Manual Paso a Paso

### Paso 1: Crear la base de datos (si no existe)

```bash
# Conectarse a PostgreSQL
sudo -u postgres psql

# Dentro de psql:
CREATE DATABASE farmacia_gs;
CREATE USER farmacia_user WITH ENCRYPTED PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE farmacia_gs TO farmacia_user;

# Salir
\q
```

### Paso 2: Restaurar los datos

```bash
# Restaurar desde el archivo SQL
sudo -u postgres psql farmacia_gs < /tmp/farmacia_gs_backup.sql
```

### Paso 3: Verificar la restauración

```bash
# Conectarse a la base de datos
sudo -u postgres psql farmacia_gs

# Verificar tablas
\dt

# Verificar datos (ejemplo)
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM products;

# Salir
\q
```

---

## 📊 MÉTODO 3: Usando pg_restore (para archivos .dump)

Si el backup está en formato comprimido (.dump):

```bash
# Crear la base de datos
sudo -u postgres createdb farmacia_gs

# Restaurar
sudo -u postgres pg_restore -d farmacia_gs /tmp/farmacia_gs_backup.dump

# O con más opciones
sudo -u postgres pg_restore -d farmacia_gs --clean --if-exists /tmp/farmacia_gs_backup.dump
```

---

## ✅ VERIFICACIÓN POST-RESTAURACIÓN

### 1. Verificar que las tablas existan

```bash
sudo -u postgres psql farmacia_gs -c "\dt"
```

### 2. Verificar que haya datos

```bash
# Contar registros en tablas principales
sudo -u postgres psql farmacia_gs -c "SELECT COUNT(*) FROM users;"
sudo -u postgres psql farmacia_gs -c "SELECT COUNT(*) FROM products;"
sudo -u postgres psql farmacia_gs -c "SELECT COUNT(*) FROM sales;"
```

### 3. Verificar permisos del usuario

```bash
sudo -u postgres psql farmacia_gs

# Dentro de psql:
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO farmacia_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO farmacia_user;
\q
```

---

## 🔒 CONFIGURACIÓN DE SEGURIDAD

### Cambiar contraseña del usuario

```bash
sudo -u postgres psql

# Dentro de psql:
ALTER USER farmacia_user WITH PASSWORD 'nueva_password_super_segura';
\q
```

### Actualizar el .env del backend

Edita el archivo `.env` del backend:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=farmacia_gs
DB_USER=farmacia_user
DB_PASSWORD=nueva_password_super_segura
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "database already exists"

```bash
# Opción 1: Eliminar y recrear
sudo -u postgres dropdb farmacia_gs
sudo -u postgres createdb farmacia_gs
sudo -u postgres psql farmacia_gs < /tmp/farmacia_gs_backup.sql

# Opción 2: Restaurar con --clean
sudo -u postgres psql farmacia_gs < /tmp/farmacia_gs_backup.sql
```

### Error: "permission denied"

```bash
# Asegúrate de usar sudo -u postgres
sudo -u postgres psql farmacia_gs < /tmp/farmacia_gs_backup.sql
```

### Error: "role does not exist"

```bash
# Crear el usuario primero
sudo -u postgres psql

CREATE USER farmacia_user WITH ENCRYPTED PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE farmacia_gs TO farmacia_user;
\q

# Luego restaurar
sudo -u postgres psql farmacia_gs < /tmp/farmacia_gs_backup.sql
```

### Tablas vacías después de restaurar

```bash
# Verifica que el archivo de backup tenga datos
head -n 50 /tmp/farmacia_gs_backup.sql

# Deberías ver comandos INSERT INTO...
# Si no los ves, el backup solo tiene estructura
```

---

## 📋 SCRIPT DE RESTAURACIÓN COMPLETO

Copia y pega este script para restauración automática:

```bash
#!/bin/bash

echo "🔄 Iniciando restauración de base de datos..."

# Variables
DB_NAME="farmacia_gs"
DB_USER="farmacia_user"
DB_PASSWORD="cambiar_esto_por_password_seguro"
BACKUP_FILE="/tmp/farmacia_gs_backup.sql"

# Crear usuario si no existe
sudo -u postgres psql -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';" 2>/dev/null

# Crear base de datos
echo "📦 Creando base de datos..."
sudo -u postgres createdb $DB_NAME 2>/dev/null

# Restaurar backup
echo "💾 Restaurando datos..."
sudo -u postgres psql $DB_NAME < $BACKUP_FILE

# Otorgar permisos
echo "🔒 Configurando permisos..."
sudo -u postgres psql $DB_NAME -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;"
sudo -u postgres psql $DB_NAME -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;"

# Verificar
echo "✅ Verificando restauración..."
TABLE_COUNT=$(sudo -u postgres psql $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
echo "   Tablas restauradas: $TABLE_COUNT"

echo "🎉 ¡Restauración completada!"
echo ""
echo "📝 No olvides:"
echo "   1. Actualizar el archivo .env del backend con la contraseña"
echo "   2. Reiniciar el backend: pm2 restart farmacia-backend"
```

Guarda este script como `restaurar_bd.sh` y ejecútalo:

```bash
chmod +x restaurar_bd.sh
./restaurar_bd.sh
```

---

## 🎯 CHECKLIST DE RESTAURACIÓN

- [ ] Archivo de backup subido al servidor
- [ ] PostgreSQL instalado y corriendo
- [ ] Base de datos creada
- [ ] Backup restaurado exitosamente
- [ ] Tablas verificadas
- [ ] Datos verificados
- [ ] Permisos configurados
- [ ] Contraseña actualizada en .env
- [ ] Backend reiniciado

---

## 📞 COMANDOS ÚTILES

```bash
# Ver bases de datos
sudo -u postgres psql -l

# Conectarse a una base de datos
sudo -u postgres psql farmacia_gs

# Ver tablas
\dt

# Ver usuarios
\du

# Ver tamaño de la base de datos
\l+

# Salir
\q
```

---

## 💡 CONSEJOS

1. **Backup antes de restaurar**: Si ya hay datos, haz un backup primero
2. **Verifica el archivo**: Asegúrate que el archivo .sql no esté corrupto
3. **Permisos**: Siempre usa `sudo -u postgres` para operaciones de BD
4. **Contraseñas**: Usa contraseñas fuertes en producción
5. **Testing**: Prueba la conexión del backend después de restaurar

---

## 🔄 RESTAURACIÓN EN DESARROLLO (Local)

Si quieres restaurar en tu PC local:

### Windows (PowerShell):

```powershell
# Navegar a PostgreSQL
cd "C:\Program Files\PostgreSQL\14\bin"

# Crear BD
.\createdb.exe -U postgres farmacia_gs

# Restaurar
.\psql.exe -U postgres -d farmacia_gs -f "C:\ruta\al\farmacia_gs_backup.sql"
```

### Linux/Mac:

```bash
createdb -U postgres farmacia_gs
psql -U postgres -d farmacia_gs < farmacia_gs_backup.sql
```

---

**¡Listo!** Tu base de datos debería estar completamente restaurada con todos los datos. 🎉

---

*Última actualización: 5 de Diciembre, 2025*
