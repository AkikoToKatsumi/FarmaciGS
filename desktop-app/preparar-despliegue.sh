#!/bin/bash

# Script para preparar archivos para despliegue en servidor propio
# Ejecutar desde: c:\Farmacia GS\desktop-app

echo "🚀 Preparando archivos para despliegue en servidor propio..."
echo ""

# 1. Construir el frontend
echo "📦 Paso 1: Construyendo el frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend construido exitosamente"
else
    echo "❌ Error al construir el frontend"
    exit 1
fi

# 2. Crear carpeta de despliegue
echo ""
echo "📁 Paso 2: Creando carpeta de despliegue..."
mkdir -p deploy
rm -rf deploy/*

# 3. Copiar frontend
echo "📋 Paso 3: Copiando archivos del frontend..."
cp -r dist/* deploy/

# 4. Crear archivo de instrucciones
echo ""
echo "📝 Paso 4: Creando archivo de instrucciones..."
cat > deploy/INSTRUCCIONES.txt << 'EOF'
INSTRUCCIONES DE DESPLIEGUE
============================

1. Subir estos archivos al servidor en: /var/www/farmacia-gs/frontend/

2. Configurar permisos:
   sudo chown -R www-data:www-data /var/www/farmacia-gs/frontend
   sudo chmod -R 755 /var/www/farmacia-gs/frontend

3. Verificar que Nginx esté configurado correctamente

4. Probar la aplicación en: https://tudominio.com

Para más detalles, consulta GUIA_SERVIDOR_PROPIO.md
EOF

# 5. Crear archivo .tar.gz para fácil transferencia
echo ""
echo "📦 Paso 5: Comprimiendo archivos..."
cd deploy
tar -czf ../farmacia-gs-frontend.tar.gz .
cd ..

echo ""
echo "✅ ¡Preparación completada!"
echo ""
echo "📂 Archivos generados:"
echo "   - deploy/ (carpeta con archivos)"
echo "   - farmacia-gs-frontend.tar.gz (archivo comprimido)"
echo ""
echo "📤 Para subir al servidor, usa:"
echo "   scp farmacia-gs-frontend.tar.gz usuario@servidor:/tmp/"
echo ""
echo "📖 Consulta GUIA_SERVIDOR_PROPIO.md para instrucciones completas"
