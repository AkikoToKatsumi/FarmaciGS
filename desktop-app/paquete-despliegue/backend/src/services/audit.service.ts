import pool from '../config/db';

// Interfaz para los parámetros requeridos al crear un registro de bitácora (audit log)
export interface CreateAuditLogParams {
  userId: number; // ID del usuario que realiza la acción
  action: string; // Acción realizada
  details?: string; // Detalles adicionales de la acción (opcional)
}

// Función para crear un registro de bitácora en la base de datos
export const createAuditLog = async ({ userId, action, details }: CreateAuditLogParams) => {
  await pool.query(
    'INSERT INTO audit_logs (user_id, action, details, created_at) VALUES ($1, $2, $3, NOW())',
    [userId, action, details || null]
  );
};
