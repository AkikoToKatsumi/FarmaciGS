# Usar imagen oficial de Node.js 20 Alpine (más liviana)
FROM node:20-alpine AS builder

# Información del mantenedor
LABEL maintainer="Gabriela García <ggarcia@ucateci.edu.do>"
LABEL description="Farmacia GS Backend - Sistema de Gestión Farmacéutica"
LABEL version="1.0.0"

# Instalar dependencias del sistema
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependencias
RUN npm ci --only=production && npm cache clean --force

# Copiar código fuente
COPY src/ ./src/

# Compilar TypeScript a JavaScript
RUN npm run build

# Crear usuario no privilegiado
RUN addgroup -g 1001 -S nodejs && \
    adduser -S farmacia -u 1001

# Crear directorios necesarios con permisos
RUN mkdir -p /app/logs /app/uploads && \
    chown -R farmacia:nodejs /app

# Cambiar a usuario no privilegiado
USER farmacia

# Exponer puerto
EXPOSE 4004

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=4004

# Comando de health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js

# Comando para ejecutar la aplicación
CMD ["node", "dist/server.js"]
