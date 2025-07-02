// src/routes/provider.routes.ts
import { Router } from 'express';
import * as providerController from '../controllers/provider.controller';
import { verifyToken } from '../middleware/auth.middleware';
const router = Router();
router.use(verifyToken);
router.get('/', providerController.getProviders);
router.get('/:id', providerController.getProviderById);
router.post('/', providerController.createProvider);
router.put('/:id', providerController.updateProvider);
router.delete('/:id', providerController.deleteProvider);
export default router;
