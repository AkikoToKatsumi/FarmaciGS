// src/routes/inventory.routes.ts
import { Router } from 'express';
import * as inventoryController from '../controllers/inventory.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { getClients } from '../controllers/clients.controller';
const router = Router();
router.get('/', verifyToken, getClients);
router.get('/', inventoryController.getAllMedicines);
router.get('/:id', inventoryController.getMedicineById);
router.post('/', inventoryController.createMedicine);
router.put('/:id', inventoryController.updateMedicine);
router.delete('/:id', inventoryController.deleteMedicine);
router.get('/alerts/stock', inventoryController.getAlerts);
export default router;
