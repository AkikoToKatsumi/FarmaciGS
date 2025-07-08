// c:\Farmacia GS\backend\src\controllers\audit.controller.ts
// Importamos los tipos Request y Response de Express para manejar las peticiones y respuestas HTTP.
import { Request, Response } from 'express';
// Importamos nuestro pool de conexiones a la base de datos para poder realizar consultas.
import pool from '../config/db';

// Exportamos la función asíncrona 'getAuditLogs' para obtener todos los registros de auditoría.
export const getAuditLogs = async (_req: Request, res: Response) => {
  // Ejecutamos una consulta a la base de datos para seleccionar todos los registros de la tabla 'audit_log'.
  // Los ordenamos por la columna 'created_at' en orden descendente para mostrar los más recientes primero.
  const result = await pool.query('SELECT * FROM audit_log ORDER BY created_at DESC');
  // Enviamos el resultado (las filas obtenidas de la consulta) como una respuesta en formato JSON.
  res.json(result.rows);
};
