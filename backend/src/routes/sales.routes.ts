import { Router, Request, Response } from 'express';
import { createSale, getAllSales, getSaleById, exportSalesToCSV } from '../controllers/sales.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/sales', verifyToken, createSale as unknown as (req: Request, res: Response) => any);
router.get('/', verifyToken, getAllSales);
router.get('/:id', verifyToken, getSaleById as unknown as (req: Request, res: Response) => any);
router.get('/export/csv', verifyToken, exportSalesToCSV);

export default router;
