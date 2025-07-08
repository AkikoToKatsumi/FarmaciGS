// c:\Farmacia GS\backend\src\controllers\users.controller.ts
// Importamos los tipos Request y Response de Express para manejar las peticiones y respuestas HTTP.
import { Request, Response } from 'express';
// Importamos nuestro pool de conexiones a la base de datos.
import pool from '../config/db';

// Exportamos la función asíncrona para obtener todos los usuarios.
export const getUsers = async (_req: Request, res: Response) => {
  // Ejecutamos una consulta para seleccionar todos los registros de la tabla 'users'.
  const result = await pool.query('SELECT * FROM users');
  // Devolvemos la lista de usuarios encontrados en formato JSON.
  res.json(result.rows);
};

// Exportamos la función asíncrona para obtener un usuario por su ID.
export const getUserById = async (req: Request, res: Response) => {
  // Obtenemos el ID de los parámetros de la URL.
  const { id } = req.params;
  // Ejecutamos una consulta para encontrar un usuario con el ID específico.
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  // Si no encontramos ningún usuario, devolvemos un error 404 (No encontrado).
  if (result.rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
  // Si lo encontramos, devolvemos los datos del usuario en formato JSON.
  res.json(result.rows[0]);
};

// Exportamos la función asíncrona para crear un nuevo usuario.
export const createUser = async (req: Request, res: Response) => {
  // Extraemos los datos del usuario del cuerpo de la solicitud.
  const { name, email, password, roleId } = req.body;
  // **Nota de Seguridad:** Estamos guardando la contraseña en texto plano. Esto es una vulnerabilidad de seguridad grave.
  // Deberíamos hashear la contraseña antes de guardarla, usando una librería como bcrypt.
  // Insertamos el nuevo usuario en la base de datos y usamos RETURNING * para obtener el registro creado.
  const result = await pool.query(
    'INSERT INTO users (name, email, password, role_id) VALUES (, , , ) RETURNING *',
    [name, email, password, roleId]
  );
  // Respondemos con un estado 201 (Creado) y los datos del usuario nuevo.
  res.status(201).json(result.rows[0]);
};

// Exportamos la función asíncrona para actualizar un usuario existente.
export const updateUser = async (req: Request, res: Response) => {
  // Obtenemos el ID de los parámetros de la URL.
  const { id } = req.params;
  // Obtenemos los datos a actualizar del cuerpo de la solicitud.
  const { name, email, password, roleId } = req.body;
  
  const result = await pool.query(
    'UPDATE users SET name = , email = , password = , role_id =  WHERE id =  RETURNING *',
    [name, email, password, roleId, id]
  );
  // Devolvemos los datos del usuario actualizado.
  res.json(result.rows[0]);
};

// Exportamos la función asíncrona para eliminar un usuario.
export const deleteUser = async (req: Request, res: Response) => {
  // Obtenemos el ID de los parámetros de la URL.
  const { id } = req.params;
  // Ejecutamos la consulta para eliminar al usuario de la base de datos por su ID.
  await pool.query('DELETE FROM users WHERE id = ', [id]);
  // Respondemos con un estado 204 (Sin Contenido), indicando que la operación fue exitosa pero no hay nada que devolver.
  res.status(204).send();
};
