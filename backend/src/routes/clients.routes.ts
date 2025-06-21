// Importa Router de Express para definir rutas
import { Router } from 'express';
// Importa los controladores de clientes
import {
  getClients,
  createClient,
  getClientPrescriptions,
  addPrescription,
  updateClient,
  deleteClient
} from '../controllers/clients.controller';
// Importa el middleware para verificar el token JWT
import { verifyToken } from '../middleware/auth.middleware';
// Importa el middleware para registrar acciones en la bitácora
import { auditLog } from '../middleware/audit.middleware';

// Crea una nueva instancia de Router
const router = Router();

// Ruta para obtener todos los clientes (requiere autenticación)
router.get('/', verifyToken, getClients);
// Ruta para crear un cliente (requiere autenticación y registra en bitácora)
router.post('/', verifyToken, auditLog('CREAR_CLIENTE'), createClient);
// Ruta para actualizar un cliente (requiere autenticación y registra en bitácora)
router.put('/:id', verifyToken, auditLog('EDITAR_CLIENTE'), updateClient);
// Ruta para eliminar un cliente (requiere autenticación y registra en bitácora)
router.delete('/:id', verifyToken, auditLog('ELIMINAR_CLIENTE'), deleteClient);
// Ruta para obtener las recetas de un cliente (requiere autenticación)
router.get('/:id/prescriptions', verifyToken, getClientPrescriptions);
// Ruta para agregar una receta a un cliente (requiere autenticación y registra en bitácora)
router.post('/:id/prescriptions', verifyToken, auditLog('AGREGAR_RECETA'), addPrescription);

// Exporta el router para ser usado en la aplicación principal
export default router;
