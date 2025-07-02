// Importa EventEmitter para emitir eventos internos
import { EventEmitter } from 'events';
// Importa uuid para generar identificadores únicos
import { v4 as uuidv4 } from 'uuid';
// Importa WebSocket para comunicación en tiempo real
import * as WebSocket from 'ws';
// Servicio de notificaciones
class NotificationService extends EventEmitter {
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
            id: uuidv4(),
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
export const notificationService = new NotificationService();
