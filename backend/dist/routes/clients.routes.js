// src/routes/clients.routes.ts
import { Router } from 'express';
import * as clientController from '../controllers/clients.controller';
import { verifyToken } from '../middleware/auth.middleware';
const router = Router();
// Rutas protegidas con verifyToken (puedes proteger todas si es necesario)
router.get('/', verifyToken, clientController.getClients);
router.get('/:id', verifyToken, clientController.getClients); // NECESITAS crear este método
router.post('/', verifyToken, clientController.createClient);
router.put('/:id', verifyToken, clientController.updateClient);
router.delete('/:id', verifyToken, clientController.deleteClient);
// Recetas (puedes moverlas a otra ruta si lo prefieres)
router.get('/:id/prescriptions', verifyToken, clientController.getClientPrescriptions);
router.post('/:id/prescriptions', verifyToken, clientController.addPrescription);
export default router;
