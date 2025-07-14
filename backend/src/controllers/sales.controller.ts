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
  res.json({ message: 'Listado de ventas (a implementar)' });
};

export const getSaleById = async (req: AuthRequest, res: Response) => {
  res.json({ message: 'Detalle de venta por ID (a implementar)' });
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
    const { userId, clientId, items }: { userId: number; clientId: number | null; items: SaleItem[] } = req.body;
   console.log('Datos procesados:', { userId, clientId, items });
    if (!items || items.length === 0) {
        console.log('Error: No hay items');
      return res.status(400).json({ message: 'No hay productos en la venta.' });
    }

    await client.query('BEGIN');
       console.log('Transacción iniciada');

    // 1. Calcular total
    let total = 0;
    const saleItems: any[] = [];

    for (const item of items) {
      const product = await client.query('SELECT id, name, stock, price FROM medicine WHERE id = $1', [item.medicineId]);
      const medicine = product.rows[0];

      if (!medicine) {
        throw new Error(`Producto con ID ${item.medicineId} no encontrado`);
      }

      if (medicine.stock < item.quantity) {
        throw new Error(`Stock insuficiente para "${medicine.name}"`);
      }

      const subtotal = medicine.price * item.quantity;
      total += subtotal;

      saleItems.push({
        medicine_id: medicine.id,
        name: medicine.name,
        quantity: item.quantity,
        unit_price: medicine.price,
        total_price: subtotal,
      });
    }

    // 2. Insertar venta
    const saleResult = await client.query(
      'INSERT INTO sales (user_id, client_id, total) VALUES ($1, $2, $3) RETURNING *',
      [userId, clientId, total]
    );
    const sale = saleResult.rows[0];

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
    }

    // 4. Generar PDF
    const pdfBuffer = await generateSalePDF(sale, saleItems);

    await client.query('COMMIT');

    res.status(201).json({
      sale,
      items: saleItems,
      pdf: pdfBuffer.toString('base64'), // el frontend puede convertirlo a Blob y abrirlo
    });

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error al registrar venta:', error);
    res.status(500).json({ message: error.message || 'Error interno al registrar la venta.' });
  } finally {
    client.release();
  }
};
