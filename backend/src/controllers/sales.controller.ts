// Exportar cuadre de caja en CSV
export const exportCashboxSummary = async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Obtener ventas del día con detalles
    const salesResult = await pool.query(
      `SELECT s.id, s.user_id, s.client_id, s.total, s.created_at, s.payment_method, s.status,
              u.name as user_name, c.name as client_name
       FROM sales s
       LEFT JOIN users u ON s.user_id = u.id
       LEFT JOIN clients c ON s.client_id = c.id
       WHERE s.created_at >= $1 AND s.created_at < $2 AND s.status IS DISTINCT FROM 'cancelled'`,
      [today, tomorrow]
    );
    const sales = salesResult.rows;

    let totalSales = 0;
    let totalTransactions = sales.length;
    let byPaymentMethod: Record<string, number> = {};

    // Para cada venta, obtener sus productos
    let ventasDetalles: string[] = [];
    for (const sale of sales) {
      totalSales += Number(sale.total);
      const method = sale.payment_method || 'Desconocido';
      byPaymentMethod[method] = (byPaymentMethod[method] || 0) + Number(sale.total);

      // Obtener productos de la venta
      const itemsResult = await pool.query(
        `SELECT si.medicine_id, si.quantity, si.unit_price, si.total_price, m.name as medicine_name
         FROM sale_items si
         LEFT JOIN medicine m ON si.medicine_id = m.id
         WHERE si.sale_id = $1`,
        [sale.id]
      );
      const items = itemsResult.rows;

      ventasDetalles.push(`Venta #${sale.id},Cliente: ${sale.client_name || 'Ocasional'},Usuario: ${sale.user_name},Método: ${method},Total: ${sale.total}`);
      ventasDetalles.push('Producto,Cantidad,Precio Unitario,Total Producto');
      for (const item of items) {
        ventasDetalles.push(`${item.medicine_name},${item.quantity},${item.unit_price},${item.total_price}`);
      }
      ventasDetalles.push('');
    }

    // Construir CSV
    let csv = 'Cuadre de Caja del Día\n';
    csv += `Total de ventas,${totalSales.toFixed(2)}\n`;
    csv += `Transacciones,${totalTransactions}\n`;
    csv += 'Método de pago,Total\n';
    for (const [method, amount] of Object.entries(byPaymentMethod)) {
      csv += `${method},${amount.toFixed(2)}\n`;
    }
    csv += '\nDETALLE DE VENTAS DEL DÍA\n';
    csv += ventasDetalles.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="cuadre_caja.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Error al exportar cuadre de caja:', error);
    res.status(500).json({ message: 'Error interno al exportar el cuadre de caja.' });
  }
};
// Cuadre de caja: resumen de ventas del día
export const getCashboxSummary = async (req: AuthRequest, res: Response) => {
  try {
    // Obtener fecha actual (solo ventas de hoy)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Ventas del día
    const salesResult = await pool.query(
      `SELECT payment_method, total FROM sales WHERE created_at >= $1 AND created_at < $2 AND status IS DISTINCT FROM 'cancelled'`,
      [today, tomorrow]
    );
    const sales = salesResult.rows;

    let totalSales = 0;
    let totalTransactions = sales.length;
    let byPaymentMethod: Record<string, number> = {};

    for (const sale of sales) {
      totalSales += Number(sale.total);
      const method = sale.payment_method || 'Desconocido';
      byPaymentMethod[method] = (byPaymentMethod[method] || 0) + Number(sale.total);
    }

    res.json({ totalSales, totalTransactions, byPaymentMethod });
  } catch (error) {
    console.error('Error al obtener cuadre de caja:', error);
    res.status(500).json({ message: 'Error interno al obtener el cuadre de caja.' });
  }
};

