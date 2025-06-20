// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });

  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  const accessToken = jwt.sign({ id: user.id, role: user.role.name }, process.env.JWT_SECRET!, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });

  return res.json({ accessToken, refreshToken, user: { id: user.id, name: user.name, role: user.role.name } });
};

export const refreshToken = async (req: Request, res: Response) => {
  // Lógica para refrescar el token
  res.json({ message: 'Token refrescado' });
};

export const getProfile = async (req: Request, res: Response) => {
  // Lógica para obtener el perfil del usuario autenticado
  res.json({ message: 'Perfil del usuario' });
};
