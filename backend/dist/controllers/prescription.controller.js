"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestPrescriptionByClient = exports.deletePrescription = exports.getPrescriptionById = exports.getPrescriptions = exports.createPrescription = void 0;
// Importa el pool de PostgreSQL
const db_1 = __importDefault(require("../config/db"));
// Importa la función de validación
const prescription_validator_1 = require("../validators/prescription.validator"); // ✅ Correcto
// Crear una nueva receta médica
const createPrescription = async (req, res) => {
    const { clientId, medicines } = req.body;
    // Validar entrada
    const validation = await (0, prescription_validator_1.validatePrescriptionInput)({ clientId, medicines });
    if (!validation.isValid) {
        return res.status(400).json({ message: validation.message });
    }
    try {
        // Insertar receta (prescription)
        const prescriptionResult = await db_1.default.query('INSERT INTO prescriptions (client_id, created_at) VALUES ($1, NOW()) RETURNING *', [clientId]);
        const prescription = prescriptionResult.rows[0];
        // Insertar medicamentos asociados (prescription_medicines)
        for (const med of medicines) {
            await db_1.default.query('INSERT INTO prescription_medicines (prescription_id, medicine_id, quantity) VALUES ($1, $2, $3)', [prescription.id, med.medicineId, med.quantity]);
        }
        return res.status(201).json({ message: 'Receta creada exitosamente', prescription });
    }
    catch (error) {
        console.error('Error al crear receta:', error);
        return res.status(500).json({ message: 'Error del servidor' });
    }
};
exports.createPrescription = createPrescription;
// Obtener todas las recetas
const getPrescriptions = async (_req, res) => {
    try {
        const result = await db_1.default.query(`
      SELECT p.*, c.name as client_name
      FROM prescriptions p
      JOIN clients c ON p.client_id = c.id
      ORDER BY p.created_at DESC
    `);
        return res.json(result.rows);
    }
    catch (error) {
        console.error('Error al obtener recetas:', error);
        return res.status(500).json({ message: 'Error del servidor' });
    }
};
exports.getPrescriptions = getPrescriptions;
// Obtener una receta por ID, incluyendo medicamentos
const getPrescriptionById = async (req, res) => {
    const { id } = req.params;
    try {
        const prescriptionResult = await db_1.default.query('SELECT * FROM prescriptions WHERE id = $1', [Number(id)]);
        if (prescriptionResult.rows.length === 0) {
            return res.status(404).json({ message: 'Receta no encontrada' });
        }
        const medicinesResult = await db_1.default.query(`SELECT pm.*, m.name as medicine_name 
       FROM prescription_medicines pm 
       JOIN medicines m ON pm.medicine_id = m.id 
       WHERE pm.prescription_id = $1`, [Number(id)]);
        return res.json({
            prescription: prescriptionResult.rows[0],
            medicines: medicinesResult.rows,
        });
    }
    catch (error) {
        console.error('Error al obtener receta:', error);
        return res.status(500).json({ message: 'Error del servidor' });
    }
};
exports.getPrescriptionById = getPrescriptionById;
// Eliminar una receta
const deletePrescription = async (req, res) => {
    const { id } = req.params;
    try {
        // Primero eliminar los medicamentos asociados
        await db_1.default.query('DELETE FROM prescription_medicines WHERE prescription_id = $1', [Number(id)]);
        // Luego eliminar la receta
        await db_1.default.query('DELETE FROM prescriptions WHERE id = $1', [Number(id)]);
        return res.json({ message: 'Receta eliminada correctamente' });
    }
    catch (error) {
        console.error('Error al eliminar receta:', error);
        return res.status(500).json({ message: 'Error del servidor' });
    }
};
exports.deletePrescription = deletePrescription;
// Obtener la última receta de un cliente con sus medicamentos
const getLatestPrescriptionByClient = async (req, res) => {
    const { clientId } = req.params;
    try {
        // 1. Encontrar la receta más reciente para el cliente
        const latestPrescriptionResult = await db_1.default.query('SELECT id FROM prescriptions WHERE client_id = $1 ORDER BY created_at DESC LIMIT 1', [Number(clientId)]);
        if (latestPrescriptionResult.rows.length === 0) {
            return res.json([]); // No hay recetas para este cliente, devuelve un array vacío
        }
        const prescriptionId = latestPrescriptionResult.rows[0].id;
        // 2. Obtener todos los medicamentos para esa receta
        const medicinesResult = await db_1.default.query(`SELECT 
                pm.medicine_id, 
                pm.quantity, 
                m.name, 
                m.price 
             FROM prescription_medicines pm 
             JOIN medicines m ON pm.medicine_id = m.id 
             WHERE pm.prescription_id = $1`, [prescriptionId]);
        return res.json(medicinesResult.rows);
    }
    catch (error) {
        console.error('Error al obtener la última receta del cliente:', error);
        return res.status(500).json({ message: 'Error del servidor al obtener la receta' });
    }
};
exports.getLatestPrescriptionByClient = getLatestPrescriptionByClient;
