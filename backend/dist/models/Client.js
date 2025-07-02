import pool from '../config/db';
export const getAllClients = async () => {
    const result = await pool.query('SELECT * FROM clients');
    return result.rows;
};
