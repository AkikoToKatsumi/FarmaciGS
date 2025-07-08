// c:\Farmacia GS\backend\src\middleware\roles.middleware.ts
// Importamos los tipos Response y NextFunction de Express.
import { Response, NextFunction } from 'express';
// Importamos nuestra interfaz AuthRequest, que ya tiene la información del usuario.
import { AuthRequest } from './auth.middleware';

// Exportamos una función de orden superior 'authorizeRoles' que crea un middleware de autorización.
// Acepta una lista de roles permitidos como argumentos.
export const authorizeRoles = (...allowedRoles: string[]) => {
  // Devolvemos la función middleware.
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Obtenemos el rol del usuario desde el objeto 'req.user' que fue añadido por el middleware 'verifyToken'.
    const role = req.user?.role;
    
    // Verificamos si el rol del usuario NO está incluido en la lista de roles permitidos.
    if (!allowedRoles.includes(role)) {
      // Si el rol no está permitido, devolvemos un error 403 (Prohibido).
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    // Si el rol del usuario está en la lista de permitidos, pasamos al siguiente middleware o controlador.
    next();
  };
};
