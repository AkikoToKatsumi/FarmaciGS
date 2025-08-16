import { Request, Response } from 'express';
import pool from '../config/db';

// Obtener todas las categorías
export const getCategories = async (_req: Request, res: Response) => {
  console.log('[GET] /api/categories - Iniciando solicitud');
  try {
    // Verificar conexión a la base de datos
    const testQuery = await pool.query('SELECT NOW()');
    console.log('Conexión a BD exitosa:', testQuery.rows[0]);
    
  // Obtener categorías (id y name)
  const result = await pool.query('SELECT id, name FROM categories ORDER BY name ASC');
  const categories = result.rows.map(row => ({ id: row.id, name: row.name }));
    
  console.log('Categorías encontradas:', categories.length);
  console.log('Categorías:', categories);
    
  res.json(categories);
  } catch (error) {
    console.error('Error completo:', error);
    res.status(500).json({ 
      message: 'Error al obtener categorías.',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Crear una nueva categoría
export const createCategory = async (req: Request, res: Response) => {
  console.log('[POST] /api/categories', req.body);
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'El nombre es obligatorio.' });
    }
    
    const trimmedName = name.trim();
    
    // Verificar si ya existe
    const exists = await pool.query('SELECT id FROM categories WHERE LOWER(name) = LOWER($1)', [trimmedName]);
    if (exists.rows.length > 0) {
      return res.status(409).json({ message: 'La categoría ya existe.' });
    }
    
    const result = await pool.query(
      'INSERT INTO categories (name) VALUES ($1) RETURNING id, name', 
      [trimmedName]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ message: 'Error al crear la categoría.' });
  }
};

// Eliminar una categoría
export const deleteCategory = async (req: Request, res: Response) => {
  console.log('[DELETE] /api/categories/' + req.params.id);
  const { id } = req.params;
  const idNum = Number(id);

  // Validar que el id sea un entero positivo
  if (!Number.isInteger(idNum) || idNum <= 0) {
    return res.status(400).json({ error: 'Invalid category id' });
  }

  try {
    // Verificar si existen medicinas asociadas a la categoría
    const refCheck = await pool.query(
      'SELECT COUNT(*)::int AS cnt FROM medicine WHERE category_id = $1',
      [idNum]
    );
    const refs = refCheck.rows[0]?.cnt ?? 0;
    if (refs > 0) {
      return res.status(409).json({ error: 'Cannot delete category with associated medicines' });
    }

    // Intentar borrar la categoría
    const result = await pool.query(
      'DELETE FROM categories WHERE id = $1',
      [idNum]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    return res.status(204).send();
  } catch (err) {
    console.error('[DELETE] /api/categories/%s\nError al eliminar categoría:', id, err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

