// c:\Farmacia GS\backend\src\controllers\inventory.controller.ts
// Importamos los tipos Request y Response de Express para manejar las peticiones y respuestas HTTP.
import { Request, Response } from 'express';
// Importamos nuestro pool de conexiones a la base de datos.
import pool from '../config/db';

// Definimos una función de validación local y asíncrona para los datos de un medicamento.
const validateMedicineInput = async (data: any) => {
  // Extraemos el nombre y el lote de los datos recibidos.
  const { name, lot } = data;
  // Verificamos si el nombre o el lote están ausentes.
  if (!name || !lot) {
    // Si faltan, devolvemos que la validación no es válida y un mensaje de error.
    return { isValid: false, message: 'Nombre y lote son requeridos' };
  }
  // Si todo está correcto, devolvemos que la validación es válida.
  return { isValid: true, message: '' };
};

// Exportamos la función asíncrona para obtener todos los medicamentos.
export const getAllMedicines = async (_req: Request, res: Response) => {
  // Ejecutamos una consulta para seleccionar todos los registros de la tabla 'medicines'.
  const result = await pool.query('SELECT * FROM medicines');
  // Devolvemos los registros encontrados en formato JSON.
  res.json(result.rows);
};

// Exportamos la función asíncrona para obtener un medicamento por su ID.
export const getMedicineById = async (req: Request, res: Response) => {
  // Obtenemos el ID de los parámetros de la URL.
  const { id } = req.params;
  // Ejecutamos una consulta para encontrar un medicamento con el ID específico.
  const result = await pool.query('SELECT * FROM medicines WHERE id = $1', [Number(id)]);
  // Si no se encuentra ningún medicamento, devolvemos un error 404 (No encontrado).
  if (result.rows.length === 0) return res.status(404).json({ message: 'No encontrado' });
  // Si se encuentra, devolvemos el primer resultado en formato JSON.
  res.json(result.rows[0]);
};

// Exportamos la función asíncrona para crear un nuevo medicamento.
export const createMedicine = async (req: Request, res: Response) => {
  // Extraemos los datos del medicamento del cuerpo de la solicitud.
  const { name, description, stock, price, expirationDate, lot } = req.body;
  // Validamos los datos de entrada.
  const validation = await validateMedicineInput({ name, lot });
  // Si la validación falla, devolvemos un error 400 (Solicitud incorrecta).
  if (!validation.isValid) return res.status(400).json({ message: validation.message });

  // Insertamos el nuevo medicamento en la base de datos y usamos RETURNING * para obtener el registro creado.
  const result = await pool.query(
    'INSERT INTO medicines (name, description, stock, price, expiration_date, lot) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [name, description, stock, price, expirationDate, lot]
  );
  // Respondemos con un estado 201 (Creado) y los datos del medicamento nuevo.
  res.status(201).json(result.rows[0]);
};

// Exportamos la función asíncrona para actualizar un medicamento existente.
export const updateMedicine = async (req: Request, res: Response) => {
  // Obtenemos el ID de los parámetros de la URL.
  const { id } = req.params;
  // Obtenemos todos los datos a actualizar del cuerpo de la solicitud.
  const data = req.body;
  // Usamos un bloque try...catch para manejar errores, como no encontrar el medicamento.
  try {
    // Actualizamos el medicamento en la base de datos usando su ID y devolvemos el registro actualizado.
    const result = await pool.query(
      'UPDATE medicines SET name = $1, description = $2, stock = $3, price = $4, expiration_date = $5, lot = $6 WHERE id = $7 RETURNING *',
      [data.name, data.description, data.stock, data.price, data.expirationDate, data.lot, Number(id)]
    );
    // Si no se actualizó ninguna fila, lanzamos un error.
    if (result.rows.length === 0) throw new Error();
    // Devolvemos los datos del medicamento actualizado.
    res.json(result.rows[0]);
  } catch {
    // Si ocurre un error (ej. no se encontró el ID), devolvemos un 404.
    res.status(404).json({ message: 'Medicamento no encontrado' });
  }
};

// Exportamos la función asíncrona para eliminar un medicamento.
export const deleteMedicine = async (req: Request, res: Response) => {
  // Obtenemos el ID de los parámetros de la URL.
  const { id } = req.params;
  // Usamos un bloque try...catch para manejar el caso en que el ID no exista.
  try {
    // Ejecutamos la consulta para eliminar el medicamento de la base de datos.
    await pool.query('DELETE FROM medicines WHERE id = $1', [Number(id)]);
    // Respondemos con un mensaje de éxito.
    res.json({ message: 'Eliminado correctamente' });
  } catch {
    // Si ocurre un error, devolvemos un 404.
    res.status(404).json({ message: 'No encontrado' });
  }
};

// Exportamos la función asíncrona para obtener alertas de inventario.
export const getAlerts = async (_req: Request, res: Response) => {
  // Obtenemos la fecha actual.
  const now = new Date();
  // Definimos el umbral para el stock bajo.
  const threshold = 10;
  // Calculamos la fecha límite para "próximo a expirar" (en este caso, 7 días).
  const soon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  // Ejecutamos una consulta para encontrar medicamentos con stock bajo O que expiren pronto.
  const result = await pool.query(
    'SELECT * FROM medicines WHERE stock < $1 OR expiration_date < $2',
    [threshold, soon]
  );
  // Devolvemos los medicamentos que cumplen con las condiciones de alerta.
  res.json(result.rows);
};
