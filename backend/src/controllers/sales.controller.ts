import { Request, Response } from 'express';
import pool from '../config/db';

export const getSales = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM sales ORDER BY created_at DESC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener ventas:", error);
    res.status(500).json({ message: 'Error al obtener ventas' });
  }
};

export const createSale = async (req: Request, res: Response) => {
  const { client_id, total_amount } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO sales (client_id, total_amount) VALUES ($1, $2) RETURNING *',
      [client_id, total_amount]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al crear venta:", error);
    res.status(500).json({ message: 'Error al crear venta' });
  }
};

export function getSaleById(arg0: string, getSaleById: any) {
    throw new Error('Function not implemented.');
}
export function updateSale(arg0: string, updateSale: any) {
    throw new Error('Function not implemented.');
}

export function deleteSale(arg0: string, deleteSale: any) {
    throw new Error('Function not implemented.');
}

