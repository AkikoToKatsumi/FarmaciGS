// src/middleware/validation.middleware.ts
// Importa los tipos Request, Response y NextFunction de Express
import { Request, Response, NextFunction } from 'express';
// Importa el tipo ZodSchema para validación de esquemas con zod
import { ZodSchema } from 'zod';

// Middleware para validar el cuerpo de la petición usando un esquema de Zod
export const validateBody = (schema: ZodSchema) => {
  // Devuelve un middleware que valida req.body contra el esquema
  return (req: Request, res: Response, next: NextFunction) => {
    // Valida el cuerpo de la petición
    const result = schema.safeParse(req.body);
    if (!result.success) {
      // Si la validación falla, responde con error 400 y los errores de formato
      return res.status(400).json({ errors: result.error.format() });
    }
    // Si la validación es exitosa, actualiza req.body con los datos validados
    req.body = result.data;
    // Continúa con el siguiente middleware o controlador
    next();
  };
};
