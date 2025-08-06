import { Router } from 'express';
import { authorizeRoles } from '../middleware/roles.middleware';
import { verifyToken } from '../middleware/auth.middleware';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  searchEmployees,
  getEmployeesByDepartment,
  getEmployeesByStatus,
  getEmployeeStats,
  reactivateEmployee
} from '../controllers/employees.controller';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(verifyToken);

// Rutas protegidas por roles
router.get('/', authorizeRoles('admin', 'hr', 'manager'), getEmployees);
router.get('/search', authorizeRoles('admin', 'hr', 'manager'), searchEmployees);
router.get('/stats', authorizeRoles('admin', 'hr'), getEmployeeStats);
router.get('/department/:department', authorizeRoles('admin', 'hr', 'manager'), getEmployeesByDepartment);
router.get('/status/:status', authorizeRoles('admin', 'hr'), getEmployeesByStatus);
router.get('/:id', authorizeRoles('admin', 'hr', 'manager', 'employee'), getEmployeeById);
router.post('/', authorizeRoles('admin', 'hr'), createEmployee);
router.put('/:id', authorizeRoles('admin', 'hr'), updateEmployee);
router.delete('/:id', authorizeRoles('admin'), deleteEmployee);
router.patch('/:id/reactivate', authorizeRoles('admin', 'hr'), reactivateEmployee);

export default router;