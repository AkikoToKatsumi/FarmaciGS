import pool from '../config/db'; // Usamos pool, no prisma
export const auditLog = (action) => {
    return async (req, res, next) => {
        try {
            if (req.user) {
                await pool.query('INSERT INTO audit_log (action, user_id) VALUES ($1, $2)', [action, req.user.id]);
            }
        }
        catch (error) {
            console.error('Error al guardar en bitácora:', error);
        }
        next();
    };
};
