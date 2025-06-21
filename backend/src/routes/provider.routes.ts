// Importa Router de Express para definir rutas
import { Router } from 'express';
// Importa los controladores de proveedores
import {
  getProviders,
  getProviderById,
  createProvider,
  updateProvider,
  deleteProvider
} from '../controllers/provider.controller';
// Importa el middleware para verificar el token JWT
import { verifyToken } from '../middleware/auth.middleware';
// Importa el middleware para autorizar por roles
import { authorizeRoles } from '../middleware/roles.middleware';
// Importa el middleware para registrar acciones en la bitácora
import { auditLog } from '../middleware/audit.middleware';

// Crea una nueva instancia de Router
const router = Router();

// Ruta para obtener todos los proveedores (requiere autenticación)
router.get('/', verifyToken, getProviders);
// Ruta para obtener un proveedor por ID (requiere autenticación)
router.get('/:id', verifyToken, getProviderById);

// Ruta para crear un proveedor (solo Administrador, registra en bitácora)
router.post('/', verifyToken, authorizeRoles('Administrador'), auditLog('CREAR_PROVEEDOR'), createProvider);
// Ruta para actualizar un proveedor (solo Administrador, registra en bitácora)
router.put('/:id', verifyToken, authorizeRoles('Administrador'), auditLog('EDITAR_PROVEEDOR'), updateProvider);
// Ruta para eliminar un proveedor (solo Administrador, registra en bitácora)
router.delete('/:id', verifyToken, authorizeRoles('Administrador'), auditLog('ELIMINAR_PROVEEDOR'), deleteProvider);

// Exporta el router para ser usado en la aplicación principal
export default router;
