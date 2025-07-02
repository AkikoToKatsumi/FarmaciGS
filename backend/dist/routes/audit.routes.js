// src/routes/audit.routes.ts
import { Router } from 'express';
import * as auditController from '../controllers/audit.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/roles.middleware';
const router = Router();
router.get('/', verifyToken, authorizeRoles('admin'), auditController.getAuditLogs);
export default router;
