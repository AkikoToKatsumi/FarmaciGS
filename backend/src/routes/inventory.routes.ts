// Importa Router de Express para definir rutas
import { Router } from 'express';
// Importa los controladores de inventario (medicamentos)
import {
  getAllMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getMedicineById,
  getAlerts
} from '../controllers/inventory.controller';
// Importa el middleware para verificar el token JWT
import { verifyToken } from '../middleware/auth.middleware';
// Importa el middleware para autorizar por roles
import { authorizeRoles } from '../middleware/roles.middleware';
// Importa el middleware para registrar acciones en la bitácora
import { auditLog } from '../middleware/audit.middleware';

// Crea una nueva instancia de Router
const router = Router();

// Ruta para obtener todos los medicamentos (requiere autenticación)
router.get('/', verifyToken, getAllMedicines);
// Ruta para obtener medicamentos con alertas (bajo stock o próximos a vencer)
router.get('/alerts', verifyToken, getAlerts);
// Ruta para obtener un medicamento por ID (requiere autenticación)
router.get('/:id', verifyToken, getMedicineById);
// Ruta para crear un medicamento (solo Administrador, registra en bitácora)
router.post('/', verifyToken, authorizeRoles('Administrador'), auditLog('CREAR_MEDICAMENTO'), createMedicine);
// Ruta para actualizar un medicamento (solo Administrador, registra en bitácora)
router.put('/:id', verifyToken, authorizeRoles('Administrador'), auditLog('EDITAR_MEDICAMENTO'), updateMedicine);
// Ruta para eliminar un medicamento (solo Administrador, registra en bitácora)
router.delete('/:id', verifyToken, authorizeRoles('Administrador'), auditLog('ELIMINAR_MEDICAMENTO'), deleteMedicine);

// Exporta el router para ser usado en la aplicación principal
export default router;
