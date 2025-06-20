import { Router } from 'express';
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole
} from '../controllers/roles.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/roles.middleware';
import { auditLog } from '../middleware/audit.middleware';

const router = Router();

router.get('/', verifyToken, authorizeRoles('Administrador'), getRoles);
router.post('/', verifyToken, authorizeRoles('Administrador'), auditLog('CREAR_ROL'), createRole);
router.put('/:id', verifyToken, authorizeRoles('Administrador'), auditLog('EDITAR_ROL'), updateRole);
router.delete('/:id', verifyToken, authorizeRoles('Administrador'), auditLog('ELIMINAR_ROL'), deleteRole);

export default router;
