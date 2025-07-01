// inventory.controller.ts
import { Request, Response } from 'express';
import pool from '../db';

const validateMedicineInput = async (data: any) => {
  const { name, lot } = data;
  if (!name || !lot) {
    return { isValid: false, message: 'Nombre y lote son requeridos' };
  }
  return { isValid: true, message: '' };
};

export const getAllMedicines = async (_req: Request, res: Response) => {
  const result = await pool.query('SELECT * FROM medicines');
  res.json(result.rows);
};

export const getMedicineById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await pool.query('SELECT * FROM medicines WHERE id = $1', [Number(id)]);
  if (result.rows.length === 0) return res.status(404).json({ message: 'No encontrado' });
  res.json(result.rows[0]);
};

export const createMedicine = async (req: Request, res: Response) => {
  const { name, description, stock, price, expirationDate, lot } = req.body;
  const validation = await validateMedicineInput({ name, lot });
  if (!validation.isValid) return res.status(400).json({ message: validation.message });

  const result = await pool.query(
    'INSERT INTO medicines (name, description, stock, price, expiration_date, lot) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [name, description, stock, price, expirationDate, lot]
  );
  res.status(201).json(result.rows[0]);
};

export const updateMedicine = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const result = await pool.query(
      'UPDATE medicines SET name = $1, description = $2, stock = $3, price = $4, expiration_date = $5, lot = $6 WHERE id = $7 RETURNING *',
      [data.name, data.description, data.stock, data.price, data.expirationDate, data.lot, Number(id)]
    );
    if (result.rows.length === 0) throw new Error();
    res.json(result.rows[0]);
  } catch {
    res.status(404).json({ message: 'Medicamento no encontrado' });
  }
};

export const deleteMedicine = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM medicines WHERE id = $1', [Number(id)]);
    res.json({ message: 'Eliminado correctamente' });
  } catch {
    res.status(404).json({ message: 'No encontrado' });
  }
};

export const getAlerts = async (_req: Request, res: Response) => {
  const now = new Date();
  const threshold = 10;
  const soon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const result = await pool.query(
    'SELECT * FROM medicines WHERE stock < $1 OR expiration_date < $2',
    [threshold, soon]
  );
  res.json(result.rows);
};