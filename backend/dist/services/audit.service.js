import pool from '../config/db';
// Función para crear un registro de bitácora en la base de datos
export const createAuditLog = async ({ userId, action, details }) => {
    await pool.query('INSERT INTO audit_logs (user_id, action, details, created_at) VALUES ($1, $2, $3, NOW())', [userId, action, details || null]);
};
