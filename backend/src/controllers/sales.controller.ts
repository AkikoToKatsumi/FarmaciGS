// src/controllers/sales.controller.ts

import { Response } from 'express';
import pool from '../config/db';
import { generateSalePDF } from '../services/pdf.service'; // asegúrate que esto exista
import { AuthRequest } from '../middleware/auth.middleware';

interface SaleItem {
  medicineId: number;
  quantity: number;
}

export const getSales = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT 
        s.id, 
        s.user_id, 
        s.client_id, 
        s.total, 
        s.created_at,
        u.name as user_name,
        c.name as client_name
       FROM sales s
       LEFT JOIN users u ON s.user_id = u.id
       LEFT JOIN clients c ON s.client_id = c.id
       ORDER BY s.created_at DESC`
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({ message: 'Error interno al obtener las ventas.' });
  }
};

export const getSaleById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const saleResult = await pool.query(
      `SELECT 
        s.id, 
        s.user_id, 
        s.client_id, 
        s.total, 
        s.created_at,
        u.name as user_name,
        c.name as client_name
       FROM sales s
       LEFT JOIN users u ON s.user_id = u.id
       LEFT JOIN clients c ON s.client_id = c.id
       WHERE s.id = $1`,
      [id]
    );
    
    if (saleResult.rows.length === 0) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }
    
    const itemsResult = await pool.query(
      `SELECT 
        si.id,
        si.medicine_id,
        si.quantity,
        si.unit_price,
        si.total_price,
        m.name as medicine_name
       FROM sale_items si
       LEFT JOIN medicine m ON si.medicine_id = m.id
       WHERE si.sale_id = $1`,
      [id]
    );
    
    res.json({
      sale: saleResult.rows[0],
      items: itemsResult.rows
    });
  } catch (error) {
    console.error('Error al obtener venta:', error);
    res.status(500).json({ message: 'Error interno al obtener la venta.' });
  }
};

export const updateSale = async (req: AuthRequest, res: Response) => {
  res.json({ message: 'Actualizar venta (a implementar)' });
};

export const deleteSale = async (req: AuthRequest, res: Response) => {
  res.json({ message: 'Eliminar venta (a implementar)' });
};

export const createSale = async (req: AuthRequest, res: Response) => {
  console.log('=== INICIO CREATE SALE ===');
  console.log('Usuario del token:', req.user);
  console.log('Body recibido:', req.body);
  
  const client = await pool.connect();
  try {
    const { userId, clientId, items, paymentMethod, rnc }: { userId: number; clientId: number | null; items: SaleItem[]; paymentMethod: string; rnc?: string } = req.body;
    console.log('Datos procesados:', { userId, clientId, items, paymentMethod, rnc });
    
    if (!items || items.length === 0) {
      console.log('Error: No hay items');
      return res.status(400).json({ message: 'No hay productos en la venta.' });
    }

    await client.query('BEGIN');
    console.log('Transacción iniciada');

    // 1. Calcular total y validar stock
    let total = 0;
    const saleItems: any[] = [];

    for (const item of items) {
      const product = await client.query('SELECT id, name, stock, price FROM medicine WHERE id = $1', [item.medicineId]);
      const medicine = product.rows[0];

      if (!medicine) {
        throw new Error(`Producto con ID ${item.medicineId} no encontrado`);
      }

      if (medicine.stock < item.quantity) {
        throw new Error(`Stock insuficiente para "${medicine.name}". Stock disponible: ${medicine.stock}`);
      }

      const unitPrice = Number(medicine.price);
      const subtotal = unitPrice * item.quantity;
      total += subtotal;

      if (isNaN(total)) {
        throw new Error('Error al calcular el total de la venta');
      }

      saleItems.push({
        medicine_id: medicine.id,
        name: medicine.name,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: subtotal,
      });

      console.log(`Producto procesado: ${medicine.name}, Cantidad: ${item.quantity}, Subtotal: $${subtotal.toFixed(2)}`);
    }

    // 2. Insertar venta
    const saleResult = await client.query(
      'INSERT INTO sales (user_id, client_id, total, payment_method, rnc, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
      [userId, clientId, total, paymentMethod, rnc || null]
    );
    const sale = saleResult.rows[0];
    console.log('Venta creada:', sale);

    // 3. Insertar items vendidos y descontar stock
    for (const item of saleItems) {
      await client.query(
        'INSERT INTO sale_items (sale_id, medicine_id, quantity, unit_price, total_price) VALUES ($1, $2, $3, $4, $5)',
        [sale.id, item.medicine_id, item.quantity, item.unit_price, item.total_price]
      );

      await client.query(
        'UPDATE medicine SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.medicine_id]
      );
      
      console.log(`Stock actualizado para medicina ID ${item.medicine_id}: -${item.quantity}`);
    }

    // 4. Registrar actividad en audit_log
    try {
      let clientName = 'Cliente ocasional';
      if (clientId) {
        const clientResult = await client.query('SELECT name FROM clients WHERE id = $1', [clientId]);
        clientName = clientResult.rows[0]?.name || 'Cliente desconocido';
      }
      
      const auditAction = `Venta registrada - Total: ${total.toFixed(2)} - Cliente: ${clientName} - Productos: ${saleItems.length}`;
      
      await client.query(
        'INSERT INTO audit_log (user_id, action, created_at) VALUES ($1, $2, NOW())',
        [userId, auditAction]
      );
      
      console.log('Actividad de auditoría registrada:', auditAction);
    } catch (auditError) {
      console.error('Error al registrar auditoría:', auditError);
      // No interrumpir la transacción por error de auditoría
    }
    // Después de insertar items y antes de generar PDF
let clienteInfo = {
  nombre_cliente: undefined,
  rnc_cliente: undefined,
  cedula_cliente: undefined,
  direccion_cliente: undefined
};
if (clientId) {
  const cliRes = await client.query(
    'SELECT name, rnc, cedula, address FROM clients WHERE id = $1',
    [clientId]
  );
  const cli = cliRes.rows[0];
  clienteInfo = {
    nombre_cliente: cli.name,
    rnc_cliente: cli.rnc,
    cedula_cliente: cli.cedula,
    direccion_cliente: cli.address
  };
}
    console.log('Información del cliente obtenida:', clienteInfo);

    // 5. Generar PDF
    let pdfBuffer = null;
    try {
      const saleForPDF: any = { ...sale, ...clienteInfo };
      pdfBuffer = await generateSalePDF(saleForPDF, saleItems);
      console.log('PDF generado exitosamente');
    } catch (pdfError) {
      console.error('Error al generar PDF:', pdfError);
      // Continuar sin PDF si falla la generación
    }

    await client.query('COMMIT');
    console.log('Transacción completada exitosamente');

    const response: any = {
      sale,
      items: saleItems,
      message: 'Venta registrada exitosamente'
    };

    if (pdfBuffer) {
      response.pdf = pdfBuffer.toString('base64');
    }

    res.status(201).json(response);

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error al registrar venta:', error);
    res.status(500).json({ 
      message: error.message || 'Error interno al registrar la venta.',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    client.release();
  }
};