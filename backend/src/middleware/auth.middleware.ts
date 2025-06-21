// Importa los tipos Request, Response y NextFunction de Express
import { Request, Response, NextFunction } from 'express';
// Importa jwt por si se requiere manipulación directa de tokens
import jwt from 'jsonwebtoken';
// Importa la función para verificar el token de acceso
import { verifyAccessToken } from '../config/jwt';

// Define la interfaz AuthRequest que extiende Request para incluir la propiedad user
export interface AuthRequest extends Request {
  user?: any;
}

// Middleware para verificar el token JWT en las rutas protegidas
export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Obtiene el header de autorización
  const authHeader = req.headers.authorization;

  // Si no hay header, responde con error 401
  if (!authHeader) return res.status(401).json({ message: 'Token no proporcionado' });

  // Extrae el token del header (formato: 'Bearer <token>')
  const token = authHeader.split(' ')[1];

  try {
    // Verifica y decodifica el token
    const decoded = verifyAccessToken(token);
    // Asigna el usuario decodificado a la petición
    req.user = decoded;
    // Continúa con el siguiente middleware o controlador
    next();
  } catch (err) {
    // Si el token es inválido o expiró, responde con error 403
    return res.status(403).json({ message: 'Token inválido o expirado' });
  }
};
