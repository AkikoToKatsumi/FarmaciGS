// src/config/env.ts
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  JWT_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  DATABASE_URL: z.string().url(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Error en las variables de entorno', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
