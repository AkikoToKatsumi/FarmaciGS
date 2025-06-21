// Definición de la interfaz para un registro de bitácora (audit log)
export interface AuditLog {
  id: number;
  user_id?: number; // ID del usuario que realizó la acción
  action: string; // Acción realizada
  target_table?: string; // Tabla objetivo de la acción
  target_id?: number; // ID del registro objetivo
  timestamp: Date; // Fecha y hora de la acción
  user?: User; // Información del usuario (opcional)
}

// Datos requeridos para crear un registro de bitácora
export interface CreateAuditLogData {
  user_id: number;
  action: string;
  target_table: string;
  target_id?: number;
}

// Respuesta de un registro de bitácora con detalles de usuario
export interface AuditLogResponse {
  id: number;
  user_id?: number;
  action: string;
  target_table?: string;
  target_id?: number;
  timestamp: Date;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

// Registro de bitácora con detalles adicionales
export interface AuditLogWithDetails {
  id: number;
  action: string;
  target_table?: string;
  target_id?: number;
  timestamp: Date;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  details?: any; // Detalles específicos de la acción
  ip_address?: string;
  user_agent?: string;
}

// Enum para las acciones posibles en la bitácora
export enum AuditAction {
  // Usuarios
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_CREATE = 'user_create',
  USER_UPDATE = 'user_update',
  USER_DELETE = 'user_delete',
  
  // Medicamentos
  MEDICINE_CREATE = 'medicine_create',
  MEDICINE_UPDATE = 'medicine_update',
  MEDICINE_DELETE = 'medicine_delete',
  MEDICINE_STOCK_UPDATE = 'medicine_stock_update',
  
  // Ventas
  SALE_CREATE = 'sale_create',
  SALE_CANCEL = 'sale_cancel',
  
  // Clientes
  CLIENT_CREATE = 'client_create',
  CLIENT_UPDATE = 'client_update',
  CLIENT_DELETE = 'client_delete',
  
  // Recetas
  PRESCRIPTION_CREATE = 'prescription_create',
  PRESCRIPTION_UPDATE = 'prescription_update',
  PRESCRIPTION_DELETE = 'prescription_delete',
  
  // Proveedores
  PROVIDER_CREATE = 'provider_create',
  PROVIDER_UPDATE = 'provider_update',
  PROVIDER_DELETE = 'provider_delete',
  
  // Sistema
  BACKUP_CREATE = 'backup_create',
  BACKUP_RESTORE = 'backup_restore',
  SYSTEM_CONFIG_UPDATE = 'system_config_update'
}

// Estructura para reportes de auditoría
export interface AuditReport {
  period: string; // Periodo del reporte
  total_actions: number; // Total de acciones
  actions_by_type: Array<{
    action: string;
    count: number;
  }>;
  actions_by_user: Array<{
    user_id: number;
    user_name: string;
    actions_count: number;
  }>;
  recent_activities: AuditLogResponse[]; // Actividades recientes
}

// Registro de bitácora de seguridad con detalles adicionales
export interface SecurityAuditLog extends AuditLog {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; // Nivel de severidad
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  additional_data?: Record<string, any>;
}

// Filtros para consultar registros de bitácora
export interface AuditFilters {
  user_id?: number;
  action?: string;
  target_table?: string;
  start_date?: Date;
  end_date?: Date;
  limit?: number;
  offset?: number;
}

// Importa la interfaz de usuario para asociar con la bitácora
import { User } from './User';