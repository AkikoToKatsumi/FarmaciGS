"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLog = void 0;
// Importamos nuestro pool de conexiones a la base de datos.
const db_1 = __importDefault(require("../config/db"));
// Exportamos una función de orden superior 'auditLog' que crea un middleware.
// Recibe una cadena 'action' que describe la acción que se está realizando (ej. "LOGIN_EXITOSO").
const auditLog = (action) => {
    // Devolvemos una función middleware asíncrona.
    return async (req, res, next) => {
        // Usamos un bloque try...catch para manejar errores y evitar que la aplicación se detenga.
        try {
            // Verificamos si existe un usuario en la solicitud (lo que significa que está autenticado).
            if (req.user) {
                // Si hay un usuario, insertamos un nuevo registro en la tabla 'audit_log'.
                // Guardamos la acción realizada y el ID del usuario que la ejecutó.
                await db_1.default.query('INSERT INTO audit_log (action, user_id) VALUES ($1, $2)', [action, req.user.id]);
            }
        }
        catch (error) {
            // Si ocurre un error al intentar guardar el registro, lo mostramos en la consola.
            // No detenemos la solicitud por un error de auditoría, simplemente lo registramos.
            console.error('Error al guardar en bitácora:', error);
        }
        // Llamamos a next() para pasar el control al siguiente middleware o al controlador de la ruta.
        next();
    };
};
exports.auditLog = auditLog;
