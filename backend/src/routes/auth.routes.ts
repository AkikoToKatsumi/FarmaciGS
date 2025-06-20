import { Router } from 'express';
import { login, refreshToken, getProfile } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validation.middleware';
import { verifyToken } from '../middleware/auth.middleware';
import { z } from 'zod';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.post('/login', validateBody(loginSchema), login);
router.post('/refresh', refreshToken);
router.get('/me', verifyToken, getProfile);

export default router;
