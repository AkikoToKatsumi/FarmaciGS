// src/routes/roles.routes.ts
import { Router } from 'express';
import * as roleController from '../controllers/roles.controller';
import { verifyToken }  from '../middleware/auth.middleware';

const router = Router();

router.use(verifyToken);

router.get('/', roleController.getRoles);
router.get('/:id', roleController.getRoleById);
router.post('/', roleController.createRole);
router.put('/:id', roleController.updateRole);
router.delete('/:id', roleController.deleteRole);

export default router;