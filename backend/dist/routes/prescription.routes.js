"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prescription_controller_1 = require("../controllers/prescription.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const roles_middleware_1 = require("../middleware/roles.middleware");
const router = (0, express_1.Router)();
// Todas las rutas requieren autenticación
router.use(auth_middleware_1.verifyToken);
// Obtener todas las recetas (acceso: admin, doctor)
router.get('/', (0, roles_middleware_1.authorizeRoles)('admin', 'doctor'), prescription_controller_1.getPrescriptions);
// Obtener una receta por ID
router.get('/:id', (0, roles_middleware_1.authorizeRoles)('admin', 'doctor'), prescription_controller_1.getPrescriptionById);
// Crear una nueva receta (acceso: doctor)
router.post('/', (0, roles_middleware_1.authorizeRoles)('doctor'), prescription_controller_1.createPrescription);
// Eliminar una receta (acceso: admin)
router.delete('/:id', (0, roles_middleware_1.authorizeRoles)('admin'), prescription_controller_1.deletePrescription);
exports.default = router;
