"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// c:\Farmacia GS\backend\src\config\db.ts
// Importamos la clase Pool del paquete 'pg', que se utiliza para gestionar un pool de conexiones a PostgreSQL.
const pg_1 = require("pg");
// Importamos la librería dotenv para cargar variables de entorno desde un archivo .env.
const dotenv_1 = __importDefault(require("dotenv"));
// Cargamos las variables de entorno definidas en el archivo .env en process.env.
dotenv_1.default.config();
// Bloque de depuración para verificar que las variables de entorno se están cargando correctamente.
// Esto es útil durante el desarrollo para diagnosticar problemas de conexión.
console.log("🔍 Verificando conexión a la DB:");
console.log("Usuario:", process.env.DB_USER); // Mostramos el usuario de la base de datos.
console.log("Base de datos:", process.env.DB_NAME); // Mostramos el nombre de la base de datos.
console.log("Contraseña:", process.env.DB_PASSWORD ? "OK" : "NO DEFINIDA"); // Confirmamos si la contraseña está definida, sin mostrarla.
console.log("Puerto:", process.env.DB_PORT); // Mostramos el puerto de la base de datos.
// Creamos una nueva instancia del Pool de conexiones.
// El pool gestiona múltiples conexiones de clientes para mejorar el rendimiento y la fiabilidad.
const pool = new pg_1.Pool({
    user: process.env.DB_USER, // Usuario para la autenticación en la base de datos.
    host: process.env.DB_HOST, // Host donde se encuentra el servidor de la base de datos.
    database: process.env.DB_NAME, // Nombre de la base de datos a la que nos conectaremos.
    password: process.env.DB_PASSWORD, // Contraseña para el usuario de la base de datos.
    port: Number(process.env.DB_PORT) || 5432, // Puerto de la base de datos. Usamos el valor de .env o 5432 por defecto.
});
// Intentamos establecer una conexión con la base de datos para verificar que la configuración es correcta.
pool.connect()
    // Si la conexión es exitosa, mostramos un mensaje de confirmación en la consola.
    .then(() => console.log("🟢 Conectado a PostgreSQL"))
    // Si ocurre un error durante la conexión, lo capturamos y mostramos un mensaje de error detallado.
    .catch(err => console.error("🔴 Error al conectar con la base de datos:", err));
// Exportamos la instancia del pool para que pueda ser utilizada en otras partes de la aplicación (controladores, servicios, etc.).
exports.default = pool;
