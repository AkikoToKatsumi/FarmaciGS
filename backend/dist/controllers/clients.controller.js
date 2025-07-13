"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPrescription = exports.getClientPrescriptions = exports.deleteClient = exports.updateClient = exports.createClient = exports.addClient = exports.getClients = void 0;
// Importa el pool de conexiones a la base de datos
const db_1 = __importDefault(require("../config/db"));
// Importa el validador para clientes
const client_validator_1 = require("../validators/client.validator");
// Importa el validador para recetas
const prescription_validator_1 = require("../validators/prescription.validator");
// Importa el modelo de cliente (si es necesario, dependiendo de tu estructura de carpetas)
// Obtiene todos los clientes, incluyendo sus recetas
const getClients = async (_, res) => {
    const result = await db_1.default.query('SELECT * FROM clients');
    // Si necesitas recetas, deberás hacer otra consulta y unir los datos en JS
    return res.json(result.rows);
};
exports.getClients = getClients;
// Agrega un cliente (sin validación, función auxiliar)
const addClient = async (req, res) => {
    const { name, email, phone } = req.body;
    const result = await db_1.default.query('INSERT INTO clients (name, email, phone) VALUES ($1, $2, $3) RETURNING *', [name, email, phone]);
    return res.status(201).json(result.rows[0]);
};
exports.addClient = addClient;
// Crea un nuevo cliente con validación
const createClient = async (req, res) => {
    try {
        // Extrae los datos del cuerpo de la petición
        const { name, email, phone } = req.body;
        // Valida los datos del cliente
        const validation = await (0, client_validator_1.validateClientInput)({ name, email, phone });
        if (!validation.isValid) {
            // Si la validación falla, responde con error 400
            return res.status(400).json({ message: validation.message });
        }
        // Crea el cliente en la base de datos
        const result = await db_1.default.query('INSERT INTO clients (name, email, phone) VALUES ($1, $2, $3) RETURNING *', [name, email, phone]);
        // Devuelve el cliente creado
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        // Si ocurre un error, responde con error 500
        res.status(500).json({ message: 'Error al crear cliente' });
    }
};
exports.createClient = createClient;
// Actualiza un cliente existente con validación
const updateClient = async (req, res) => {
    try {
        const clientId = Number(req.params.id);
        const { name, email, phone } = req.body;
        // Valida los datos antes de actualizar
        const validation = await (0, client_validator_1.validateClientInput)({ name, email, phone, id: clientId });
        if (!validation.isValid) {
            // Si la validación falla, responde con error 400
            return res.status(400).json({ message: validation.message });
        }
        // Actualiza el cliente en la base de datos
        const result = await db_1.default.query('UPDATE clients SET name = $1, email = $2, phone = $3 WHERE id = $4 RETURNING *', [name, email, phone, clientId]);
        // Devuelve el cliente actualizado
        res.json(result.rows[0]);
    }
    catch (error) {
        // Si ocurre un error, responde con error 404
        res.status(404).json({ message: 'Cliente no encontrado o error al actualizar' });
    }
};
exports.updateClient = updateClient;
// Elimina un cliente por su ID
const deleteClient = async (req, res) => {
    try {
        const clientId = Number(req.params.id);
        // Elimina el cliente de la base de datos
        await db_1.default.query('DELETE FROM clients WHERE id = $1', [clientId]);
        // Devuelve mensaje de éxito
        res.json({ message: 'Cliente eliminado' });
    }
    catch (error) {
        // Si ocurre un error, responde con error 404
        res.status(404).json({ message: 'Cliente no encontrado o error al eliminar' });
    }
};
exports.deleteClient = deleteClient;
// Obtiene las recetas de un cliente (implementación pendiente)
const getClientPrescriptions = async (req, res) => {
    const clientId = Number(req.params.id);
    try {
        const result = await db_1.default.query(`
      SELECT p.*, m.name AS medicine_name
      FROM prescriptions p
      JOIN medicine m ON p.medicine_id = m.id
      WHERE p.client_id = $1
    `, [clientId]);
        res.json(result.rows);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener recetas' });
    }
};
exports.getClientPrescriptions = getClientPrescriptions;
const addPrescription = async (req, res) => {
    const clientId = Number(req.params.id);
    const { medicineIds } = req.body;
    const validation = await (0, prescription_validator_1.validatePrescriptionInput)({ clientId, medicineIds });
    if (!validation.isValid) {
        return res.status(400).json({ message: validation.message });
    }
    try {
        const inserted = [];
        for (const medicineId of medicineIds) {
            const result = await db_1.default.query('INSERT INTO prescriptions (client_id, medicine_id) VALUES ($1, $2) RETURNING *', [clientId, medicineId]);
            inserted.push(result.rows[0]);
        }
        res.status(201).json({ message: 'Receta agregada', data: inserted });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al agregar receta' });
    }
};
exports.addPrescription = addPrescription;
