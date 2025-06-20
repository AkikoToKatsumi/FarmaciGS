import { Router } from 'express';
import { createSale, getSales } from '../controllers/sales.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { auditLog } from '../middleware/audit.middleware';

const router = Router();

router.get('/', verifyToken, getSales);
router.post('/', verifyToken, auditLog('CREAR_VENTA'), createSale);

export default router;
