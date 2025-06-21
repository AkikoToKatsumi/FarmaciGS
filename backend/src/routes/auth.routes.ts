// Importa Router de Express para definir rutas
import { Router } from 'express';
// Importa los controladores de autenticación
import { login, refreshToken } from '../controllers/auth.controller';
// Importa el middleware para validar el cuerpo de la petición
import { validateBody } from '../middleware/validation.middleware';
// Importa el middleware para verificar el token (no usado aquí pero disponible)
import { verifyToken } from '../middleware/auth.middleware';
// Importa zod para definir esquemas de validación
import { z } from 'zod';

// Crea una nueva instancia de Router
const router = Router();

// Esquema de validación para el login usando zod
const loginSchema = z.object({
  email: z.string().email(), // El email debe ser válido
  password: z.string().min(6), // La contraseña debe tener al menos 6 caracteres
});

// Ruta para login, valida el cuerpo antes de llamar al controlador
router.post('/login', validateBody(loginSchema), login);
// Ruta para refrescar el token de acceso
router.post('/refresh-token', refreshToken);

// Exporta el router para ser usado en la aplicación principal
export default router;

