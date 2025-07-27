// Las rutas de empleados quedan reservadas para información adicional futura.
// El registro y gestión de empleados se hace por users.routes.ts

import { Router } from 'express';
import { authorizeRolesById } from '../middleware/roles.middleware';
import * as employeesController from '../controllers/employees.controller';

const router = Router();

router.post('/', authorizeRolesById(1), employeesController.createEmployee);


export default router;
