// Exportar todos los modelos
export * from './User';
export * from './Medicine';
export * from './Client';
export * from './Sale';
export * from './Prescription';
export * from './Provider';
export * from './AuditLog';

// Tipos comunes compartidos
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: Date;
}

export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  pagination?: PaginationParams;
}

export interface DateRange {
  start_date: Date;
  end_date: Date;
}

export interface ReportParams {
  date_range?: DateRange;
  filters?: Record<string, any>;
  format?: 'JSON' | 'PDF' | 'EXCEL' | 'CSV';
}

// Enums globales
export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  CANCELLED = 'cancelled'
}

export enum ReportType {
  SALES = 'sales',
  INVENTORY = 'inventory',
  CLIENTS = 'clients',
  AUDIT = 'audit',
  FINANCIAL = 'financial'
}

// Tipos de validación
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}