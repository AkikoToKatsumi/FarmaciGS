export interface AuditLog {
  id: number;
  user_id?: number;
  action: string;
  target_table?: string;
  target_id?: number;
  timestamp: Date;
  user?: User;
}

export interface CreateAuditLogData {
  user_id: number;
  action: string;
  target_table: string;
  target_id?: number;
}

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

export interface AuditReport {
  period: string;
  total_actions: number;
  actions_by_type: Array<{
    action: string;
    count: number;
  }>;
  actions_by_user: Array<{
    user_id: number;
    user_name: string;
    actions_count: number;
  }>;
  recent_activities: AuditLogResponse[];
}

export interface SecurityAuditLog extends AuditLog {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  additional_data?: Record<string, any>;
}

export interface AuditFilters {
  user_id?: number;
  action?: string;
  target_table?: string;
  start_date?: Date;
  end_date?: Date;
  limit?: number;
  offset?: number;
}

import { User } from './User';