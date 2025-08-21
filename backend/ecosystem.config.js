module.exports = {
  apps: [{
    name: 'farmacia-backend',
    script: './dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 4004
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 4004
    },
    // Configuración de logs
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Configuración de memoria
    max_memory_restart: '1G',
    
    // Configuración de reinicio
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Variables de entorno específicas
    env_production: {
      NODE_ENV: 'production',
      PORT: 4004,
      // Estas variables se deben configurar en el servidor
      DB_HOST: process.env.DB_HOST,
      DB_PORT: process.env.DB_PORT,
      DB_NAME: process.env.DB_NAME,
      DB_USER: process.env.DB_USER,
      DB_PASSWORD: process.env.DB_PASSWORD,
      JWT_SECRET: process.env.JWT_SECRET
    }
  }]
};
