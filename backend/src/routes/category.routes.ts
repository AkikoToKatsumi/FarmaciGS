import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

// Log para debug
router.use((req, res, next) => {
  console.log(`[CATEGORY ROUTES] ${req.method} ${req.path}`);
  next();
});

// Aplicar middleware de autenticación
router.use(verifyToken);

// Rutas
router.get('/', categoryController.getCategories);
router.post('/', categoryController.createCategory);
router.delete('/:id', categoryController.deleteCategory);

export default router;
