import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const role = req.user?.role;

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    next();
  };
};
