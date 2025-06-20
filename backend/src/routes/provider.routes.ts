import { Router } from 'express';
import {
  getProviders,
  getProviderById,
  createProvider,
  updateProvider,
  deleteProvider
} from '../controllers/provider.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/roles.middleware';
import { auditLog } from '../middleware/audit.middleware';

const router = Router();

router.get('/', verifyToken, getProviders);
router.get('/:id', verifyToken, getProviderById);

router.post('/', verifyToken, authorizeRoles('Administrador'), auditLog('CREAR_PROVEEDOR'), createProvider);
router.put('/:id', verifyToken, authorizeRoles('Administrador'), auditLog('EDITAR_PROVEEDOR'), updateProvider);
router.delete('/:id', verifyToken, authorizeRoles('Administrador'), auditLog('ELIMINAR_PROVEEDOR'), deleteProvider);

export default router;
