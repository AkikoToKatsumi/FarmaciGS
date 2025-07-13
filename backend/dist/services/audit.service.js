"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuditLog = void 0;
const db_1 = __importDefault(require("../config/db"));
// Función para crear un registro de bitácora en la base de datos
const createAuditLog = async ({ userId, action, details }) => {
    await db_1.default.query('INSERT INTO audit_logs (user_id, action, details, created_at) VALUES ($1, $2, $3, NOW())', [userId, action, details || null]);
};
exports.createAuditLog = createAuditLog;
