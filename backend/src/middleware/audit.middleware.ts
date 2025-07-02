// src/middleware/audit.middleware.ts
import { NextFunction, Response } from 'express';
import pool from '../config/db'; // Usamos pool, no prisma
import { AuthRequest } from './auth.middleware';

export const auditLog = (action: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (req.user) {
        await pool.query(
          'INSERT INTO audit_log (action, user_id) VALUES ($1, $2)',
          [action, req.user.id]
        );
      }
    } catch (error) {
      console.error('Error al guardar en bitácora:', error);
    }
    next();
  };
};
