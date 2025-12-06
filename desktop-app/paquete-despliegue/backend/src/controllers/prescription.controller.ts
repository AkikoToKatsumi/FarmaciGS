import { Request, Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';

export const createPrescription = async (req: AuthRequest, res: Response) => {
  const { clientId, medicines } = req.body;
  const userId = req.user?.id;
  const roleId = req.user?.role_id;

  if (!medicines || medicines.length === 0) {
    return res.status(400).json({ message: 'Debe incluir al menos un medicamento.' });
  }

  if (![1, 3].includes(roleId)) {
    return res.status(403).json({ message: 'Acceso denegado.' });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO prescriptions (client_id, issued_at) VALUES ($1, NOW()) RETURNING id`,
      [clientId]
    );
    const prescriptionId = result.rows[0].id;

    for (const med of medicines) {
      await client.query(
        `INSERT INTO prescription_medicines (prescription_id, medicine_id, quantity) VALUES ($1, $2, $3)`,
        [prescriptionId, med.medicineId, med.quantity]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Receta creada exitosamente.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creando receta:', err);
    res.status(500).json({ message: 'Error interno al crear receta' });
  } finally {
    client.release();
  }
};

export const getLatestPrescriptionByClient = async (req: Request, res: Response) => {
  const clientId = parseInt(req.params.clientId);

  try {
    const result = await pool.query(
      `SELECT pm.medicine_id, m.name, m.price, pm.quantity
       FROM prescriptions p
       JOIN prescription_medicines pm ON p.id = pm.prescription_id
       JOIN medicine m ON pm.medicine_id = m.id
       WHERE p.client_id = $1
       ORDER BY p.issued_at DESC
       LIMIT 1`,
      [clientId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener la última receta:', error);
    res.status(500).json({ message: 'Error al obtener la receta más reciente' });
  }
};

export const getPrescriptionsByClient = async (req: Request, res: Response) => {
  const clientId = parseInt(req.params.id);
  
  try {
    const prescriptions = await pool.query(
      `SELECT
         p.id,
         p.issued_at,
         COALESCE(
           json_agg(
             json_build_object(
               'id', m.id,
               'name', m.name,
               'quantity', pm.quantity,
               'price', m.price,
               'medicine_id', m.id
             )
           ) FILTER (WHERE m.id IS NOT NULL),
           '[]'::json
         ) AS medicines
       FROM prescriptions p
       LEFT JOIN prescription_medicines pm ON p.id = pm.prescription_id
       LEFT JOIN medicine m ON m.id = pm.medicine_id
       WHERE p.client_id = $1
       GROUP BY p.id
       ORDER BY p.issued_at DESC`,
      [clientId]
    );
    
    res.json(prescriptions.rows);
  } catch (error) {
    console.error('Error al obtener recetas:', error);
    res.status(500).json({ message: 'Error al obtener recetas' });
  }
};