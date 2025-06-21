// Exporta todos los modelos para uso global en la aplicación
export * from './User';
export * from './Medicine';
export * from './Client';
export * from './Sale';
export * from './Prescription';
export * from './Provider';
export * from './AuditLog';

// Tipos comunes compartidos para paginación y respuestas
// Parámetros para paginación de resultados
export interface PaginationParams {
  page?: number; // Página actual (opcional)
  limit?: number; // Límite de resultados por página (opcional)
  sort?: string; // Campo por el que ordenar (opcional)
  order?: 'ASC' | 'DESC'; // Orden ascendente o descendente (opcional)
}

// Respuesta paginada genérica
export interface PaginatedResponse<T> {
  data: T[]; // Datos de la página actual
  total: number; // Total de elementos
  page: number; // Página actual
  limit: number; // Límite de elementos por página
  totalPages: number; // Total de páginas
  hasNext: boolean; // ¿Hay página siguiente?
  hasPrevious: boolean; // ¿Hay página anterior?
}

// Respuesta genérica de la API
export interface ApiResponse<T> {
  success: boolean; // Indica si la operación fue exitosa
  data?: T; // Datos devueltos (opcional)
  message?: string; // Mensaje adicional (opcional)
  error?: string; // Mensaje de error (opcional)
  timestamp: Date; // Fecha y hora de la respuesta
}

// Parámetros para búsquedas avanzadas
export interface SearchParams {
  query?: string; // Texto de búsqueda (opcional)
  filters?: Record<string, any>; // Filtros adicionales (opcional)
  pagination?: PaginationParams; // Parámetros de paginación (opcional)
}

// Rango de fechas para reportes o búsquedas
export interface DateRange {
  start_date: Date; // Fecha de inicio
  end_date: Date; // Fecha de fin
}

// Parámetros para generación de reportes
export interface ReportParams {
  date_range?: DateRange; // Rango de fechas (opcional)
  filters?: Record<string, any>; // Filtros adicionales (opcional)
  format?: 'JSON' | 'PDF' | 'EXCEL' | 'CSV'; // Formato de salida (opcional)
}

// Enums globales para estados y tipos de reporte
export enum Status {
  ACTIVE = 'active', // Activo
  INACTIVE = 'inactive', // Inactivo
  PENDING = 'pending', // Pendiente
  CANCELLED = 'cancelled' // Cancelado
}

export enum ReportType {
  SALES = 'sales', // Reporte de ventas
  INVENTORY = 'inventory', // Reporte de inventario
  CLIENTS = 'clients', // Reporte de clientes
  AUDIT = 'audit', // Reporte de auditoría
  FINANCIAL = 'financial' // Reporte financiero
}

// Tipos para validación de datos
export interface ValidationError {
  field: string; // Campo con error
  message: string; // Mensaje de error
  value?: any; // Valor recibido (opcional)
}

export interface ValidationResult {
  isValid: boolean; // Indica si la validación fue exitosa
  errors: ValidationError[]; // Lista de errores
}