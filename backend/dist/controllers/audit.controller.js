"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditLogs = void 0;
// Importamos nuestro pool de conexiones a la base de datos para poder realizar consultas.
const db_1 = __importDefault(require("../config/db"));
// Exportamos la función asíncrona 'getAuditLogs' para obtener todos los registros de auditoría.
const getAuditLogs = async (_req, res) => {
    // Ejecutamos una consulta a la base de datos para seleccionar todos los registros de la tabla 'audit_log'.
    // Los ordenamos por la columna 'created_at' en orden descendente para mostrar los más recientes primero.
    const result = await db_1.default.query('SELECT * FROM audit_log ORDER BY created_at DESC');
    // Enviamos el resultado (las filas obtenidas de la consulta) como una respuesta en formato JSON.
    res.json(result.rows);
};
exports.getAuditLogs = getAuditLogs;
