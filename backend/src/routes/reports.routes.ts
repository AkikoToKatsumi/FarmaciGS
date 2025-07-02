// src/routes/reports.routes.ts
import { Router } from 'express';
import * as reportsController from '../controllers/reports.controller';
import { verifyToken } from '../middleware/auth.middleware';


const router = Router();

router.use(verifyToken);

router.get('/sales', reportsController.getSalesReport);
router.get('/stock', reportsController.getLowStock);
router.get('/expiring', reportsController.getExpiringMedicines);
router.get('/backup', reportsController.listBackups);
router.post('/backup', verifyToken, reportsController.backupDatabase as unknown as import('express').RequestHandler);
router.delete('/backup/:filename', reportsController.deleteBackup);

// Removed duplicate or unnecessary backupDatabase export; use the controller's handler instead.

export default router;