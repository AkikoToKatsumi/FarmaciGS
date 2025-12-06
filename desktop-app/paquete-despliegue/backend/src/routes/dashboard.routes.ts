// c:\Farmacia GS\backend\src\routes\dashboard.routes.ts
import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/stats', verifyToken, getDashboardStats);

export default router;