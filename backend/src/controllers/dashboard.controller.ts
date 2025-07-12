// c:\Farmacia GS\backend\src\controllers\dashboard.controller.ts
import { Request, Response } from 'express';
import pool from '../config/db';
import { logger } from '../config/logger';

export const getDashboardStats = async (_req: Request, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
    
    logger.info(`Obteniendo estadísticas del dashboard para la fecha: ${today}`);

    // 1. Ventas del día - usando la columna correcta 'total'
    const salesTodayResult = await pool.query(
      `SELECT 
        COALESCE(SUM(total), 0) as daily_sales,
        COUNT(*) as sales_count,
        COUNT(DISTINCT client_id) as clients_served
       FROM sales 
       WHERE DATE(created_at) = $1`,
      [today]
    );
    
    const salesData = salesTodayResult.rows[0] || { daily_sales: 0, sales_count: 0, clients_served: 0 };
    const dailySales = parseFloat(salesData.daily_sales) || 0;
    const salesCount = parseInt(salesData.sales_count, 10) || 0;
    const clientsServed = parseInt(salesData.clients_served, 10) || 0;

    // 2. Productos con stock bajo (menos de 10 unidades)
    const lowStockResult = await pool.query(
      'SELECT COUNT(*) as count FROM medicine WHERE stock < 10'
    );
    const lowStockCount = parseInt(lowStockResult.rows[0].count, 10) || 0;

    // 3. Actividades recientes del audit_log
    const recentActivitiesResult = await pool.query(
      `SELECT 
        a.id, 
        a.action, 
        a.created_at, 
        u.name as user_name
       FROM audit_log a
       LEFT JOIN users u ON a.user_id = u.id
       ORDER BY a.created_at DESC
       LIMIT 5`
    );
    
    const recentActivities = recentActivitiesResult.rows.map(row => ({
      id: row.id,
      action: row.action,
      user: { name: row.user_name || 'Sistema' },
      created_at: row.created_at,
    }));

    // 4. Productos vendidos - intentar con sale_items primero, luego fallback
    let productsSold = salesCount; // Fallback por defecto
    
    try {
      // Intentar con sale_items si existe
      const productsSoldResult = await pool.query(
        `SELECT COALESCE(SUM(si.quantity), 0) as products_sold
         FROM sale_items si
         INNER JOIN sales s ON si.sale_id = s.id
         WHERE DATE(s.created_at) = $1`,
        [today]
      );
      productsSold = parseInt(productsSoldResult.rows[0].products_sold, 10) || salesCount;
    } catch (saleItemsError) {
      // Si sale_items no existe, usar prescription_medicines como estimación
      try {
        const productsSoldResult = await pool.query(
          `SELECT COALESCE(SUM(pm.quantity), 0) as products_sold
           FROM prescription_medicines pm
           INNER JOIN prescriptions p ON pm.prescription_id = p.id
           WHERE DATE(p.issued_at) = $1`,
          [today]
        );
        productsSold = parseInt(productsSoldResult.rows[0].products_sold, 10) || salesCount;
      } catch (prescriptionError) {
        // Usar salesCount como último recurso
        logger.warn('No se pudieron obtener productos vendidos, usando cantidad de ventas');
      }
    }

    // 5. Respuesta final
    const response = {
      dailySales: dailySales,
      productsSold: productsSold,
      clientsServed: clientsServed,
      lowStockCount: lowStockCount,
      recentActivities: recentActivities,
    };

    logger.info('Estadísticas del dashboard obtenidas exitosamente:', response);
    res.json(response);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    logger.error(`Error en getDashboardStats: ${errorMessage}`);
    logger.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Si es un error específico de PostgreSQL, log más detalles
    if (error instanceof Error && 'code' in error) {
      logger.error('Código de error PostgreSQL:', (error as any).code);
      logger.error('Detalles del error:', (error as any).detail);
    }
    
    res.status(500).json({ 
      message: 'Error interno del servidor al obtener estadísticas.',
      ...(process.env.NODE_ENV === 'development' && { error: errorMessage })
    });
  }
};