// Importa Router de Express para definir rutas
import { Router } from 'express';
// Importa los controladores de reportes
import {
  getSalesReport,
  getExpiringMedicines,
  getLowStock,
} from '../controllers/reports.controller';
// Importa el middleware para verificar el token JWT
import { verifyToken } from '../middleware/auth.middleware';
// Importa el middleware para autorizar por roles
import { authorizeRoles } from '../middleware/roles.middleware';

// Crea una nueva instancia de Router
const router = Router();

// Ruta para obtener el reporte de ventas (solo Administrador y Supervisor)
router.get('/ventas', verifyToken, authorizeRoles('Administrador', 'Supervisor'), getSalesReport);
// Ruta para obtener medicamentos próximos a vencer (solo Administrador y Supervisor)
router.get('/vencimientos', verifyToken, authorizeRoles('Administrador', 'Supervisor'), getExpiringMedicines);
// Ruta para obtener medicamentos con bajo stock (solo Administrador y Supervisor)
router.get('/bajo-stock', verifyToken, authorizeRoles('Administrador', 'Supervisor'), getLowStock);

// Exporta el router para ser usado en la aplicación principal
export default router;
