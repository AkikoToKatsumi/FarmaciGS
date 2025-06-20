// src/middleware/audit.middleware.ts
import { NextFunction, Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from './auth.middleware';

export const auditLog = (action: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (req.user) {
        await prisma.auditLog.create({
          data: {
            action,
            userId: req.user.id,
          },
        });
      }
    } catch (error) {
      console.error('Error al guardar en bitácora:', error);
    }
    next();
  };
};
