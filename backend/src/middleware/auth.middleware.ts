// c:\Farmacia GS\backend\src\middleware\auth.middleware.ts
// Importamos los tipos Request, Response y NextFunction de Express.
import { Request, Response, NextFunction } from 'express';
// Importamos la librería jsonwebtoken para trabajar con JWT.
import jwt, { JwtPayload } from 'jsonwebtoken';

// Exportamos una interfaz personalizada 'AuthRequest' que extiende la Request de Express.
// Esto nos permite añadir la propiedad 'user' a la solicitud para almacenar los datos del token decodificado.
export interface AuthRequest extends Request {
  user?: any; // El usuario decodificado del token.
}

// Exportamos el middleware 'verifyToken' para proteger nuestras rutas.
export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  console.log('[AUTH MIDDLEWARE] Verificando token...');
  
  const authHeader = req.headers.authorization;
  console.log('Auth header:', authHeader ? 'Presente' : 'Ausente');
  
  if (!authHeader) {
    console.log('[AUTH MIDDLEWARE] No se encontró header de autorización');
    return res.status(401).json({ message: 'Token de acceso requerido' });
  }

  const token = authHeader.split(' ')[1];
  
  if (!token) {
    console.log('[AUTH MIDDLEWARE] Token malformado');
    return res.status(401).json({ message: 'Token de acceso requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    console.log('[AUTH MIDDLEWARE] Token válido para usuario:', decoded.id);
    // Guarda el usuario decodificado en req.user
    req.user = decoded;
    next();
  } catch (error) {
    console.log('[AUTH MIDDLEWARE] Token inválido:', error);
    return res.status(401).json({ message: 'Token inválido' });
  }
};
