"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
// Importa EventEmitter para emitir eventos internos
const events_1 = require("events");
// Importa uuid para generar identificadores únicos
const uuid_1 = require("uuid");
// Importa WebSocket para comunicación en tiempo real
const WebSocket = __importStar(require("ws"));
// Servicio de notificaciones
class NotificationService extends events_1.EventEmitter {
    constructor() {
        super();
        this.clients = new Set();
    }
    // Registrar conexión WebSocket
    registerClient(ws) {
        this.clients.add(ws);
        ws.on('close', () => this.clients.delete(ws));
    }
    // Crear y emitir una notificación
    createNotification(data) {
        const now = new Date();
        const notification = {
            id: (0, uuid_1.v4)(),
            type: data.type,
            title: data.title,
            message: data.message,
            user_id: data.user_id,
            priority: data.priority ?? 'medium',
            category: data.category ?? 'system',
            created_at: now,
            read: false,
            expires_at: data.expires_in
                ? new Date(now.getTime() + data.expires_in * 1000)
                : undefined,
            data: data.data
        };
        // Emitir evento interno para logging o auditoría
        this.emit('notification', notification);
        // Enviar a todos los clientes WebSocket conectados
        this.broadcast(notification);
        return notification;
    }
    // Enviar notificación a todos los clientes WebSocket conectados
    broadcast(notification) {
        const payload = JSON.stringify({
            type: 'notification',
            data: notification
        });
        for (const client of this.clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(payload);
            }
        }
    }
    // Crear y emitir una notificación simple (ejemplo de uso)
    async create(data) {
        // Aquí tu lógica para guardar y/o emitir la notificación
        this.emit('notification', data);
        // Si usas base de datos, aquí la guardarías
        return true;
    }
}
// Exporta una instancia del servicio de notificaciones
exports.notificationService = new NotificationService();
