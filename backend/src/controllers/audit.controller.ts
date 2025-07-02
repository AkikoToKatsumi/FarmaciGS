// src/controllers/audit.controller.ts
import { Request, Response } from 'express';
import pool from '../config/db';

export const getAuditLogs = async (_req: Request, res: Response) => {
  const result = await pool.query('SELECT * FROM audit_log ORDER BY created_at DESC');
  res.json(result.rows);
};
