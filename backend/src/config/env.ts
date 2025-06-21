// src/config/env.ts
// Importa dotenv para cargar variables de entorno desde un archivo .env
import dotenv from 'dotenv';
// Importa zod para validación de esquemas
import { z } from 'zod';

// Carga las variables de entorno en process.env
dotenv.config();

// Define el esquema de validación para las variables de entorno
const envSchema = z.object({
  // Puerto en el que corre la aplicación, por defecto 3000
  PORT: z.string().default('3000'),
  // Secreto para firmar JWT
  JWT_SECRET: z.string(),
  // Secreto para firmar JWT de refresco
  JWT_REFRESH_SECRET: z.string(),
  // URL de la base de datos, debe ser un string con formato de URL
  DATABASE_URL: z.string().url(),
});

// Valida las variables de entorno usando el esquema definido
const parsedEnv = envSchema.safeParse(process.env);

// Si la validación falla, muestra el error y termina el proceso
if (!parsedEnv.success) {
  console.error('❌ Error en las variables de entorno', parsedEnv.error.format());
  process.exit(1);
}

// Exporta las variables de entorno validadas para usarlas en la aplicación
export const env = parsedEnv.data;
