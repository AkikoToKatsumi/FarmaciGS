// src/routes/audit.routes.ts
import { Router } from 'express';
import * as auditController from '../controllers/audit.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { authorizeRolesById } from '../middleware/roles.middleware';


const router = Router();

router.get('/', verifyToken, authorizeRolesById(1,3), auditController.getAuditLogs);

export default router;
