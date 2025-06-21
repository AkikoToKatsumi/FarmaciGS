// Importa los tipos de Request y Response de Express
import { Request, Response } from 'express';
// Importa bcrypt para comparar contraseñas hasheadas
// @ts-ignore
import bcrypt from 'bcrypt';
// Importa la instancia de Prisma para interactuar con la base de datos
import { prisma } from '../config/database';
// Importa funciones para generar y verificar tokens JWT
import {
  generateAccessToken,
  // generateRefreshToken, // Eliminado
  verifyRefreshToken
} from '../config/jwt';
// Importa crypto para generar y hashear tokens de refresco
import crypto from 'crypto';

// Controlador para el login de usuarios
export const login = async (req: Request, res: Response) => {
  // Extrae email y contraseña del cuerpo de la petición
  const { email, password } = req.body;

  // Busca el usuario por email e incluye su rol
  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true }
  });

  // Si el usuario no existe o la contraseña no coincide, responde con error 401
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  // Prepara el payload para el token JWT
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role.name
  };

  // Genera el token de acceso
  const accessToken = generateAccessToken(payload);

  // 🔒 Genera un refresh token seguro y almacena su hash en la base de datos
  const refreshTokenRaw = crypto.randomBytes(64).toString('hex');
  const refreshTokenHash = crypto.createHash('sha256').update(refreshTokenRaw).digest('hex');

  // Calcula la fecha de expiración del refresh token (7 días)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 días

  // Guarda la sesión con el hash del refresh token
  await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt
    }
  });

  // Devuelve el accessToken, el refreshToken (sin hashear) y los datos del usuario
  res.json({ accessToken, refreshToken: refreshTokenRaw, user: payload });
};

// Controlador para refrescar el accessToken usando un refreshToken válido
export const refreshToken = async (req: Request, res: Response) => {
  const { token } = req.body;

  // Si no se envía el token, responde con error 400
  if (!token) return res.status(400).json({ message: 'Token requerido' });

  try {
    // Verifica el refreshToken
    const payload = verifyRefreshToken(token);
    // Genera un nuevo accessToken usando el payload del refreshToken
    const accessToken = generateAccessToken(
      typeof payload === 'object' && payload !== null ? payload : {}
    );
    // Devuelve el nuevo accessToken
    res.json({ accessToken });
  } catch (err) {
    // Si el refreshToken es inválido, responde con error 403
    res.status(403).json({ message: 'Refresh token inválido' });
  }
};
