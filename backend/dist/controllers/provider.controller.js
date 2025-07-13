"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProvider = exports.updateProvider = exports.createProvider = exports.getProviderById = exports.getProviders = void 0;
// Importamos nuestro pool de conexiones a la base de datos.
const db_1 = __importDefault(require("../config/db"));
// Importamos nuestro validador personalizado para los datos de un proveedor.
const provider_validator_1 = require("../validators/provider.validator");
// Exportamos la función asíncrona para obtener todos los proveedores.
const getProviders = async (_req, res) => {
    // Realizamos una consulta a la base de datos para seleccionar todos los registros de la tabla 'providers'.
    const result = await db_1.default.query('SELECT * FROM providers');
    // Devolvemos la lista de proveedores encontrados en formato JSON.
    res.json(result.rows);
};
exports.getProviders = getProviders;
// Exportamos la función asíncrona para obtener un proveedor por su ID.
const getProviderById = async (req, res) => {
    // Obtenemos el ID de los parámetros de la URL.
    const { id } = req.params;
    // Realizamos una consulta para encontrar un proveedor con el ID específico.
    const result = await db_1.default.query('SELECT * FROM providers WHERE id = $1', [Number(id)]);
    // Si no encontramos ningún proveedor, devolvemos un error 404 (No encontrado).
    if (result.rows.length === 0)
        return res.status(404).json({ message: 'Proveedor no encontrado' });
    // Si lo encontramos, devolvemos los datos del proveedor en formato JSON.
    res.json(result.rows[0]);
};
exports.getProviderById = getProviderById;
// Exportamos la función asíncrona para crear un nuevo proveedor.
const createProvider = async (req, res) => {
    // Extraemos los datos del proveedor del cuerpo de la solicitud.
    const { name, email, phone, taxId } = req.body;
    // Validamos los datos de entrada utilizando nuestro validador.
    const validation = await (0, provider_validator_1.validateProviderInput)({ name, email, phone, taxId });
    // Si la validación no es exitosa, devolvemos un error 400 (Solicitud incorrecta) con el mensaje de error.
    if (!validation.isValid) {
        return res.status(400).json({ message: validation.message });
    }
    // Insertamos el nuevo proveedor en la base de datos y usamos RETURNING * para obtener el registro creado.
    const result = await db_1.default.query('INSERT INTO providers (name, email, phone, tax_id) VALUES ($1, $2, $3, $4) RETURNING *', [name, email, phone, taxId]);
    // Respondemos con un estado 201 (Creado) y los datos del proveedor nuevo.
    res.status(201).json(result.rows[0]);
};
exports.createProvider = createProvider;
// Exportamos la función asíncrona para actualizar un proveedor existente.
const updateProvider = async (req, res) => {
    // Obtenemos el ID de los parámetros de la URL.
    const { id } = req.params;
    // Obtenemos los datos a actualizar del cuerpo de la solicitud.
    const { name, email, phone, taxId } = req.body;
    // Validamos los datos de entrada.
    const validation = await (0, provider_validator_1.validateProviderInput)({ name, email, phone, taxId });
    // Si la validación falla, devolvemos un error 400.
    if (!validation.isValid) {
        return res.status(400).json({ message: validation.message });
    }
    // Actualizamos el proveedor en la base de datos usando su ID y devolvemos el registro actualizado.
    const result = await db_1.default.query('UPDATE providers SET name = $1, email = $2, phone = $3, tax_id = $4 WHERE id = $5 RETURNING *', [name, email, phone, taxId, Number(id)]);
    // Si no se actualizó ninguna fila (porque el ID no existe), devolvemos un 404.
    if (result.rows.length === 0)
        return res.status(404).json({ message: 'Proveedor no encontrado' });
    // Devolvemos los datos del proveedor actualizado.
    res.json(result.rows[0]);
};
exports.updateProvider = updateProvider;
// Exportamos la función asíncrona para eliminar un proveedor.
const deleteProvider = async (req, res) => {
    // Obtenemos el ID de los parámetros de la URL.
    const { id } = req.params;
    // Ejecutamos la consulta para eliminar al proveedor de la base de datos por su ID.
    await db_1.default.query('DELETE FROM providers WHERE id = $1', [Number(id)]);
    // Respondemos con un estado 204 (Sin Contenido), indicando que la operación fue exitosa pero no hay nada que devolver.
    res.status(204).send();
};
exports.deleteProvider = deleteProvider;
