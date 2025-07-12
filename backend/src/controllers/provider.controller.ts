// c:\Farmacia GS\backend\src\controllers\provider.controller.ts
// Importamos los tipos Request y Response de Express para manejar las peticiones y respuestas HTTP.
import { Request, Response } from 'express';
// Importamos nuestro pool de conexiones a la base de datos.
import pool from '../config/db';
// Importamos nuestro validador personalizado para los datos de un proveedor.
import { validateProviderInput } from '../validators/provider.validator';

// Exportamos la función asíncrona para obtener todos los proveedores.
export const getProviders = async (_req: Request, res: Response) => {
  // Realizamos una consulta a la base de datos para seleccionar todos los registros de la tabla 'providers'.
  const result = await pool.query('SELECT * FROM providers');
  // Devolvemos la lista de proveedores encontrados en formato JSON.
  res.json(result.rows);
};

// Exportamos la función asíncrona para obtener un proveedor por su ID.
export const getProviderById = async (req: Request, res: Response) => {
  // Obtenemos el ID de los parámetros de la URL.
  const { id } = req.params;
  // Realizamos una consulta para encontrar un proveedor con el ID específico.
  const result = await pool.query('SELECT * FROM providers WHERE id = $1', [Number(id)]);
  // Si no encontramos ningún proveedor, devolvemos un error 404 (No encontrado).
  if (result.rows.length === 0) return res.status(404).json({ message: 'Proveedor no encontrado' });
  // Si lo encontramos, devolvemos los datos del proveedor en formato JSON.
  res.json(result.rows[0]);
};

// Exportamos la función asíncrona para crear un nuevo proveedor.
export const createProvider = async (req: Request, res: Response) => {
  // Extraemos los datos del proveedor del cuerpo de la solicitud.
  const { name, email, phone, taxId } = req.body;
  // Validamos los datos de entrada utilizando nuestro validador.
  const validation = await validateProviderInput({ name, email, phone, taxId });
  // Si la validación no es exitosa, devolvemos un error 400 (Solicitud incorrecta) con el mensaje de error.
  if (!validation.isValid) {
    return res.status(400).json({ message: validation.message });
  }

  // Insertamos el nuevo proveedor en la base de datos y usamos RETURNING * para obtener el registro creado.
  const result = await pool.query(
    'INSERT INTO providers (name, email, phone, tax_id) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, email, phone, taxId]
  );
  // Respondemos con un estado 201 (Creado) y los datos del proveedor nuevo.
  res.status(201).json(result.rows[0]);
};

// Exportamos la función asíncrona para actualizar un proveedor existente.
export const updateProvider = async (req: Request, res: Response) => {
  // Obtenemos el ID de los parámetros de la URL.
  const { id } = req.params;
  // Obtenemos los datos a actualizar del cuerpo de la solicitud.
  const { name, email, phone, taxId } = req.body;
  // Validamos los datos de entrada.
  const validation = await validateProviderInput({ name, email, phone, taxId });
  // Si la validación falla, devolvemos un error 400.
  if (!validation.isValid) {
    return res.status(400).json({ message: validation.message });
  }

  // Actualizamos el proveedor en la base de datos usando su ID y devolvemos el registro actualizado.
  const result = await pool.query(
    'UPDATE providers SET name = $1, email = $2, phone = $3, tax_id = $4 WHERE id = $5 RETURNING *',
    [name, email, phone, taxId, Number(id)]
  );
  // Si no se actualizó ninguna fila (porque el ID no existe), devolvemos un 404.
  if (result.rows.length === 0) return res.status(404).json({ message: 'Proveedor no encontrado' });
  // Devolvemos los datos del proveedor actualizado.
  res.json(result.rows[0]);
};

// Exportamos la función asíncrona para eliminar un proveedor.
export const deleteProvider = async (req: Request, res: Response) => {
  // Obtenemos el ID de los parámetros de la URL.
  const { id } = req.params;
  // Ejecutamos la consulta para eliminar al proveedor de la base de datos por su ID.
  await pool.query('DELETE FROM providers WHERE id = $1', [Number(id)]);
  // Respondemos con un estado 204 (Sin Contenido), indicando que la operación fue exitosa pero no hay nada que devolver.
  res.status(204).send();
};
