import { Router, Request, Response } from 'express';
import { createSale, getAllSales, getSaleById } from '../controllers/sales.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyToken);

router.post('/', createSale);
router.get('/', getAllSales);
router.get('/:id', getSaleById);

export default router;
