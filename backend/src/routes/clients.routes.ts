import { Router } from 'express';
import {
  getClients,
  createClient,
  getClientPrescriptions,
  addPrescription,
} from '../controllers/clients.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { auditLog } from '../middleware/audit.middleware';

const router = Router();

router.get('/', verifyToken, getClients);
router.post('/', verifyToken, auditLog('CREAR_CLIENTE'), createClient);
router.get('/:id/prescriptions', verifyToken, getClientPrescriptions);
router.post('/:id/prescriptions', verifyToken, auditLog('AGREGAR_RECETA'), addPrescription);

export default router;
