import { Router } from 'express';
import {
  getClients,
  createClient,
  getClientPrescriptions,
  addPrescription,
  updateClient,
  deleteClient
} from '../controllers/clients.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { auditLog } from '../middleware/audit.middleware';

const router = Router();

router.get('/', verifyToken, getClients);
router.post('/', verifyToken, auditLog('CREAR_CLIENTE'), createClient);
router.put('/:id', verifyToken, auditLog('EDITAR_CLIENTE'), updateClient);
router.delete('/:id', verifyToken, auditLog('ELIMINAR_CLIENTE'), deleteClient);
router.get('/:id/prescriptions', verifyToken, getClientPrescriptions);
router.post('/:id/prescriptions', verifyToken, auditLog('AGREGAR_RECETA'), addPrescription);

export default router;
