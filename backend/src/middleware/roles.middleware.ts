// c:\Farmacia GS\backend\src\middleware\roles.middleware.ts
// Importamos los tipos Response y NextFunction de Express.
import { Response, NextFunction } from 'express';
// Importamos nuestra interfaz AuthRequest, que ya tiene la información del usuario.
import { AuthRequest } from './auth.middleware';


// Exportamos una función de orden superior 'authorizeRoles' que crea un middleware de autorización.
// Acepta una lista de roles permitidos como argumentos.
export const authorizeRolesById = (...allowedIds: number[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const roleId = req.user?.role_id;
    if (!roleId || !allowedIds.includes(roleId)) {
      return res.status(403).json({ message: 'Acceso denegado.' });
    }
    next();
  };
};

