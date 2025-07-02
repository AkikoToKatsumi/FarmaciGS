import pool from '../config/db';
export const getAuditLogs = async (_req, res) => {
    const result = await pool.query('SELECT * FROM audit_log ORDER BY created_at DESC');
    res.json(result.rows);
};
