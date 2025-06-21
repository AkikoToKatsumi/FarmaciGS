// Importa los tipos Response y NextFunction de Express
import { Response, NextFunction } from 'express';
// Importa el tipo AuthRequest para acceder al usuario autenticado
import { AuthRequest } from './auth.middleware';

// Middleware para autorizar el acceso según el rol del usuario
// Recibe una lista de roles permitidos como parámetros
export const authorizeRoles = (...allowedRoles: string[]) => {
  // Devuelve un middleware que verifica el rol del usuario
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Obtiene el rol del usuario autenticado
    const role = req.user?.role;

    // Si el rol no está en la lista de roles permitidos, responde con error 403
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    // Si el rol es válido, continúa con el siguiente middleware o controlador
    next();
  };
};
