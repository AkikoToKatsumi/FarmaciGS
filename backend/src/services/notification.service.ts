import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import * as WebSocket from 'ws';
import { User, Medicine } from '../models';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  user_id?: number;
  read: boolean;
  created_at: Date;
  expires_at?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'system' | 'inventory' | 'sales' | 'user' | 'backup' | 'audit';
  data?: any;
}

interface CreateNotificationData {
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  user_id?: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: 'system' | 'inventory' | 'sales' | 'user' | 'backup' | 'audit';
  expires_in?: number; // en segundos
  data?: any;
}

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

  // Enviar a todos los clientes
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

export const notificationService = new NotificationService();
