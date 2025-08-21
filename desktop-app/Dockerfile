# Etapa 1: Build de la aplicación React
FROM node:20-alpine AS builder

# Información del mantenedor
LABEL maintainer="Dauris Santana <dsantana@ucateci.edu.do>"
LABEL description="Farmacia GS Frontend - Interfaz de Usuario"
LABEL version="1.0.0"

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY vite.config.ts ./
COPY tsconfig*.json ./
COPY index.html ./

# Instalar dependencias
RUN npm ci && npm cache clean --force

# Copiar código fuente
COPY src/ ./src/
COPY public/ ./public/

# Build de producción
RUN npm run build

# Etapa 2: Servidor Nginx para servir archivos estáticos
FROM nginx:alpine

# Copiar archivos compilados desde la etapa anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Crear usuario no privilegiado
RUN addgroup -g 1001 -S nginx_group && \
    adduser -S nginx_user -u 1001 -G nginx_group

# Dar permisos necesarios
RUN chown -R nginx_user:nginx_group /usr/share/nginx/html && \
    chown -R nginx_user:nginx_group /var/cache/nginx && \
    chown -R nginx_user:nginx_group /var/log/nginx && \
    chown -R nginx_user:nginx_group /etc/nginx/conf.d

# Cambiar permisos de directorios de Nginx
RUN touch /var/run/nginx.pid && \
    chown -R nginx_user:nginx_group /var/run/nginx.pid

# Cambiar a usuario no privilegiado
USER nginx_user

# Exponer puerto 80
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
