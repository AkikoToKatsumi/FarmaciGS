import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

console.log("🔍 Verificando conexión a la DB:");
console.log("Usuario:", process.env.DB_USER);
console.log("Base de datos:", process.env.DB_NAME);
console.log("Contraseña:", process.env.DB_PASSWORD ? "OK" : "NO DEFINIDA");
console.log("Puerto:", process.env.DB_PORT);


const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
});

pool.connect()
  .then(() => console.log("🟢 Conectado a PostgreSQL"))
  .catch(err => console.error("🔴 Error al conectar con la base de datos:", err));

export default pool;

