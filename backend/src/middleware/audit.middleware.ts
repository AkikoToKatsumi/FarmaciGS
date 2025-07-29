// c:\Farmacia GS\backend\src\middleware\audit.middleware.ts
// Importamos los tipos NextFunction y Response de Express para manejar el flujo de la solicitud.
import { NextFunction, Response } from 'express';
// Importamos nuestro pool de conexiones a la base de datos.
import pool from '../config/db';
// Importamos nuestro tipo personalizado AuthRequest que incluye la información del usuario.
import { AuthRequest } from './auth.middleware';

// Exportamos una función de orden superior 'auditLog' que crea un middleware.
// Recibe una cadena 'action' que describe la acción que se está realizando (ej. "LOGIN_EXITOSO").
export const auditLog = (action: string) => {
  // Devolvemos una función middleware asíncrona.
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Usamos un bloque try...catch para manejar errores y evitar que la aplicación se detenga.
    try {
      // Verificamos si existe un usuario en la solicitud (lo que significa que está autenticado).
      if (req.user) {
        // Si hay un usuario, insertamos un nuevo registro en la tabla 'audit_log'.
        // Guardamos la acción realizada y el ID del usuario que la ejecutó.
 await pool.query(
  'INSERT INTO audit_log (action, user_id) VALUES ($1, $2)',
  [action, req.user.id]
);
      }
    } catch (error) {
      // Si ocurre un error al intentar guardar el registro, lo mostramos en la consola.
      // No detenemos la solicitud por un error de auditoría, simplemente lo registramos.
      console.error('Error al guardar en bitácora:', error);
    }
    // Llamamos a next() para pasar el control al siguiente middleware o al controlador de la ruta.
    next();
  };
};
