import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || '12345';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

/**
 * Genera un token de acceso JWT con un payload dado.
 */
export const generateAccessToken = (payload: object): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verifica y decodifica un access token JWT.
 */
export const verifyAccessToken = (token: string): any => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * Verifica y decodifica un refresh token JWT.
 */
export const verifyRefreshToken = (token: string): any => {
  return jwt.verify(token, JWT_SECRET);
};
