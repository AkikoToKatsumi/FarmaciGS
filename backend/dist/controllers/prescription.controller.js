// Importa el pool de PostgreSQL
import pool from '../config/db';
// Importa la función de validación
import { validatePrescriptionInput } from '../validators/prescription.validator'; // ✅ Correcto
// Crear una nueva receta médica
export const createPrescription = async (req, res) => {
    const { clientId, medicines, doctor } = req.body;
    // Validar entrada
    const validation = await validatePrescriptionInput({ clientId, medicines });
    if (!validation.isValid) {
        return res.status(400).json({ message: validation.message });
    }
    try {
        // Insertar receta (prescription)
        const prescriptionResult = await pool.query('INSERT INTO prescriptions (client_id, doctor, created_at) VALUES ($1, $2, NOW()) RETURNING *', [clientId, doctor]);
        const prescription = prescriptionResult.rows[0];
        // Insertar medicamentos asociados (prescription_medicines)
        for (const med of medicines) {
            await pool.query('INSERT INTO prescription_medicines (prescription_id, medicine_id, quantity) VALUES ($1, $2, $3)', [prescription.id, med.id, med.quantity]);
        }
        return res.status(201).json({ message: 'Receta creada exitosamente', prescription });
    }
    catch (error) {
        console.error('Error al crear receta:', error);
        return res.status(500).json({ message: 'Error del servidor' });
    }
};
// Obtener todas las recetas
export const getPrescriptions = async (_req, res) => {
    try {
        const result = await pool.query(`
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
// Obtener una receta por ID, incluyendo medicamentos
export const getPrescriptionById = async (req, res) => {
    const { id } = req.params;
    try {
        const prescriptionResult = await pool.query('SELECT * FROM prescriptions WHERE id = $1', [Number(id)]);
        if (prescriptionResult.rows.length === 0) {
            return res.status(404).json({ message: 'Receta no encontrada' });
        }
        const medicinesResult = await pool.query(`SELECT pm.*, m.name as medicine_name 
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
// Eliminar una receta
export const deletePrescription = async (req, res) => {
    const { id } = req.params;
    try {
        // Primero eliminar los medicamentos asociados
        await pool.query('DELETE FROM prescription_medicines WHERE prescription_id = $1', [Number(id)]);
        // Luego eliminar la receta
        await pool.query('DELETE FROM prescriptions WHERE id = $1', [Number(id)]);
        return res.json({ message: 'Receta eliminada correctamente' });
    }
    catch (error) {
        console.error('Error al eliminar receta:', error);
        return res.status(500).json({ message: 'Error del servidor' });
    }
};
