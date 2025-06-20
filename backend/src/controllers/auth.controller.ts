import { Request, Response } from 'express';
// @ts-ignore
import bcrypt from 'bcrypt';
import { prisma } from '../config/database';
import {
  generateAccessToken,
  // generateRefreshToken, // Eliminado
  verifyRefreshToken
} from '../config/jwt';
import crypto from 'crypto';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true }
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role.name
  };

  const accessToken = generateAccessToken(payload);

  // 🔒 Generate secure refresh token and store hash
  const refreshTokenRaw = crypto.randomBytes(64).toString('hex');
  const refreshTokenHash = crypto.createHash('sha256').update(refreshTokenRaw).digest('hex');

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 días

  await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt
    }
  });

  res.json({ accessToken, refreshToken: refreshTokenRaw, user: payload });
};

export const refreshToken = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) return res.status(400).json({ message: 'Token requerido' });

  try {
    const payload = verifyRefreshToken(token);
    const accessToken = generateAccessToken(
      typeof payload === 'object' && payload !== null ? payload : {}
    );
    res.json({ accessToken });
  } catch (err) {
    res.status(403).json({ message: 'Refresh token inválido' });
  }
};
