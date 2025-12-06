// c:\Farmacia GS\backend\src\middleware\roles.middleware.ts
// Importamos los tipos Response y NextFunction de Express.
import { Response, NextFunction } from 'express';
// Importamos nuestra interfaz AuthRequest, que ya tiene la información del usuario.
import { AuthRequest } from './auth.middleware';

// Middleware para autorizar por nombre de rol
export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    console.log('=== AUTHORIZATION CHECK ===');
    console.log('Method:', req.method);
    console.log('Path:', req.path);
    console.log('User from token:', req.user);
    console.log('User role:', req.user?.role_name);
    console.log('Allowed roles:', allowedRoles);
    console.log('Headers:', req.headers.authorization);

    const userRole = req.user?.role_name;
    
    if (!userRole) {
      console.log('❌ No user role found');
      return res.status(403).json({ message: 'Acceso denegado: No se encontró rol de usuario.' });
    }

    if (!allowedRoles.includes(userRole)) {
      console.log('❌ Role not authorized:', userRole, 'not in', allowedRoles);
      return res.status(403).json({ message: `Acceso denegado: Rol '${userRole}' no autorizado.` });
    }

    console.log('✅ Authorization successful for role:', userRole);
    console.log('=== END AUTHORIZATION CHECK ===');
    next();
  };
};

// Exportamos una función de orden superior 'authorizeRolesById' que crea un middleware de autorización.
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

