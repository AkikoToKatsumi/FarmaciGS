// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../config/db';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  if (!user) {
    return res.status(401).json({ message: 'Usuario no encontrado' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Contraseña incorrecta' });
  }

  const token = jwt.sign({ id: user.id, role: user.role_id }, process.env.JWT_SECRET!, {
    expiresIn: '1h',
  });

  // Cambia la respuesta para que sea compatible con el frontend
  res.json({ user, accessToken: token });
};
