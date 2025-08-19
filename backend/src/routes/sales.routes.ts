// src/routes/sales.routes.ts
import { Router } from 'express';
import * as salesController from '../controllers/sales.controller';
import { verifyToken }  from '../middleware/auth.middleware';

const router = Router();

router.use(verifyToken);

router.get('/', salesController.getSales);
router.get('/cashbox-summary', salesController.getCashboxSummary);
router.get('/:id', salesController.getSaleById);
router.post('/', salesController.createSale);
router.put('/:id', salesController.updateSale);
router.delete('/:id', salesController.deleteSale);
router.patch('/:id/cancel', salesController.cancelSale);

export default router;
