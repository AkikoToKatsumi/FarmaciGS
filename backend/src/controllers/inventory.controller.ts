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
        console.log('[GET] /api/inventory', { category, search });
        let query = `
            SELECT m.*, p.name as provider_name
            FROM medicine m
            LEFT JOIN providers p ON m.provider_id = p.id
        `;
        const params: any[] = [];
        const conditions: string[] = [];

        if (category) {
            conditions.push(`m.category = $${params.length + 1}`);
            params.push(category);
        }

        if (search) {
            conditions.push(`(m.name ILIKE $${params.length + 1} OR m.description ILIKE $${params.length + 1})`);
            params.push(`%${search}%`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        query += ' ORDER BY m.name ASC';
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
        // Loguea el cuerpo recibido para depuración
        console.log('[POST] /api/inventory - Body recibido:', req.body);

        let { name, description, stock, price, expirationDate, lot, category, barcode, provider_id, category_id } = req.body;

        // Detectar si la tabla 'medicine' tiene columna 'category' o 'category_id'
        // Hacer la comprobación más robusta asegurando el schema (public)
        const colsResult = await pool.query(
            "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'medicine' AND column_name IN ('category','category_id')"
        );
        const existingCols = colsResult.rows.map((r: any) => r.column_name);
        const hasCategoryNameCol = existingCols.includes('category');
        const hasCategoryIdCol = existingCols.includes('category_id');
        console.log('[DB SCHEMA] medicine columns:', existingCols);

        // Validar los datos de entrada
        const validation = validateMedicineInput(req.body);
        if (!validation.isValid) {
            return res.status(400).json({ message: validation.message });
        }

        // Manejar category / category_id de forma flexible
        let finalCategoryName: string | null = null;
        let finalCategoryId: number | null = null;

        if (category_id !== undefined && category_id !== null) {
            // Se recibió category_id directo
            if (isNaN(Number(category_id))) {
                return res.status(400).json({ message: 'category_id inválido.' });
            }
            const catById = await pool.query('SELECT id, name FROM categories WHERE id = $1', [Number(category_id)]);
            if (catById.rows.length === 0) {
                return res.status(404).json({ message: 'Categoría no encontrada.' });
            }
            finalCategoryId = Number(category_id);
            finalCategoryName = catById.rows[0].name;
        } else if (category !== undefined && category !== null && category !== '') {
            // Se recibió category por nombre
            const catByName = await pool.query('SELECT id, name FROM categories WHERE LOWER(name) = LOWER($1)', [category]);
            if (catByName.rows.length === 0) {
                return res.status(400).json({ message: 'La categoría seleccionada no existe.' });
            }
            finalCategoryId = catByName.rows[0].id;
            finalCategoryName = catByName.rows[0].name;
        } else {
            // No se envió categoría: permitir NULL si la columna lo permite
            finalCategoryId = null;
            finalCategoryName = null;
        }

        // Validar provider_id
        if (!provider_id || isNaN(Number(provider_id))) {
            return res.status(400).json({ message: 'Debe seleccionar un proveedor válido.' });
        }
        const providerCheck = await pool.query('SELECT id FROM providers WHERE id = $1', [provider_id]);
        if (providerCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Proveedor no encontrado.' });
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

        // Construir INSERT dinámico según columnas disponibles (category o category_id)
        const insertFields: string[] = ['name', 'description', 'stock', 'price', 'expiration_date', 'lot', 'barcode', 'provider_id'];
        const insertValues: any[] = [name, description, stock, price, expirationDate, lot, barcode, provider_id];

        // Insertar la columna de categoría justo antes de 'barcode' si la tabla la tiene.
        // Preferir category_id cuando exista; sólo insertar columna si existe en la tabla.
        const barcodePos = insertFields.indexOf('barcode') >= 0 ? insertFields.indexOf('barcode') : insertFields.length;
        if (hasCategoryIdCol) {
            // Siempre usar category_id en la tabla si existe (incluso para NULL)
            insertFields.splice(barcodePos, 0, 'category_id');
            insertValues.splice(barcodePos, 0, finalCategoryId); // puede ser number o null
        } else if (hasCategoryNameCol) {
            insertFields.splice(barcodePos, 0, 'category');
            insertValues.splice(barcodePos, 0, finalCategoryName); // puede ser string o null
        }

        const placeholders = insertFields.map((_, i) => `$${i + 1}`).join(', ');
        const insertQuery = `INSERT INTO medicine (${insertFields.join(', ')}) VALUES (${placeholders}) RETURNING *`;

        const result = await pool.query(insertQuery, insertValues);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        // Loguea el error completo para depuración
        console.error('Error al crear medicamento:', error);
        // Imprimir stack si está disponible para facilitar el diagnóstico
        if (error && (error as any).stack) {
            console.error((error as any).stack);
        }

        // Si la tabla categories no existe, dar instrucción clara
        const errStr = String(error);
        if (errStr.includes('relation "categories"') || errStr.includes('does not exist')) {
            return res.status(500).json({
                message: 'Error interno del servidor: la tabla "categories" no existe. Ejecuta el script SQL para crearla.',
                error: process.env.NODE_ENV === 'development' ? errStr : undefined
            });
        }

        res.status(500).json({
            message: 'Error interno del servidor.',
            error: process.env.NODE_ENV === 'development' ? errStr : undefined
        });
    }
};

// Actualizar un medicamento existente
export const updateMedicine = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, stock, price, expirationDate, lot, category, barcode, provider_id } = req.body;

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

        // Validar category/category_id si se envía (flexible)
        let finalCategoryNameUpdate: string | null = null;
        let finalCategoryIdUpdate: number | null = null;

        if (req.body.category_id !== undefined) {
            if (isNaN(Number(req.body.category_id))) {
                return res.status(400).json({ message: 'category_id inválido.' });
            }
            const cat = await pool.query('SELECT id, name FROM categories WHERE id = $1', [Number(req.body.category_id)]);
            if (cat.rows.length === 0) return res.status(404).json({ message: 'Categoría no encontrada.' });
            finalCategoryIdUpdate = Number(req.body.category_id);
            finalCategoryNameUpdate = cat.rows[0].name;
        } else if (category !== undefined) {
            if (category !== null && category !== '') {
                const cat = await pool.query('SELECT id, name FROM categories WHERE LOWER(name) = LOWER($1)', [category]);
                if (cat.rows.length === 0) return res.status(400).json({ message: 'La categoría seleccionada no existe.' });
                finalCategoryIdUpdate = cat.rows[0].id;
                finalCategoryNameUpdate = cat.rows[0].name;
            } else {
                finalCategoryIdUpdate = null;
                finalCategoryNameUpdate = null;
            }
        }

        // Validar provider_id si se envía
        if (provider_id !== undefined) {
            if (!provider_id || isNaN(Number(provider_id))) {
                return res.status(400).json({ message: 'Debe seleccionar un proveedor válido.' });
            }
            const providerCheck = await pool.query('SELECT id FROM providers WHERE id = $1', [provider_id]);
            if (providerCheck.rows.length === 0) {
                return res.status(404).json({ message: 'Proveedor no encontrado.' });
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
        // Añadir category o category_id según esquema (comprobación robusta del schema)
        const colsResult = await pool.query(
            "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'medicine' AND column_name IN ('category','category_id')"
        );
        const existingCols = colsResult.rows.map((r: any) => r.column_name);
        const hasCategoryNameCol = existingCols.includes('category');
        const hasCategoryIdCol = existingCols.includes('category_id');

        // Sólo agregar la columna si existe en la tabla. Permitir también establecer NULL si se envió explicitamente.
        if (hasCategoryIdCol && finalCategoryIdUpdate !== undefined) {
            fields.push(`category_id = $${queryIndex++}`); values.push(finalCategoryIdUpdate);
        } else if (hasCategoryNameCol && finalCategoryNameUpdate !== undefined) {
            fields.push(`category = $${queryIndex++}`); values.push(finalCategoryNameUpdate);
        }

        if (barcode !== undefined) { fields.push(`barcode = $${queryIndex++}`); values.push(barcode); }
        if (provider_id !== undefined) { fields.push(`provider_id = $${queryIndex++}`); values.push(provider_id); }

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
        const result = await pool.query('SELECT id, name FROM categories ORDER BY name ASC');
        res.json(result.rows); // [{id, name}]
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
// Obtener todos los proveedores
export const getProviders = async (_req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT id, name FROM providers ORDER BY name ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener proveedores:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};
  