// Obtener detalles completos del cuadre de caja
export const getCashboxDetails = async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Obtener ventas del día con detalles
    const salesResult = await pool.query(
      `SELECT s.id, s.user_id, s.client_id, s.total, s.created_at, s.payment_method, s.status,
              u.name as user_name, c.name as client_name
       FROM sales s
       LEFT JOIN users u ON s.user_id = u.id
       LEFT JOIN clients c ON s.client_id = c.id
       WHERE s.created_at >= $1 AND s.created_at < $2 AND s.status IS DISTINCT FROM 'cancelled'
       ORDER BY s.created_at DESC`,
      [today, tomorrow]
    );
    const sales = salesResult.rows;

    let totalSales = 0;
    let totalTransactions = sales.length;
    let byPaymentMethod: Record<string, number> = {};

    // Para cada venta, obtener sus productos
    const salesWithDetails = [];
    for (const sale of sales) {
      totalSales += Number(sale.total);
      const method = sale.payment_method || 'Desconocido';
      byPaymentMethod[method] = (byPaymentMethod[method] || 0) + Number(sale.total);

      // Obtener productos de la venta
      const itemsResult = await pool.query(
        `SELECT si.medicine_id, si.quantity, si.unit_price, si.total_price, m.name as medicine_name
         FROM sale_items si
         LEFT JOIN medicine m ON si.medicine_id = m.id
         WHERE si.sale_id = $1`,
        [sale.id]
      );
      const items = itemsResult.rows;

      salesWithDetails.push({
        ...sale,
        items: items
      });
    }

    res.json({
      summary: { totalSales, totalTransactions, byPaymentMethod },
      sales: salesWithDetails
    });
  } catch (error) {
    console.error('Error al obtener detalles del cuadre de caja:', error);
    res.status(500).json({ message: 'Error interno al obtener los detalles del cuadre de caja.' });
  }
};

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

// Nueva función: Cancelar factura (solo admin)
export const cancelSale = async (req: AuthRequest, res: Response) => {
  try {
    // Solo admin puede cancelar
    if (!req.user || req.user.role_name !== 'admin') {
      return res.status(403).json({ message: 'Solo el administrador puede cancelar facturas.' });
    }

    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: 'ID de factura inválido.' });
    }

    // Verificar si la venta existe y no está ya cancelada
    const saleResult = await pool.query('SELECT * FROM sales WHERE id = $1', [id]);
    if (saleResult.rows.length === 0) {
      return res.status(404).json({ message: 'Factura no encontrada.' });
    }
    const sale = saleResult.rows[0];
    if (sale.status === 'cancelled') {
      return res.status(400).json({ message: 'La factura ya está cancelada.' });
    }

    // Obtener detalles de productos vendidos
    const itemsResult = await pool.query(
      `SELECT si.medicine_id, si.quantity, si.unit_price, si.total_price, m.name as medicine_name
       FROM sale_items si
       LEFT JOIN medicine m ON si.medicine_id = m.id
       WHERE si.sale_id = $1`,
      [id]
    );

    // Marcar la venta como cancelada
    await pool.query('UPDATE sales SET status = $1 WHERE id = $2', ['cancelled', id]);

    // Revertir stock de los productos vendidos
    for (const item of itemsResult.rows) {
      await pool.query('UPDATE medicine SET stock = stock + $1 WHERE id = $2', [item.quantity, item.medicine_id]);
    }

    // Registrar en el audit_log
    await pool.query(
      'INSERT INTO audit_log (user_id, action, created_at) VALUES ($1, $2, NOW())',
      [req.user.id, `Factura #${id} cancelada por admin`]
    );

    res.json({
      message: 'Factura cancelada correctamente.',
      sale: {
        id: sale.id,
        total: sale.total,
        created_at: sale.created_at,
        payment_method: sale.payment_method,
        client_id: sale.client_id,
        status: 'cancelled'
      },
      items: itemsResult.rows
    });
  } catch (error) {
    console.error('Error al cancelar factura:', error);
    res.status(500).json({ message: 'Error interno al cancelar la factura.' });
  }
};