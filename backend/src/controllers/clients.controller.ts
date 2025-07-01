// src/controllers/clients.controller.ts
// Importa los tipos de Request y Response de Express
import { Request, Response } from 'express';
// Importa el pool de conexiones a la base de datos
import pool from '../db';
// Importa el validador para clientes
import { validateClientInput } from '../validators/client.validator';
// Importa el validador para recetas
import { validatePrescriptionInput } from '../validators/prescription.validator';

// Obtiene todos los clientes, incluyendo sus recetas
export const getClients = async (_: Request, res: Response) => {
  const result = await pool.query('SELECT * FROM clients');
  // Si necesitas recetas, deberás hacer otra consulta y unir los datos en JS
  return res.json(result.rows);
};

// Agrega un cliente (sin validación, función auxiliar)
export const addClient = async (req: Request, res: Response) => {
  const { name, email, phone } = req.body;
  const result = await pool.query(
    'INSERT INTO clients (name, email, phone) VALUES ($1, $2, $3) RETURNING *',
    [name, email, phone]
  );
  return res.status(201).json(result.rows[0]);
};

// Crea un nuevo cliente con validación
export const createClient = async (req: Request, res: Response) => {
  try {
    // Extrae los datos del cuerpo de la petición
    const { name, email, phone } = req.body;
    // Valida los datos del cliente
    const validation = await validateClientInput({ name, email, phone });
    if (!validation.isValid) {
      // Si la validación falla, responde con error 400
      return res.status(400).json({ message: validation.message });
    }
    // Crea el cliente en la base de datos
    const result = await pool.query(
      'INSERT INTO clients (name, email, phone) VALUES ($1, $2, $3) RETURNING *',
      [name, email, phone]
    );
    // Devuelve el cliente creado
    res.status(201).json(result.rows[0]);
  } catch (error) {
    // Si ocurre un error, responde con error 500
    res.status(500).json({ message: 'Error al crear cliente' });
  }
};

// Actualiza un cliente existente con validación
export const updateClient = async (req: Request, res: Response) => {
  try {
    const clientId = Number(req.params.id);
    const { name, email, phone } = req.body;
    // Valida los datos antes de actualizar
    const validation = await validateClientInput({ name, email, phone, id: clientId });
    if (!validation.isValid) {
      // Si la validación falla, responde con error 400
      return res.status(400).json({ message: validation.message });
    }
    // Actualiza el cliente en la base de datos
    const result = await pool.query(
      'UPDATE clients SET name = $1, email = $2, phone = $3 WHERE id = $4 RETURNING *',
      [name, email, phone, clientId]
    );
    // Devuelve el cliente actualizado
    res.json(result.rows[0]);
  } catch (error) {
    // Si ocurre un error, responde con error 404
    res.status(404).json({ message: 'Cliente no encontrado o error al actualizar' });
  }
};

// Elimina un cliente por su ID
export const deleteClient = async (req: Request, res: Response) => {
  try {
    const clientId = Number(req.params.id);
    // Elimina el cliente de la base de datos
    await pool.query('DELETE FROM clients WHERE id = $1', [clientId]);
    // Devuelve mensaje de éxito
    res.json({ message: 'Cliente eliminado' });
  } catch (error) {
    // Si ocurre un error, responde con error 404
    res.status(404).json({ message: 'Cliente no encontrado o error al eliminar' });
  }
};

// Obtiene las recetas de un cliente (implementación pendiente)
export const getClientPrescriptions = async (req: Request, res: Response) => {
  // Lógica para obtener recetas de un cliente
  res.json({ message: 'Recetas del cliente' });
};

// Agrega una receta a un cliente con validación
export const addPrescription = async (req: Request, res: Response) => {
  const clientId = Number(req.params.id);
  const { medicineIds } = req.body;

  // Valida los datos de la receta
  const validation = await validatePrescriptionInput({
    clientId,
    medicineIds,
  });

  if (!validation.isValid) {
    // Si la validación falla, responde con error 400
    return res.status(400).json({ message: validation.message });
  }

  // Lógica para agregar una receta a un cliente (implementación pendiente)
  res.status(201).json({ message: 'Receta agregada' });
};
