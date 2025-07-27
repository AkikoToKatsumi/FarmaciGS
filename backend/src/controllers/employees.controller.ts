// c:\Farmacia GS\backend\src\controllers\employees.controller.ts
// Importamos los tipos Request y Response de Express para manejar las peticiones y respuestas HTTP.
import { Request, Response } from 'express';
// Importamos nuestro pool de conexiones a la base de datos.
import pool from '../config/db';
// Importamos bcryptjs para hashear y comparar contraseñas de forma segura.
import bcrypt from 'bcryptjs';
// Importamos nuestro validador de datos para empleados.
import { validateEmployeeInput } from '../validators/employee.validator';

// Exportamos la función asíncrona para crear un nuevo empleado.
export const createEmployee = async (req: Request, res: Response) => {
  console.log('createEmployee called with body:', req.body);
  // Primero, validamos los datos de entrada que vienen en el cuerpo de la solicitud.
  const validation = await validateEmployeeInput(req.body);
  // Si la validación no es exitosa, devolvemos un error 400 (Bad Request) con el mensaje de error.
  if (!validation.isValid) {
    console.log('Validation failed:', validation.message);
    return res.status(400).json({ message: validation.message });
  }

  // Extraemos los datos del empleado del cuerpo de la solicitud.
  const { name, email, password, roleId } = req.body;
  // Verificamos si ya existe un usuario con el mismo correo electrónico en la base de datos.
  const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  // Si encontramos un usuario, devolvemos un error 400 indicando que el correo ya está en uso.
  if (existingUser.rows.length > 0) {
    console.log('Email already exists:', email);
    return res.status(400).json({ message: 'Ya existe un empleado con ese correo electrónico.' });
  }

  try {
    // Hasheamos la contraseña proporcionada para almacenarla de forma segura. El '10' es el costo del hasheo.
    const hashedPassword = await bcrypt.hash(password, 10);
    // Insertamos el nuevo usuario (empleado) en la tabla 'users' con la contraseña hasheada y devolvemos el registro creado.
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, hashedPassword, roleId]
    );
    console.log('Empleado creado:', result.rows[0]);
    // Respondemos con un estado 201 (Created) y los datos del empleado creado.
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creando empleado:', error);
    res.status(500).json({ message: 'Error al crear el usuario' });
  }
};

// Exportamos la función asíncrona para obtener todos los empleados.
export const getEmployees = async (_: Request, res: Response) => {
  // Realizamos una consulta para seleccionar todos los usuarios y unir la tabla 'roles' para obtener el nombre del rol.
  const result = await pool.query(
    `SELECT users.*, roles.name as role_name 
     FROM users 
     LEFT JOIN roles ON users.role_id = roles.id`
  );
  // Devolvemos la lista de empleados en formato JSON.
  return res.json(result.rows);
};

// Creamos un alias 'getAllUsers' para la función 'getEmployees' para mantener consistencia.
export const getAllUsers = getEmployees;

// Exportamos la función asíncrona para obtener un usuario por su ID.
export const getUserById = async (req: Request, res: Response) => {
  // Realizamos una consulta para obtener un usuario específico por su ID, incluyendo el nombre de su rol.
  const result = await pool.query(
    `SELECT users.*, roles.name as role_name 
     FROM users 
     LEFT JOIN roles ON users.role_id = roles.id
     WHERE users.id = $1`,
    [Number(req.params.id)]
  );
  // Si no encontramos ningún usuario, devolvemos un error 404 (Not Found).
  if (result.rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
  // Si lo encontramos, devolvemos los datos del usuario en formato JSON.
  res.json(result.rows[0]);
};

// Creamos un alias 'createUser' para la función 'createEmployee'.
export const createUser = createEmployee;

// Exportamos la función asíncrona para actualizar un empleado existente.
export const updateUser = async (req: Request, res: Response) => {
  // Extraemos los datos a actualizar del cuerpo de la solicitud.
  const { name, email, roleId } = req.body;
  // Si se está intentando actualizar el email...
  if (email) {
    // Verificamos si el nuevo email ya está siendo utilizado por otro empleado.
    const existingEmail = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    // Si el email ya existe y no pertenece al usuario que estamos actualizando, devolvemos un error 400.
    if (existingEmail.rows.length > 0 && existingEmail.rows[0].id !== Number(req.params.id)) {
      return res.status(400).json({ message: 'Ese correo ya pertenece a otro empleado.' });
    }
  }
  // Actualizamos los datos del usuario en la base de datos usando su ID y devolvemos el registro actualizado.
  const result = await pool.query(
    'UPDATE users SET name = $1, email = $2, role_id = $3 WHERE id = $4 RETURNING *',
    [name, email, roleId, Number(req.params.id)]
  );
  // Devolvemos los datos del usuario actualizado.
  res.json(result.rows[0]);
};

// Exportamos la función asíncrona para eliminar un usuario.
export const deleteUser = async (req: Request, res: Response) => {
  // Ejecutamos la consulta para eliminar al usuario de la base de datos por su ID.
  await pool.query('DELETE FROM users WHERE id = $1', [Number(req.params.id)]);
  // Respondemos con un mensaje de éxito.
  res.json({ message: 'Usuario eliminado correctamente' });
};

// Exportamos la función asíncrona para registrar información administrativa de un empleado.
export const registerEmployeeInfo = async (req: Request, res: Response) => {
  try {
    const { userId, hireDate, salary, status } = req.body;

    const result = await pool.query(
      `INSERT INTO employees (user_id, hire_date, salary, status)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, hireDate, salary, status]
    );

    res.status(201).json({ message: 'Empleado registrado', employee: result.rows[0] });
  } catch (err) {
    console.error('Error al registrar empleado:', err);
    res.status(500).json({ message: 'Error al registrar el empleado' });
  }
};
