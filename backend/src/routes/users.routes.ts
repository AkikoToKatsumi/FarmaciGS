// src/routes/users.routes.ts
import { Router } from 'express';
import * as userController from '../controllers/users.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { authorizeRolesById } from '../middleware/roles.middleware';
const router = Router();

router.get('/', verifyToken, authorizeRolesById(1), userController.getUsers);
router.get('/:id', verifyToken, userController.getUserById);
router.post('/', verifyToken, authorizeRolesById(1), userController.createUser);
router.put('/:id', verifyToken, authorizeRolesById(1), userController.updateUser);
router.delete('/:id', verifyToken, authorizeRolesById(1), userController.deleteUser);

export default router;


