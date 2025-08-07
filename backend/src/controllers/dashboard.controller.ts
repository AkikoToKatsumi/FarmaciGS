// c:\Farmacia GS\backend\src\controllers\dashboard.controller.ts
import { Request, Response } from 'express';
import pool from '../config/db';
import { logger } from '../config/logger';

// Función helper para obtener la fecha actual en zona horaria de República Dominicana
const getTodayInDominicanRepublic = (): string => {
  const now = new Date();
  // Convertir a zona horaria de República Dominicana (America/Santo_Domingo)
  const dominicanTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Santo_Domingo"}));
  
  const year = dominicanTime.getFullYear();
  const month = String(dominicanTime.getMonth() + 1).padStart(2, '0');
  const day = String(dominicanTime.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Obtener la fecha actual en la zona horaria de República Dominicana
    const todayString = getTodayInDominicanRepublic();

    logger.info(`Obteniendo estadísticas del dashboard para la fecha (RD): ${todayString}`);

    // 1. Ventas del día - usando la columna correcta 'total'
    const salesTodayResult = await pool.query(
      `SELECT 
        COALESCE(SUM(total), 0) as daily_sales,
        COUNT(*) as sales_count,
        COUNT(DISTINCT client_id) as clients_served
       FROM sales 
       WHERE DATE(created_at AT TIME ZONE 'America/Santo_Domingo') = $1`,
      [todayString]
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

    // 3. Actividades recientes del audit_log - priorizar las de hoy
    const recentActivitiesResult = await pool.query(
      `SELECT 
        a.id, 
        a.action, 
        a.created_at, 
        u.name as user_name
       FROM audit_log a
       LEFT JOIN users u ON a.user_id = u.id
       ORDER BY 
         CASE WHEN DATE(a.created_at AT TIME ZONE 'America/Santo_Domingo') = $1 THEN 1 ELSE 2 END,
         a.created_at DESC
       LIMIT 10`,
      [todayString]
    );
    
    const recentActivities = recentActivitiesResult.rows.map(row => ({
      id: row.id,
      action: row.action,
      user: { name: row.user_name || 'Sistema' },
      created_at: row.created_at,
    }));
    console.log('DB recent activities rows:', recentActivitiesResult.rows);

    // 4. Productos vendidos - intentar con sale_items primero, luego fallback
    let productsSold = salesCount; // Fallback por defecto
    
    try {
      // Intentar con sale_items si existe
      const productsSoldResult = await pool.query(
        `SELECT COALESCE(SUM(si.quantity), 0) as products_sold
         FROM sale_items si
         INNER JOIN sales s ON si.sale_id = s.id
         WHERE DATE(s.created_at AT TIME ZONE 'America/Santo_Domingo') = $1`,
        [todayString]
      );
      productsSold = parseInt(productsSoldResult.rows[0].products_sold, 10) || salesCount;
    } catch (saleItemsError) {
      // Si sale_items no existe, usar prescription_medicines como estimación
      try {
        const productsSoldResult = await pool.query(
          `SELECT COALESCE(SUM(pm.quantity), 0) as products_sold
           FROM prescription_medicines pm
           INNER JOIN prescriptions p ON pm.prescription_id = p.id
           WHERE DATE(p.issued_at AT TIME ZONE 'America/Santo_Domingo') = $1`,
          [todayString]
        );
        productsSold = parseInt(productsSoldResult.rows[0].products_sold, 10) || salesCount;
      } catch (prescriptionError) {
        // Usar salesCount como último recurso
        logger.warn('No se pudieron obtener productos vendidos, usando cantidad de ventas');
      }
    }

    // --- NUEVO: Manejo de parámetro trendType ---
    const trendType = (req.query.trendType as string)?.toLowerCase() || 'semana';

    let salesTrend: Array<{ week: string; sales: number; returns: number; discounts: number }> = [];
    let totalSalesTrend: Array<{ date?: string; month?: string; year?: string; sales: number; returns: number; discounts: number }> = [];

    if (trendType === 'semana') {
      // Tendencia semanal: ventas netas y devoluciones por semana (últimas 8 semanas)
      const weeklyResult = await pool.query(`
        SELECT 
          TO_CHAR(DATE_TRUNC('week', s.created_at AT TIME ZONE 'America/Santo_Domingo'), 'IW/YYYY') AS week,
          COALESCE(SUM(s.total), 0) AS sales
        FROM sales s
        WHERE s.status IS NULL OR s.status != 'cancelled'
        GROUP BY week
        ORDER BY week DESC
        LIMIT 8
      `);

      // Sumar devoluciones reales desde la tabla returns
      const weeklyReturnsResult = await pool.query(`
        SELECT 
          TO_CHAR(DATE_TRUNC('week', r.created_at AT TIME ZONE 'America/Santo_Domingo'), 'IW/YYYY') AS week,
          COALESCE(SUM(r.amount), 0) AS returns
        FROM returns r
        GROUP BY week
        ORDER BY week DESC
        LIMIT 8
      `);

      // Sumar ventas canceladas como devoluciones
      const weeklyCancelledResult = await pool.query(`
        SELECT 
          TO_CHAR(DATE_TRUNC('week', s.created_at AT TIME ZONE 'America/Santo_Domingo'), 'IW/YYYY') AS week,
          COALESCE(SUM(s.total), 0) AS cancelled_returns
        FROM sales s
        WHERE s.status = 'cancelled'
        GROUP BY week
        ORDER BY week DESC
        LIMIT 8
      `);

      const returnsMap = new Map<string, number>();
      for (const row of weeklyReturnsResult.rows) {
        returnsMap.set(row.week, parseFloat(row.returns));
      }
      for (const row of weeklyCancelledResult.rows) {
        returnsMap.set(row.week, (returnsMap.get(row.week) || 0) + Math.abs(parseFloat(row.cancelled_returns)));
      }

      salesTrend = weeklyResult.rows.reverse().map(row => ({
        week: row.week,
        sales: parseFloat(row.sales) || 0,
        returns: returnsMap.get(row.week) || 0,
        discounts: 0
      }));
    } else if (trendType === 'mes') {
      // Tendencia mensual: ventas y devoluciones por mes (últimos 12 meses)
      const monthlyResult = await pool.query(`
        SELECT 
          TO_CHAR(DATE_TRUNC('month', s.created_at AT TIME ZONE 'America/Santo_Domingo'), 'MM/YYYY') AS month,
          COALESCE(SUM(s.total), 0) AS sales
        FROM sales s
        WHERE s.status IS NULL OR s.status != 'cancelled'
        GROUP BY month
        ORDER BY month DESC
        LIMIT 12
      `);

      const monthlyReturnsResult = await pool.query(`
        SELECT 
          TO_CHAR(DATE_TRUNC('month', r.created_at AT TIME ZONE 'America/Santo_Domingo'), 'MM/YYYY') AS month,
          COALESCE(SUM(r.amount), 0) AS returns
        FROM returns r
        GROUP BY month
        ORDER BY month DESC
        LIMIT 12
      `);

      const monthlyCancelledResult = await pool.query(`
        SELECT 
          TO_CHAR(DATE_TRUNC('month', s.created_at AT TIME ZONE 'America/Santo_Domingo'), 'MM/YYYY') AS month,
          COALESCE(SUM(s.total), 0) AS cancelled_returns
        FROM sales s
        WHERE s.status = 'cancelled'
        GROUP BY month
        ORDER BY month DESC
        LIMIT 12
      `);

      const returnsMap = new Map<string, number>();
      for (const row of monthlyReturnsResult.rows) {
        returnsMap.set(row.month, parseFloat(row.returns));
      }
      for (const row of monthlyCancelledResult.rows) {
        returnsMap.set(row.month, (returnsMap.get(row.month) || 0) + Math.abs(parseFloat(row.cancelled_returns)));
      }

      totalSalesTrend = monthlyResult.rows.reverse().map(row => ({
        month: row.month,
        sales: parseFloat(row.sales) || 0,
        returns: returnsMap.get(row.month) || 0,
        discounts: 0
      }));
    } else if (trendType === 'año') {
      // Tendencia anual: ventas y devoluciones por año (últimos 5 años)
      const yearlyResult = await pool.query(`
        SELECT 
          TO_CHAR(DATE_TRUNC('year', s.created_at AT TIME ZONE 'America/Santo_Domingo'), 'YYYY') AS year,
          COALESCE(SUM(s.total), 0) AS sales
        FROM sales s
        WHERE s.status IS NULL OR s.status != 'cancelled'
        GROUP BY year
        ORDER BY year DESC
        LIMIT 5
      `);

      const yearlyReturnsResult = await pool.query(`
        SELECT 
          TO_CHAR(DATE_TRUNC('year', r.created_at AT TIME ZONE 'America/Santo_Domingo'), 'YYYY') AS year,
          COALESCE(SUM(r.amount), 0) AS returns
        FROM returns r
        GROUP BY year
        ORDER BY year DESC
        LIMIT 5
      `);

      const yearlyCancelledResult = await pool.query(`
        SELECT 
          TO_CHAR(DATE_TRUNC('year', s.created_at AT TIME ZONE 'America/Santo_Domingo'), 'YYYY') AS year,
          COALESCE(SUM(s.total), 0) AS cancelled_returns
        FROM sales s
        WHERE s.status = 'cancelled'
        GROUP BY year
        ORDER BY year DESC
        LIMIT 5
      `);

      const returnsMap = new Map<string, number>();
      for (const row of yearlyReturnsResult.rows) {
        returnsMap.set(row.year, parseFloat(row.returns));
      }
      for (const row of yearlyCancelledResult.rows) {
        returnsMap.set(row.year, (returnsMap.get(row.year) || 0) + Math.abs(parseFloat(row.cancelled_returns)));
      }

      totalSalesTrend = yearlyResult.rows.reverse().map(row => ({
        year: row.year,
        sales: parseFloat(row.sales) || 0,
        returns: returnsMap.get(row.year) || 0,
        discounts: 0
      }));
    }

    // 5. Respuesta final
    const response: any = {
      dailySales: dailySales,
      productsSold: productsSold,
      clientsServed: clientsServed,
      lowStockCount: lowStockCount,
      recentActivities: recentActivities,
    };

    // Agregar tendencias según el tipo solicitado
    if (trendType === 'semana') {
      response.salesTrend = salesTrend;
    } else {
      response.totalSalesTrend = totalSalesTrend;
    }

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

// Función adicional para obtener solo las actividades de hoy
export const getTodayActivities = async (_req: Request, res: Response) => {
  try {
    const todayString = getTodayInDominicanRepublic();

    logger.info(`Obteniendo actividades de hoy (RD): ${todayString}`);

    const todayActivitiesResult = await pool.query(
      `SELECT 
        a.id, 
        a.action, 
        a.created_at, 
        u.name as user_name
       FROM audit_log a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE DATE(a.created_at AT TIME ZONE 'America/Santo_Domingo') = $1
       ORDER BY a.created_at DESC
       LIMIT 10`,
      [todayString]
    );

    const todayActivities = todayActivitiesResult.rows.map(row => ({
      id: row.id,
      action: row.action,
      user: { name: row.user_name || 'Sistema' },
      created_at: row.created_at,
    }));

    logger.info(`Actividades de hoy encontradas: ${todayActivities.length}`);
    res.json(todayActivities);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    logger.error(`Error en getTodayActivities: ${errorMessage}`);
    res.status(500).json({ 
      message: 'Error interno del servidor al obtener actividades de hoy.',
      ...(process.env.NODE_ENV === 'development' && { error: errorMessage })
    });
  }
};