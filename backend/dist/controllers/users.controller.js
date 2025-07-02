import pool from '../config/db';
export const getUsers = async (_req, res) => {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
};
export const getUserById = async (req, res) => {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0)
        return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(result.rows[0]);
};
export const createUser = async (req, res) => {
    const { name, email, password, roleId } = req.body;
    const result = await pool.query('INSERT INTO users (name, email, password, role_id) VALUES ($1, $2, $3, $4) RETURNING *', [name, email, password, roleId]);
    res.status(201).json(result.rows[0]);
};
export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, password, roleId } = req.body;
    const result = await pool.query('UPDATE users SET name = $1, email = $2, password = $3, role_id = $4 WHERE id = $5 RETURNING *', [name, email, password, roleId, id]);
    res.json(result.rows[0]);
};
export const deleteUser = async (req, res) => {
    const { id } = req.params;
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.status(204).send();
};
