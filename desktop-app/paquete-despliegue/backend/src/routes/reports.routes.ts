// src/routes/reports.routes.ts
import { Router } from 'express';
import * as reportsController from '../controllers/reports.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { getSalesReport } from '../controllers/reports.controller';


const router = Router();

router.use(verifyToken);

router.get('/sales', getSalesReport);
router.get('/low-stock', reportsController.getLowStock); // Cambia '/stock' a '/low-stock'
router.get('/expiring', reportsController.getExpiringMedicine);
router.get('/backup', reportsController.listBackups);
router.post('/backup', verifyToken, reportsController.backupDatabase as unknown as import('express').RequestHandler);
router.delete('/backup/:filename', reportsController.deleteBackup);


export default router;