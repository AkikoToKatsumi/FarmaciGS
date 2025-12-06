// c:\Farmacia GS\backend\src\config\env.ts
// Importamos la librería dotenv para cargar variables de entorno.
import dotenv from 'dotenv';

// Ejecutamos la configuración de dotenv para cargar el archivo .env.
dotenv.config();

// Verificamos que las variables de entorno esenciales para la aplicación estén definidas.
// Si alguna de estas variables falta, lanzamos un error para detener la ejecución y evitar fallos inesperados.
if (!process.env.DB_USER || !process.env.DB_NAME || !process.env.JWT_SECRET) {
  throw new Error("❌ Faltan variables de entorno requeridas");
}

// Exportamos un objeto de configuración centralizado.
// Esto nos permite acceder a las variables de entorno de una manera más organizada y segura en toda la aplicación.
export const config = {
  // Configuración de la base de datos.
  db: {
    user: process.env.DB_USER!, // El '!' indica a TypeScript que estamos seguros de que este valor no es nulo.
    host: process.env.DB_HOST!,
    name: process.env.DB_NAME!,
    password: process.env.DB_PASSWORD!,
    port: Number(process.env.DB_PORT) || 5432, // Convertimos el puerto a número, con un valor por defecto.
  },
  // Configuración para JSON Web Tokens (JWT).
  jwt: {
    secret: process.env.JWT_SECRET!, // El secreto para firmar los tokens.
    expiresIn: process.env.JWT_EXPIRES_IN || '1h', // Tiempo de expiración del token, por defecto 1 hora.
  },
};
