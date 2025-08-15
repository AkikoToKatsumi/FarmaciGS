// src/routes/inventory.routes.ts
import { Router } from 'express';
import * as inventoryController from '../controllers/inventory.controller';
import { verifyToken } from '../middleware/auth.middleware';


const router = Router();

router.use(verifyToken); // Aplicar middleware a todas las rutas de este archivo

router.get('/', inventoryController.getAllMedicine);
router.get('/:id', inventoryController.getMedicineById);
router.post('/', inventoryController.createMedicine);
router.put('/:id', inventoryController.updateMedicine);
router.delete('/:id', inventoryController.deleteMedicine);
router.get('/alerts/stock', inventoryController.getAlerts);
router.get('/stats/all', inventoryController.getInventoryStats);
router.get('/barcode/:barcode', inventoryController.getMedicineByBarcode);
router.get('/providers', inventoryController.getProviders);
export default router;
