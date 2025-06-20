import { Router } from 'express';
import {
  getSalesReport,
  getExpiringMedicines,
  getLowStock,
} from '../controllers/reports.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/roles.middleware';

const router = Router();

router.get('/ventas', verifyToken, authorizeRoles('Administrador', 'Supervisor'), getSalesReport);
router.get('/vencimientos', verifyToken, authorizeRoles('Administrador', 'Supervisor'), getExpiringMedicines);
router.get('/bajo-stock', verifyToken, authorizeRoles('Administrador', 'Supervisor'), getLowStock);

export default router;
