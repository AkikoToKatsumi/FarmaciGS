import { Request, Response } from 'express';
import pool from '../config/db';

// Obtener todas las categorías
export const getCategories = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener categorías.' });
  }
};

// Crear una nueva categoría
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'El nombre es obligatorio.' });
    }
    const exists = await pool.query('SELECT id FROM categories WHERE name = $1', [name.trim()]);
    if (exists.rows.length > 0) {
      return res.status(409).json({ message: 'La categoría ya existe.' });
    }
    const result = await pool.query('INSERT INTO categories (name) VALUES ($1) RETURNING *', [name.trim()]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la categoría.' });
  }
};

// Eliminar una categoría
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM categories WHERE id = $1', [Number(id)]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la categoría.' });
  }
};
