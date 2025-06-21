// Importa EventEmitter para emitir eventos internos
import { EventEmitter } from 'events';
// Importa uuid para generar identificadores únicos
import { v4 as uuidv4 } from 'uuid';
// Importa WebSocket para comunicación en tiempo real
import * as WebSocket from 'ws';
// Importa modelos relacionados
import { User, Medicine } from '../models';

// Estructura de una notificación
interface Notification {
  id: string; // Identificador único de la notificación
  type: 'info' | 'warning' | 'error' | 'success'; // Tipo de notificación
  title: string; // Título
  message: string; // Mensaje
  user_id?: number; // ID del usuario destinatario (opcional)
  read: boolean; // ¿Leída?
  created_at: Date; // Fecha de creación
  expires_at?: Date; // Fecha de expiración (opcional)
  priority: 'low' | 'medium' | 'high' | 'urgent'; // Prioridad
  category: 'system' | 'inventory' | 'sales' | 'user' | 'backup' | 'audit'; // Categoría
  data?: any; // Datos adicionales (opcional)
}

// Datos requeridos para crear una notificación
interface CreateNotificationData {
  type: 'info' | 'warning' | 'error' | 'success'; // Tipo
  title: string; // Título
  message: string; // Mensaje
  user_id?: number; // Usuario destinatario (opcional)
  priority?: 'low' | 'medium' | 'high' | 'urgent'; // Prioridad (opcional)
  category?: 'system' | 'inventory' | 'sales' | 'user' | 'backup' | 'audit'; // Categoría (opcional)
  expires_in?: number; // Tiempo de expiración en segundos (opcional)
  data?: any; // Datos adicionales (opcional)
}

// Servicio de notificaciones
class NotificationService extends EventEmitter {
  private clients: Set<WebSocket>;

  constructor() {
    super();
    this.clients = new Set();
  }

  // Registrar conexión WebSocket
  registerClient(ws: WebSocket) {
    this.clients.add(ws);
    ws.on('close', () => this.clients.delete(ws));
  }

  // Crear y emitir una notificación
  createNotification(data: CreateNotificationData): Notification {
    const now = new Date();
    const notification: Notification = {
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
  private broadcast(notification: Notification) {
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
  async create(data: {
    type: 'info' | 'warning' | 'error';
    title: string;
    message: string;
    user_id?: number;
  }) {
    // Aquí tu lógica para guardar y/o emitir la notificación
    this.emit('notification', data);
    // Si usas base de datos, aquí la guardarías
    return true;
  }
}

// Exporta una instancia del servicio de notificaciones
export const notificationService = new NotificationService();
