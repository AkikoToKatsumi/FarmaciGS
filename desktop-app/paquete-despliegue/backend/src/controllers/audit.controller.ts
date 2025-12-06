// c:\Farmacia GS\backend\src\controllers\audit.controller.ts

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

// Función para obtener todos los registros de auditoría
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, user_id, action, date_from, date_to } = req.query;
    
    // Construir la consulta base
    let query = `
      SELECT 
        a.id,
        a.user_id,
        a.action,
        a.created_at,
        u.name as user_name,
        u.email as user_email
      FROM audit_log a
      LEFT JOIN users u ON a.user_id = u.id
    `;
    
    const conditions: string[] = [];
    const values: any[] = [];
    let paramCount = 0;
    
    // Filtros opcionales
    if (user_id) {
      conditions.push(`a.user_id = $${++paramCount}`);
      values.push(user_id);
    }
    
    if (action) {
      conditions.push(`a.action ILIKE $${++paramCount}`);
      values.push(`%${action}%`);
    }
    
    if (date_from) {
      conditions.push(`DATE(a.created_at AT TIME ZONE 'America/Santo_Domingo') >= $${++paramCount}`);
      values.push(date_from);
    }
    
    if (date_to) {
      conditions.push(`DATE(a.created_at AT TIME ZONE 'America/Santo_Domingo') <= $${++paramCount}`);
      values.push(date_to);
    }
    
    // Agregar condiciones WHERE si existen
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    // Agregar ordenamiento y paginación
    query += ` ORDER BY a.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    values.push(limit, (Number(page) - 1) * Number(limit));
    
    // Ejecutar la consulta
    const result = await pool.query(query, values);
    
    // Obtener el total de registros para paginación
    let countQuery = `
      SELECT COUNT(*) as total
      FROM audit_log a
      LEFT JOIN users u ON a.user_id = u.id
    `;
    
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    
    const countResult = await pool.query(countQuery, values.slice(0, -2)); // Excluir LIMIT y OFFSET
    const total = parseInt(countResult.rows[0].total, 10);
    
    logger.info(`Obteniendo registros de auditoría: ${result.rows.length} registros de ${total} total`);
    
    res.json({
      data: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    logger.error(`Error al obtener registros de auditoría: ${errorMessage}`);
    console.error('Error completo:', error);
    
    res.status(500).json({ 
      message: 'Error interno al obtener los registros de auditoría.',
      ...(process.env.NODE_ENV === 'development' && { error: errorMessage })
    });
  }
};

// Función para registrar una nueva actividad de auditoría
export const createAuditLog = async (userId: number, action: string) => {
  try {
    // Usar NOW() AT TIME ZONE para almacenar en zona horaria de República Dominicana
    await pool.query(
      `INSERT INTO audit_log (user_id, action, created_at) 
       VALUES ($1, $2, NOW() AT TIME ZONE 'America/Santo_Domingo')`,
      [userId, action]
    );
    
    logger.info(`Actividad de auditoría registrada: Usuario ${userId} - ${action}`);
  } catch (error) {
    logger.error(`Error al registrar actividad de auditoría: ${error}`);
    // No lanzar error para no interrumpir el proceso principal
  }
};

// Función para obtener estadísticas de auditoría
export const getAuditStats = async (req: Request, res: Response) => {
  try {
    const todayString = getTodayInDominicanRepublic();
    
    logger.info(`Obteniendo estadísticas de auditoría para la fecha (RD): ${todayString}`);
    
    // Actividades de hoy
    const todayActivities = await pool.query(
      `SELECT COUNT(*) as count 
       FROM audit_log 
       WHERE DATE(created_at AT TIME ZONE 'America/Santo_Domingo') = $1`,
      [todayString]
    );
    
    // Actividades por usuario (top 5)
    const userActivities = await pool.query(
      `SELECT 
        u.name,
        COUNT(a.id) as activity_count
       FROM audit_log a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE DATE(a.created_at AT TIME ZONE 'America/Santo_Domingo') = $1
       GROUP BY u.name
       ORDER BY activity_count DESC
       LIMIT 5`,
      [todayString]
    );
    
    // Tipos de actividades más comunes
    const commonActivities = await pool.query(
      `SELECT 
        CASE 
          WHEN action ILIKE '%venta%' THEN 'Ventas'
          WHEN action ILIKE '%inventario%' THEN 'Inventario'
          WHEN action ILIKE '%cliente%' THEN 'Clientes'
          WHEN action ILIKE '%login%' THEN 'Login'
          ELSE 'Otros'
        END as activity_type,
        COUNT(*) as count
       FROM audit_log
       WHERE DATE(created_at AT TIME ZONE 'America/Santo_Domingo') = $1
       GROUP BY activity_type
       ORDER BY count DESC`,
      [todayString]
    );
    
    res.json({
      todayActivities: parseInt(todayActivities.rows[0].count, 10),
      userActivities: userActivities.rows,
      commonActivities: commonActivities.rows
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    logger.error(`Error al obtener estadísticas de auditoría: ${errorMessage}`);
    
    res.status(500).json({ 
      message: 'Error interno al obtener estadísticas de auditoría.',
      ...(process.env.NODE_ENV === 'development' && { error: errorMessage })
    });
  }
};