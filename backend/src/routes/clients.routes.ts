// src/routes/clients.routes.ts
import { Router } from 'express';
import * as clientController from '../controllers/clients.controller';
import { verifyToken } from '../middleware/auth.middleware';


const router = Router();

router.get('/', verifyToken, clientController.getClients);


router.get('/', clientController.getClients);
router.get('/:id', clientController.getClients);
router.post('/', clientController.createClient);
router.put('/:id', clientController.updateClient);
router.delete('/:id', clientController.deleteClient);

export default router;