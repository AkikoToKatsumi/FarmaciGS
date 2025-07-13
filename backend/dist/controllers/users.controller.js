"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getUsers = void 0;
// Importamos nuestro pool de conexiones a la base de datos.
const db_1 = __importDefault(require("../config/db"));
// Exportamos la función asíncrona para obtener todos los usuarios.
const getUsers = async (_req, res) => {
    // Ejecutamos una consulta para seleccionar todos los registros de la tabla 'users'.
    const result = await db_1.default.query('SELECT * FROM users');
    // Devolvemos la lista de usuarios encontrados en formato JSON.
    res.json(result.rows);
};
exports.getUsers = getUsers;
// Exportamos la función asíncrona para obtener un usuario por su ID.
const getUserById = async (req, res) => {
    // Obtenemos el ID de los parámetros de la URL.
    const { id } = req.params;
    // Ejecutamos una consulta para encontrar un usuario con el ID específico.
    const result = await db_1.default.query('SELECT * FROM users WHERE id = $1', [id]);
    // Si no encontramos ningún usuario, devolvemos un error 404 (No encontrado).
    if (result.rows.length === 0)
        return res.status(404).json({ message: 'Usuario no encontrado' });
    // Si lo encontramos, devolvemos los datos del usuario en formato JSON.
    res.json(result.rows[0]);
};
exports.getUserById = getUserById;
// Exportamos la función asíncrona para crear un nuevo usuario.
const createUser = async (req, res) => {
    // Extraemos los datos del usuario del cuerpo de la solicitud.
    const { name, email, password, roleId } = req.body;
    // **Nota de Seguridad:** Estamos guardando la contraseña en texto plano. Esto es una vulnerabilidad de seguridad grave.
    // Deberíamos hashear la contraseña antes de guardarla, usando una librería como bcrypt.
    // Insertamos el nuevo usuario en la base de datos y usamos RETURNING * para obtener el registro creado.
    const result = await db_1.default.query('INSERT INTO users (name, email, password, role_id) VALUES ($1, $2, $3, $4) RETURNING *', [name, email, password, roleId]);
    // Respondemos con un estado 201 (Creado) y los datos del usuario nuevo.
    res.status(201).json(result.rows[0]);
};
exports.createUser = createUser;
// Exportamos la función asíncrona para actualizar un usuario existente.
const updateUser = async (req, res) => {
    // Obtenemos el ID de los parámetros de la URL.
    const { id } = req.params;
    // Obtenemos los datos a actualizar del cuerpo de la solicitud.
    const { name, email, password, roleId } = req.body;
    const result = await db_1.default.query('UPDATE users SET name = $1, email = $2, password = $3, role_id = $4 WHERE id = $5 RETURNING *', [name, email, password, roleId, id]);
    // Devolvemos los datos del usuario actualizado.
    res.json(result.rows[0]);
};
exports.updateUser = updateUser;
// Exportamos la función asíncrona para eliminar un usuario.
const deleteUser = async (req, res) => {
    // Obtenemos el ID de los parámetros de la URL.
    const { id } = req.params;
    // Ejecutamos la consulta para eliminar al usuario de la base de datos por su ID.
    await db_1.default.query('DELETE FROM users WHERE id = $1', [id]);
    // Respondemos con un estado 204 (Sin Contenido), indicando que la operación fue exitosa pero no hay nada que devolver.
    res.status(204).send();
};
exports.deleteUser = deleteUser;
