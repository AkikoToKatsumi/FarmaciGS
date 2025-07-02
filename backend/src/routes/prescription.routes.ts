import { Router } from 'express';
import {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  deletePrescription
} from '../controllers/prescription.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/roles.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Obtener todas las recetas (acceso: admin, doctor)
router.get('/', authorizeRoles('admin', 'doctor'), getPrescriptions);

// Obtener una receta por ID
router.get('/:id', authorizeRoles('admin', 'doctor'), getPrescriptionById);

// Crear una nueva receta (acceso: doctor)
router.post('/', authorizeRoles('doctor'), createPrescription);

// Eliminar una receta (acceso: admin)
router.delete('/:id', authorizeRoles('admin'), deletePrescription);

export default router;
