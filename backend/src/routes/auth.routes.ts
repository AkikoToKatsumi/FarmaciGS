// src/routes/auth.routes.ts
import { Router } from 'express';
import { login } from '../controllers/auth.controller';

const router = Router();

router.post('/login', login); // ← este debe existir

export default router;
