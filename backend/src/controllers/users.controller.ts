// c:\Farmacia GS\backend\src\controllers\users.controller.ts
// Importamos los tipos Request y Response de Express para manejar las peticiones y respuestas HTTP.
import { Request, Response } from 'express';
// Importamos nuestro pool de conexiones a la base de datos.
import pool from '../config/db';
// Importamos bcrypt para el hashing de contraseñas.
import bcrypt from 'bcryptjs';

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
  try {
    // Extraemos los datos del usuario del cuerpo de la solicitud.
    const { name, email, password, role_id, roleId } = req.body;
    const role = role_id || roleId; // Soporta ambos nombres de campo

    // Verifica si el email ya existe
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Ya existe un usuario con ese correo electrónico.' });
    }

    // Hashea la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserta el usuario
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, hashedPassword, role]
    );
    // Respondemos con un estado 201 (Creado) y los datos del usuario nuevo.
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(500).json({ message: 'Error al crear el usuario' });
  }
};

// Exportamos la función asíncrona para actualizar un usuario existente.
export const updateUser = async (req: Request, res: Response) => {
  // Obtenemos el ID de los parámetros de la URL.
  const { id } = req.params;
  // Obtenemos los datos a actualizar del cuerpo de la solicitud.
  const { name, email, password, roleId } = req.body;

  let hashedPassword = password;
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  const result = await pool.query(
    'UPDATE users SET name = $1, email = $2, password = $3, role_id = $4 WHERE id = $5 RETURNING *',
    [name, email, hashedPassword, roleId, id]
  );
  // Devolvemos los datos del usuario actualizado.
  res.json(result.rows[0]);
};

// Exportamos la función asíncrona para eliminar un usuario.
export const deleteUser = async (req: Request, res: Response) => {
  // Obtenemos el ID de los parámetros de la URL.
  const { id } = req.params;
  // Ejecutamos la consulta para eliminar al usuario de la base de datos por su ID.
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
  // Respondemos con un estado 204 (Sin Contenido), indicando que la operación fue exitosa pero no hay nada que devolver.
  res.status(204).send();
};
