//s\inventory.controller.ts
import { Request, Response } from 'express';
import pool from '../config/db';

// Validación de entrada mejorada
const validateMedicineInput = (data: any) => {
    const { name, stock, price, expirationDate, lot } = data;
    
    if (!name || !lot) {
        return { isValid: false, message: 'El nombre y el lote son requeridos.' };
    }
    
    if (stock === undefined || price === undefined || !expirationDate) {
        return { isValid: false, message: 'Stock, precio y fecha de expiración son requeridos.' };
    }
    
    if (stock < 0) {
        return { isValid: false, message: 'El stock no puede ser negativo.' };
    }
    
    if (price < 0) {
        return { isValid: false, message: 'El precio no puede ser negativo.' };
    }
    
    // Validación de fecha de expiración
    const expDate = new Date(expirationDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (expDate < today) {
        return { isValid: false, message: 'La fecha de expiración no puede ser anterior a hoy.' };
    }
    
    return { isValid: true, message: '' };
};

// Obtener todos los medicamentos con filtros opcionales
export const getAllMedicine = async (req: Request, res: Response) => {
    try {
        const { category, search } = req.query;
        let query = 'SELECT * FROM medicine';
        const params: any[] = [];
        const conditions: string[] = [];
        
        if (category) {
            conditions.push(`category = $${params.length + 1}`);
            params.push(category);
        }
        
        if (search) {
            conditions.push(`(name ILIKE $${params.length + 1} OR description ILIKE $${params.length + 1})`);
            params.push(`%${search}%`);
        }
        
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        
        query += ' ORDER BY name ASC';
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener medicamentos:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Obtener un medicamento por ID
export const getMedicineById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ message: 'ID de medicamento inválido.' });
        }
        
        const result = await pool.query('SELECT * FROM medicine WHERE id = $1', [Number(id)]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Medicamento no encontrado.' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener medicamento:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Crear un nuevo medicamento
export const createMedicine = async (req: Request, res: Response) => {
    try {
        let { name, description, stock, price, expirationDate, lot, category, barcode } = req.body;

        // Validar los datos de entrada
        const validation = validateMedicineInput(req.body);
        if (!validation.isValid) {
            return res.status(400).json({ message: validation.message });
        }

        // Generar código de barras automático si no se proporciona
        if (!barcode) {
            const timestamp = Date.now().toString();
            const random = Math.random().toString(36).substr(2, 6).toUpperCase();
            barcode = `MED-${timestamp}-${random}`;
        }

        // Verificar si ya existe un medicamento con el mismo código de barras
        const existingBarcode = await pool.query('SELECT id FROM medicine WHERE barcode = $1', [barcode]);
        if (existingBarcode.rows.length > 0) {
            return res.status(409).json({ message: 'Ya existe un medicamento con ese código de barras.' });
        }

        // Insertar el nuevo medicamento
        const result = await pool.query(
            'INSERT INTO medicine (name, description, stock, price, expiration_date, lot, category, barcode) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [name, description, stock, price, expirationDate, lot, category, barcode]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear medicamento:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Actualizar un medicamento existente
export const updateMedicine = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, stock, price, expirationDate, lot, category, barcode } = req.body;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ message: 'ID de medicamento inválido.' });
        }

        // Validaciones condicionales para actualización
        if (stock !== undefined && stock < 0) {
            return res.status(400).json({ message: 'El stock no puede ser negativo.' });
        }
        
        if (price !== undefined && price < 0) {
            return res.status(400).json({ message: 'El precio no puede ser negativo.' });
        }

        if (expirationDate) {
            const expDate = new Date(expirationDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (expDate < today) {
                return res.status(400).json({ message: 'La fecha de expiración no puede ser anterior a hoy.' });
            }
        }

        // Verificar si el medicamento existe
        const existingMedicine = await pool.query('SELECT id FROM medicine WHERE id = $1', [Number(id)]);
        if (existingMedicine.rows.length === 0) {
            return res.status(404).json({ message: 'Medicamento no encontrado.' });
        }

        // Verificar código de barras único si se está actualizando
        if (barcode) {
            const existingBarcode = await pool.query('SELECT id FROM medicine WHERE barcode = $1 AND id != $2', [barcode, Number(id)]);
            if (existingBarcode.rows.length > 0) {
                return res.status(409).json({ message: 'Ya existe un medicamento con ese código de barras.' });
            }
        }

        // Construir la consulta de actualización dinámicamente
        const fields: string[] = [];
        const values: any[] = [];
        let queryIndex = 1;

        if (name !== undefined) { fields.push(`name = $${queryIndex++}`); values.push(name); }
        if (description !== undefined) { fields.push(`description = $${queryIndex++}`); values.push(description); }
        if (stock !== undefined) { fields.push(`stock = $${queryIndex++}`); values.push(stock); }
        if (price !== undefined) { fields.push(`price = $${queryIndex++}`); values.push(price); }
        if (expirationDate !== undefined) { fields.push(`expiration_date = $${queryIndex++}`); values.push(expirationDate); }
        if (lot !== undefined) { fields.push(`lot = $${queryIndex++}`); values.push(lot); }
        if (category !== undefined) { fields.push(`category = $${queryIndex++}`); values.push(category); }
        if (barcode !== undefined) { fields.push(`barcode = $${queryIndex++}`); values.push(barcode); }

        if (fields.length === 0) {
            return res.status(400).json({ message: 'No se proporcionaron campos para actualizar.' });
        }

        // Agregar timestamp de actualización
        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(Number(id));
        const updateQuery = `UPDATE medicine SET ${fields.join(', ')} WHERE id = $${queryIndex} RETURNING *`;

        const result = await pool.query(updateQuery, values);
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error al actualizar medicamento:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Eliminar un medicamento
export const deleteMedicine = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ message: 'ID de medicamento inválido.' });
        }

        // Verificar si el medicamento existe antes de eliminar
        const existingMedicine = await pool.query('SELECT id FROM medicine WHERE id = $1', [Number(id)]);
        if (existingMedicine.rows.length === 0) {
            return res.status(404).json({ message: 'Medicamento no encontrado.' });
        }

        // Eliminar el medicamento
        await pool.query('DELETE FROM medicine WHERE id = $1', [Number(id)]);
        res.json({ message: 'Medicamento eliminado correctamente.' });
    } catch (error) {
        console.error('Error al eliminar medicamento:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Obtener alertas de inventario (stock bajo y próximos a expirar)
export const getAlerts = async (req: Request, res: Response) => {
    try {
        const now = new Date();
        const threshold = parseInt(req.query.threshold as string) || 10; // Stock bajo configurable
        const daysAhead = parseInt(req.query.daysAhead as string) || 30; // Días de anticipación para expiración
        
        const soon = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
        
        const result = await pool.query(
            'SELECT *, CASE WHEN stock <= $1 THEN \'low_stock\' WHEN expiration_date <= $2 THEN \'expiring_soon\' ELSE \'other\' END as alert_type FROM medicine WHERE stock <= $1 OR expiration_date <= $2 ORDER BY expiration_date ASC, stock ASC',
            [threshold, soon]
        );
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener alertas:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Obtener estadísticas del inventario
export const getInventoryStats = async (req: Request, res: Response) => {
    try {
        const statsQuery = `
            SELECT 
                COUNT(*) as total_products,
                SUM(stock) as total_stock,
                COUNT(DISTINCT category) as categories_count,
                SUM(stock * price) as total_value,
                COUNT(CASE WHEN stock <= 10 THEN 1 END) as low_stock_count,
                COUNT(CASE WHEN expiration_date <= CURRENT_DATE + INTERVAL '30 days' THEN 1 END) as expiring_soon_count
            FROM medicine
        `;
        
        const result = await pool.query(statsQuery);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Obtener categorías únicas
export const getCategories = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT DISTINCT category FROM medicine WHERE category IS NOT NULL ORDER BY category ASC');
        res.json(result.rows.map(row => row.category));
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};
export const getMedicineByBarcode = async (req: Request, res: Response) => {
  try {
    const { barcode } = req.params;

    if (!barcode) {
      return res.status(400).json({ message: 'Código de barras requerido' });
    }

    const result = await pool.query(
      'SELECT * FROM medicine WHERE barcode = $1',
      [barcode]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Medicamento no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al buscar medicamento por código de barras:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
