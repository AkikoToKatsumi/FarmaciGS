import { Router } from 'express';
import { createPrescription } from '../controllers/prescription.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { authorizeRolesById } from '../middleware/roles.middleware';
import * as prescriptionsController from '../controllers/prescription.controller';
const router = Router();

router.use(verifyToken);

// Solo admin (1) y doctor (3)
router.post('/', authorizeRolesById(1, 3), createPrescription);
router.get(
  '/client/:id',
  authorizeRolesById(1, 3), // IDs de roles autorizados
  prescriptionsController.getPrescriptionsByClient
);
export default router;
