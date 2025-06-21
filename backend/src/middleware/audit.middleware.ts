// src/middleware/audit.middleware.ts
// Importa los tipos NextFunction y Response de Express
import { NextFunction, Response } from 'express';
// Importa la instancia de Prisma para interactuar con la base de datos
import { prisma } from '../config/database';
// Importa el tipo AuthRequest para acceder al usuario autenticado
import { AuthRequest } from './auth.middleware';

// Middleware para registrar acciones en la bitácora (audit log)
// Recibe como parámetro la acción a registrar
export const auditLog = (action: string) => {
  // Devuelve un middleware asíncrono que recibe la petición, respuesta y next
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Si el usuario está autenticado
      if (req.user) {
        // Crea un registro en la tabla auditLog con la acción y el ID del usuario
        await prisma.auditLog.create({
          data: {
            action,
            userId: req.user.id,
          },
        });
      }
    } catch (error) {
      // Si ocurre un error al guardar en la bitácora, lo muestra en consola
      console.error('Error al guardar en bitácora:', error);
    }
    // Llama al siguiente middleware o controlador
    next();
  };
};
