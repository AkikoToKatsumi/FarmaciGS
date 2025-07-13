"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllUsers = exports.getEmployees = exports.createEmployee = void 0;
// Importamos nuestro pool de conexiones a la base de datos.
const db_1 = __importDefault(require("../config/db"));
// Importamos bcryptjs para hashear y comparar contraseñas de forma segura.
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Importamos nuestro validador de datos para empleados.
const employee_validator_1 = require("../validators/employee.validator");
// Exportamos la función asíncrona para crear un nuevo empleado.
const createEmployee = async (req, res) => {
    // Primero, validamos los datos de entrada que vienen en el cuerpo de la solicitud.
    const validation = await (0, employee_validator_1.validateEmployeeInput)(req.body);
    // Si la validación no es exitosa, devolvemos un error 400 (Bad Request) con el mensaje de error.
    if (!validation.isValid)
        return res.status(400).json({ message: validation.message });
    // Extraemos los datos del empleado del cuerpo de la solicitud.
    const { name, email, password, roleId } = req.body;
    // Verificamos si ya existe un usuario con el mismo correo electrónico en la base de datos.
    const existingUser = await db_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
    // Si encontramos un usuario, devolvemos un error 400 indicando que el correo ya está en uso.
    if (existingUser.rows.length > 0) {
        return res.status(400).json({ message: 'Ya existe un empleado con ese correo electrónico.' });
    }
    // Hasheamos la contraseña proporcionada para almacenarla de forma segura. El '10' es el costo del hasheo.
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    // Insertamos el nuevo usuario (empleado) en la tabla 'users' con la contraseña hasheada y devolvemos el registro creado.
    const result = await db_1.default.query('INSERT INTO users (name, email, password, role_id) VALUES ($1, $2, $3, $4) RETURNING *', [name, email, hashedPassword, roleId]);
    // Respondemos con un estado 201 (Created) y los datos del empleado creado.
    res.status(201).json(result.rows[0]);
};
exports.createEmployee = createEmployee;
// Exportamos la función asíncrona para obtener todos los empleados.
const getEmployees = async (_, res) => {
    // Realizamos una consulta para seleccionar todos los usuarios y unir la tabla 'roles' para obtener el nombre del rol.
    const result = await db_1.default.query(`SELECT users.*, roles.name as role_name 
     FROM users 
     LEFT JOIN roles ON users.role_id = roles.id`);
    // Devolvemos la lista de empleados en formato JSON.
    return res.json(result.rows);
};
exports.getEmployees = getEmployees;
// Creamos un alias 'getAllUsers' para la función 'getEmployees' para mantener consistencia.
exports.getAllUsers = exports.getEmployees;
// Exportamos la función asíncrona para obtener un usuario por su ID.
const getUserById = async (req, res) => {
    // Realizamos una consulta para obtener un usuario específico por su ID, incluyendo el nombre de su rol.
    const result = await db_1.default.query(`SELECT users.*, roles.name as role_name 
     FROM users 
     LEFT JOIN roles ON users.role_id = roles.id
     WHERE users.id = $1`, [Number(req.params.id)]);
    // Si no encontramos ningún usuario, devolvemos un error 404 (Not Found).
    if (result.rows.length === 0)
        return res.status(404).json({ message: 'Usuario no encontrado' });
    // Si lo encontramos, devolvemos los datos del usuario en formato JSON.
    res.json(result.rows[0]);
};
exports.getUserById = getUserById;
// Creamos un alias 'createUser' para la función 'createEmployee'.
exports.createUser = exports.createEmployee;
// Exportamos la función asíncrona para actualizar un empleado existente.
const updateUser = async (req, res) => {
    // Extraemos los datos a actualizar del cuerpo de la solicitud.
    const { name, email, roleId } = req.body;
    // Si se está intentando actualizar el email...
    if (email) {
        // Verificamos si el nuevo email ya está siendo utilizado por otro empleado.
        const existingEmail = await db_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
        // Si el email ya existe y no pertenece al usuario que estamos actualizando, devolvemos un error 400.
        if (existingEmail.rows.length > 0 && existingEmail.rows[0].id !== Number(req.params.id)) {
            return res.status(400).json({ message: 'Ese correo ya pertenece a otro empleado.' });
        }
    }
    // Actualizamos los datos del usuario en la base de datos usando su ID y devolvemos el registro actualizado.
    const result = await db_1.default.query('UPDATE users SET name = $1, email = $2, role_id = $3 WHERE id = $4 RETURNING *', [name, email, roleId, Number(req.params.id)]);
    // Devolvemos los datos del usuario actualizado.
    res.json(result.rows[0]);
};
exports.updateUser = updateUser;
// Exportamos la función asíncrona para eliminar un usuario.
const deleteUser = async (req, res) => {
    // Ejecutamos la consulta para eliminar al usuario de la base de datos por su ID.
    await db_1.default.query('DELETE FROM users WHERE id = $1', [Number(req.params.id)]);
    // Respondemos con un mensaje de éxito.
    res.json({ message: 'Usuario eliminado correctamente' });
};
exports.deleteUser = deleteUser;
