"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBackup = exports.listBackups = exports.backupDatabase = exports.getExpiringMedicine = exports.getLowStock = exports.getSalesReport = void 0;
// Importamos nuestro pool de conexiones a la base de datos.
const db_1 = __importDefault(require("../config/db"));
// Importamos nuestro servicio de copias de seguridad para manejar la lógica relacionada.
const backup_service_1 = require("../services/backup.service");
// Exportamos la función asíncrona para obtener el reporte de ventas.
const getSalesReport = async (req, res) => {
    // Extraemos las fechas 'from' (desde) y 'to' (hasta) de los parámetros de la consulta (query) en la URL.
    const { from, to } = req.query;
    // Ejecutamos una consulta para seleccionar las ventas dentro del rango de fechas especificado.
    const result = await db_1.default.query('SELECT * FROM sales WHERE created_at >= $1 AND created_at <= $2', [from, to]);
    // Devolvemos los resultados en formato JSON.
    res.json(result.rows);
};
exports.getSalesReport = getSalesReport;
// Exportamos la función para obtener el reporte de medicamentos con bajo stock.
const getLowStock = async (_req, res) => {
    // Ejecutamos una consulta para encontrar todos los medicamentos cuyo stock sea menor a 10.
    const result = await db_1.default.query('SELECT * FROM medicine WHERE stock < 10');
    // Devolvemos los resultados en formato JSON.
    res.json(result.rows);
};
exports.getLowStock = getLowStock;
// Exportamos la función para obtener el reporte de medicamentos próximos a expirar.
const getExpiringMedicine = async (_, res) => {
    // Obtenemos la fecha y hora actual.
    const now = new Date();
    // Calculamos la fecha de "pronto", que será un mes a partir de ahora.
    const soon = new Date();
    soon.setMonth(soon.getMonth() + 1);
    // Ejecutamos una consulta para encontrar los medicamentos que expiran entre hoy y el próximo mes.
    const result = await db_1.default.query('SELECT * FROM medicine WHERE expiration_date >= $1 AND expiration_date <= $2', [now, soon]);
    // Devolvemos los resultados en formato JSON.
    res.json(result.rows);
};
exports.getExpiringMedicine = getExpiringMedicine;
// Exportamos la función para crear una copia de seguridad de la base de datos.
const backupDatabase = async (req, res) => {
    // Usamos un bloque try...catch para manejar posibles errores durante el proceso.
    try {
        // Llamamos a nuestro servicio para crear la copia de seguridad, pasando el ID del usuario que realiza la acción.
        const backup = await backup_service_1.backupService.createBackup(req.user.id);
        // Devolvemos la información de la copia de seguridad creada.
        res.json(backup);
    }
    catch (error) {
        // Si hay un error, respondemos con un estado 500 y el mensaje de error.
        res.status(500).json({ message: error.message });
    }
};
exports.backupDatabase = backupDatabase;
// Exportamos la función para listar todas las copias de seguridad existentes.
const listBackups = async (_req, res) => {
    // Usamos un bloque try...catch para manejar posibles errores.
    try {
        // Llamamos a nuestro servicio para obtener la lista de copias de seguridad.
        const backups = await backup_service_1.backupService.listBackups();
        // Devolvemos la lista en formato JSON.
        res.json(backups);
    }
    catch (error) {
        // Si hay un error, respondemos con un estado 500 y el mensaje de error.
        res.status(500).json({ message: error.message });
    }
};
exports.listBackups = listBackups;
// Exportamos la función para eliminar una copia de seguridad específica.
const deleteBackup = async (req, res) => {
    // Usamos un bloque try...catch para manejar posibles errores.
    try {
        // Obtenemos el nombre del archivo a eliminar de los parámetros de la URL.
        const filename = req.params.filename;
        // Llamamos a nuestro servicio para eliminar el archivo, pasando el nombre y el ID del usuario (si existe).
        await backup_service_1.backupService.deleteBackup(filename, req.user?.id);
        // Respondemos con un mensaje de éxito.
        res.json({ success: true });
    }
    catch (error) {
        // Si hay un error, respondemos con un estado 500 y el mensaje de error.
        res.status(500).json({ message: error.message });
    }
};
exports.deleteBackup = deleteBackup;
