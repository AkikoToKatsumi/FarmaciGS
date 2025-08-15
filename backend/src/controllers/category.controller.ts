import { Request, Response } from 'express';
import pool from '../config/db';

// Obtener todas las categorías
export const getCategories = async (_req: Request, res: Response) => {
  console.log('[GET] /api/categories - Iniciando solicitud');
  try {
    // Verificar conexión a la base de datos
    const testQuery = await pool.query('SELECT NOW()');
    console.log('Conexión a BD exitosa:', testQuery.rows[0]);
    
    // Obtener categorías
    const result = await pool.query('SELECT name FROM categories ORDER BY name ASC');
    const categories = result.rows.map(row => row.name);
    
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
      'INSERT INTO categories (name) VALUES ($1) RETURNING name', 
      [trimmedName]
    );
    
    res.status(201).json(result.rows[0].name);
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ message: 'Error al crear la categoría.' });
  }
};

// Eliminar una categoría
export const deleteCategory = async (req: Request, res: Response) => {
  console.log('[DELETE] /api/categories/' + req.params.id);
  try {
    const { id } = req.params;
    const categoryName = id.trim();

    // Verificar si hay medicamentos usando esta categoría (case-insensitive)
    const medicinesUsingCategory = await pool.query(
      'SELECT COUNT(*) as count FROM medicine WHERE LOWER(category) = LOWER($1)', 
      [categoryName]
    );
    if (parseInt(medicinesUsingCategory.rows[0].count) > 0) {
      return res.status(409).json({ 
        message: 'No se puede eliminar la categoría porque hay medicamentos que la usan.' 
      });
    }

    // Eliminar por nombre (case-insensitive)
    const result = await pool.query('DELETE FROM categories WHERE LOWER(name) = LOWER($1)', [categoryName]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Categoría no encontrada.' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({ message: 'Error al eliminar la categoría.' });
  }
};

