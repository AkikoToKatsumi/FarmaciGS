// src/controllers/provider.controller.ts
import { Request, Response } from 'express';
import pool from '../config/db';
import { validateProviderInput } from '../validators/provider.validator';

// Obtener todos los proveedores
export const getProviders = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM providers ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting providers:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener un proveedor por ID
export const getProviderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM providers WHERE id = $1', [Number(id)]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting provider by ID:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Crear un nuevo proveedor
export const createProvider = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, taxId } = req.body;
    
    // Validar datos de entrada
    const validation = await validateProviderInput({ name, email, phone, taxId });
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
    }

    // Verificar si ya existe un proveedor con el mismo email o taxId
    const existingProvider = await pool.query(
      'SELECT id FROM providers WHERE email = $1 OR tax_id = $2',
      [email, taxId]
    );

    if (existingProvider.rows.length > 0) {
      return res.status(409).json({ 
        message: 'Ya existe un proveedor con el mismo email o número de identificación fiscal' 
      });
    }

    const result = await pool.query(
      'INSERT INTO providers (name, email, phone, tax_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, phone, taxId]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating provider:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar un proveedor
export const updateProvider = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, taxId } = req.body;
    
    // Validar datos de entrada
    const validation = await validateProviderInput({ name, email, phone, taxId });
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
    }

    // Verificar si existe otro proveedor con el mismo email o taxId
    const existingProvider = await pool.query(
      'SELECT id FROM providers WHERE (email = $1 OR tax_id = $2) AND id != $3',
      [email, taxId, Number(id)]
    );

    if (existingProvider.rows.length > 0) {
      return res.status(409).json({ 
        message: 'Ya existe otro proveedor con el mismo email o número de identificación fiscal' 
      });
    }

    const result = await pool.query(
      'UPDATE providers SET name = $1, email = $2, phone = $3, tax_id = $4 WHERE id = $5 RETURNING *',
      [name, email, phone, taxId, Number(id)]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating provider:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Eliminar un proveedor
export const deleteProvider = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar si el proveedor existe
    const existingProvider = await pool.query('SELECT id FROM providers WHERE id = $1', [Number(id)]);
    
    if (existingProvider.rows.length === 0) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }

    // Verificar si el proveedor tiene productos asociados (opcional)
    // const hasProducts = await pool.query('SELECT id FROM products WHERE provider_id = $1 LIMIT 1', [Number(id)]);
    // if (hasProducts.rows.length > 0) {
    //   return res.status(409).json({ message: 'No se puede eliminar el proveedor porque tiene productos asociados' });
    // }

    await pool.query('DELETE FROM providers WHERE id = $1', [Number(id)]);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting provider:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};