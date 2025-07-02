// src/routes/users.routes.ts
import { Router } from 'express';
import * as userController from '../controllers/users.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/roles.middleware';
const router = Router();
router.get('/', verifyToken, authorizeRoles('admin'), userController.getUsers);
router.get('/:id', verifyToken, userController.getUserById);
router.post('/', verifyToken, authorizeRoles('admin'), userController.createUser);
router.put('/:id', verifyToken, authorizeRoles('admin'), userController.updateUser);
router.delete('/:id', verifyToken, authorizeRoles('admin'), userController.deleteUser);
export default router;
