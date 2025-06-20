import { Router } from 'express';
import {
  getMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} from '../controllers/inventory.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/roles.middleware';
import { auditLog } from '../middleware/audit.middleware';

const router = Router();

router.get('/', verifyToken, getMedicines);
router.post('/', verifyToken, authorizeRoles('Administrador'), auditLog('CREAR_MEDICAMENTO'), createMedicine);
router.put('/:id', verifyToken, authorizeRoles('Administrador'), auditLog('EDITAR_MEDICAMENTO'), updateMedicine);
router.delete('/:id', verifyToken, authorizeRoles('Administrador'), auditLog('ELIMINAR_MEDICAMENTO'), deleteMedicine);

export default router;
