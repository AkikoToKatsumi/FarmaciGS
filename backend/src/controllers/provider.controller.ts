// src/controllers/provider.controller.ts
import { Request, Response } from 'express';
import pool from '../config/db';
import { validatePrescriptionInput } from '../validators/prescription.validator'; // ✅ Correcto
// Importa el validador para proveedores
export const getProviders = async (_req: Request, res: Response) => {
  const result = await pool.query('SELECT * FROM providers');
  res.json(result.rows);
};

export const getProviderById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await pool.query('SELECT * FROM providers WHERE id = $1', [Number(id)]);
  if (result.rows.length === 0) return res.status(404).json({ message: 'Proveedor no encontrado' });
  res.json(result.rows[0]);
};

export const createProvider = async (req: Request, res: Response) => {
  const { name, email, phone, taxId } = req.body;
  const validation = await validateProviderInput({ name, email, phone, taxId });
  if (!validation.isValid) {
    return res.status(400).json({ message: validation.message });
  }

  const result = await pool.query(
    'INSERT INTO providers (name, email, phone, tax_id) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, email, phone, taxId]
  );
  res.status(201).json(result.rows[0]);
};

export const updateProvider = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, phone, taxId } = req.body;
  const validation = await validateProviderInput({ name, email, phone, taxId });
  if (!validation.isValid) {
    return res.status(400).json({ message: validation.message });
  }

  const result = await pool.query(
    'UPDATE providers SET name = $1, email = $2, phone = $3, tax_id = $4 WHERE id = $5 RETURNING *',
    [name, email, phone, taxId, Number(id)]
  );
  if (result.rows.length === 0) return res.status(404).json({ message: 'Proveedor no encontrado' });
  res.json(result.rows[0]);
};

export const deleteProvider = async (req: Request, res: Response) => {
  const { id } = req.params;
  await pool.query('DELETE FROM providers WHERE id = $1', [Number(id)]);
  res.status(204).send();
};
