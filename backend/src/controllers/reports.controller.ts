// src/controllers/reports.controller.ts
import { Request, Response } from 'express';
import pool from '../config/db';
import { backupService } from '../services/backup.service';

type AuthRequest = Request & { user: { id: number } };

export const getSalesReport = async (req: Request, res: Response) => {
  const { from, to } = req.query;
  const result = await pool.query(
    'SELECT * FROM sales WHERE created_at >= $1 AND created_at <= $2',
    [from, to]
  );
  res.json(result.rows);
};

export const getLowStock = async (_req: Request, res: Response) => {
  const result = await pool.query('SELECT * FROM medicines WHERE stock < 10');
  res.json(result.rows);
};

export const getExpiringMedicines = async (_: Request, res: Response) => {
  const now = new Date();
  const soon = new Date();
  soon.setMonth(soon.getMonth() + 1);
  const result = await pool.query(
    'SELECT * FROM medicines WHERE expiration_date >= $1 AND expiration_date <= $2',
    [now, soon]
  );
  res.json(result.rows);
};

export const backupDatabase = async (req: AuthRequest, res: Response) => {
  try {
    const backup = await backupService.createBackup(req.user.id);
    res.json(backup);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const listBackups = async (_req: Request, res: Response) => {
  try {
    const backups = await backupService.listBackups();
    res.json(backups);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBackup = async (req: Request, res: Response) => {
  try {
    const filename = req.params.filename;
    await backupService.deleteBackup(filename, (req as any).user?.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
