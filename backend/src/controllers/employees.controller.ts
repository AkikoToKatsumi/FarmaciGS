// employees.controller.ts
import { Request, Response } from 'express';
import pool from '../db';
import bcrypt from 'bcryptjs';
import { validateEmployeeInput } from '../validators/employee.validator';

export const createEmployee = async (req: Request, res: Response) => {
  const validation = await validateEmployeeInput(req.body);
  if (!validation.isValid) return res.status(400).json({ message: validation.message });

  const { name, email, password, roleId } = req.body;
  const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (existingUser.rows.length > 0) {
    return res.status(400).json({ message: 'Ya existe un empleado con ese correo electrónico.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'INSERT INTO users (name, email, password, role_id) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, email, hashedPassword, roleId]
  );
  res.status(201).json(result.rows[0]);
};

export const getEmployees = async (_: Request, res: Response) => {
  const result = await pool.query(
    `SELECT users.*, roles.name as role_name 
     FROM users 
     LEFT JOIN roles ON users.role_id = roles.id`
  );
  return res.json(result.rows);
};

export const getAllUsers = getEmployees;

export const getUserById = async (req: Request, res: Response) => {
  const result = await pool.query(
    `SELECT users.*, roles.name as role_name 
     FROM users 
     LEFT JOIN roles ON users.role_id = roles.id
     WHERE users.id = $1`,
    [Number(req.params.id)]
  );
  if (result.rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json(result.rows[0]);
};

export const createUser = createEmployee;

export const updateUser = async (req: Request, res: Response) => {
  const { name, email, roleId } = req.body;
  if (email) {
    const existingEmail = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingEmail.rows.length > 0 && existingEmail.rows[0].id !== Number(req.params.id)) {
      return res.status(400).json({ message: 'Ese correo ya pertenece a otro empleado.' });
    }
  }
  const result = await pool.query(
    'UPDATE users SET name = $1, email = $2, role_id = $3 WHERE id = $4 RETURNING *',
    [name, email, roleId, Number(req.params.id)]
  );
  res.json(result.rows[0]);
};

export const deleteUser = async (req: Request, res: Response) => {
  await pool.query('DELETE FROM users WHERE id = $1', [Number(req.params.id)]);
  res.json({ message: 'Usuario eliminado correctamente' });
};
