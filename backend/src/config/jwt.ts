// Importa las funciones y tipos necesarios de la librería jsonwebtoken
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
// Importa dotenv para cargar variables de entorno desde el archivo .env
import dotenv from 'dotenv';
// Carga las variables de entorno en process.env
dotenv.config();

// Obtiene el secreto para firmar el JWT de acceso desde las variables de entorno
const JWT_SECRET = process.env.JWT_SECRET;
// Obtiene el secreto para firmar el JWT de refresco desde las variables de entorno
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// Si no se encuentra el secreto de acceso, lanza un error
if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined');
// Si no se encuentra el secreto de refresco, lanza un error
if (!JWT_REFRESH_SECRET) throw new Error('JWT_REFRESH_SECRET is not defined');

// Genera un token de acceso (JWT) con el payload proporcionado
export const generateAccessToken = (payload: string | object | Buffer): string => {
  return jwt.sign(payload, JWT_SECRET as Secret, {
    // El token expira según la variable de entorno o 15 minutos por defecto
    expiresIn: process.env.JWT_EXPIRES_IN || '15m'
  } as SignOptions);
};

// Genera un token de refresco (JWT) con el payload proporcionado
export const generateRefreshToken = (payload: string | object | Buffer): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET as Secret, {
    // El token de refresco expira según la variable de entorno o 7 días por defecto
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  } as SignOptions);
};

// Verifica la validez de un token de acceso
export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET as Secret);
};

// Verifica la validez de un token de refresco
export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, JWT_REFRESH_SECRET as Secret);
};
