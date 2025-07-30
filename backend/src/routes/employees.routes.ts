// Las rutas de empleados quedan reservadas para información adicional futura.
// El registro y gestión de empleados se hace por users.routes.ts

import { Router } from 'express';
import { authorizeRolesById } from '../middleware/roles.middleware';
import * as employeesController from '../controllers/employees.controller';

// routes/employees.routes.ts

import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  searchEmployees,
  getEmployeesByDepartment,
  getEmployeesByStatus,
  getEmployeeStats
} from '../controllers/employees.controller';

const router = Router();

// Rutas para empleados
router.get('/', getEmployees);
router.get('/search', searchEmployees);
router.get('/stats', getEmployeeStats);
router.get('/department/:department', getEmployeesByDepartment);
router.get('/status/:status', getEmployeesByStatus);
router.get('/:id', getEmployeeById);
router.post('/', createEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);
router.post('/', authorizeRolesById(1), employeesController.createEmployee);


export default router;
