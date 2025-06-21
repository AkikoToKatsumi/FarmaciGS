// Importa Router de Express para definir rutas
import { Router } from 'express';
// Importa los controladores de roles
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole
} from '../controllers/roles.controller';
// Importa el middleware para verificar el token JWT
import { verifyToken } from '../middleware/auth.middleware';
// Importa el middleware para autorizar por roles
import { authorizeRoles } from '../middleware/roles.middleware';
// Importa el middleware para registrar acciones en la bitácora
import { auditLog } from '../middleware/audit.middleware';

// Crea una nueva instancia de Router
const router = Router();

// Ruta para obtener todos los roles (solo Administrador)
router.get('/', verifyToken, authorizeRoles('Administrador'), getRoles);
// Ruta para crear un rol (solo Administrador, registra en bitácora)
router.post('/', verifyToken, authorizeRoles('Administrador'), auditLog('CREAR_ROL'), createRole);
// Ruta para actualizar un rol (solo Administrador, registra en bitácora)
router.put('/:id', verifyToken, authorizeRoles('Administrador'), auditLog('EDITAR_ROL'), updateRole);
// Ruta para eliminar un rol (solo Administrador, registra en bitácora)
router.delete('/:id', verifyToken, authorizeRoles('Administrador'), auditLog('ELIMINAR_ROL'), deleteRole);

// Exporta el router para ser usado en la aplicación principal
export default router;
