// Definición de la interfaz para un medicamento
export interface Medicine {
  id: number; // Identificador único del medicamento
  name: string; // Nombre del medicamento
  description?: string; // Descripción (opcional)
  price: number; // Precio
  stock: number; // Stock disponible
  expiration_date?: Date; // Fecha de expiración (opcional)
  lot?: string; // Número de lote (opcional)
  created_at: Date; // Fecha de creación
  provider_id?: number; // ID del proveedor (opcional)
  provider?: Provider; // Objeto proveedor (opcional)
}

// Datos requeridos para crear un medicamento
export interface CreateMedicineData {
  name: string; // Nombre
  description?: string; // Descripción (opcional)
  price: number; // Precio
  stock: number; // Stock
  expiration_date?: Date; // Fecha de expiración (opcional)
  lot?: string; // Número de lote (opcional)
  provider_id?: number; // ID del proveedor (opcional)
}

// Datos permitidos para actualizar un medicamento
export interface UpdateMedicineData {
  name?: string; // Nombre (opcional)
  description?: string; // Descripción (opcional)
  price?: number; // Precio (opcional)
  stock?: number; // Stock (opcional)
  expiration_date?: Date; // Fecha de expiración (opcional)
  lot?: string; // Número de lote (opcional)
  provider_id?: number; // ID del proveedor (opcional)
}

// Respuesta de medicamento con información adicional
export interface MedicineResponse {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  expiration_date?: Date;
  lot?: string;
  created_at: Date;
  provider?: ProviderResponse; // Respuesta del proveedor (opcional)
}

// Inventario de medicamentos para reportes
export interface MedicineInventory {
  id: number;
  name: string;
  stock: number;
  expiration_date?: Date;
  lot?: string;
  days_to_expiration?: number; // Días para expirar (opcional)
  is_expired: boolean; // ¿Está expirado?
  is_low_stock: boolean; // ¿Stock bajo?
}

// Alerta de stock bajo o agotado
export interface StockAlert {
  medicine_id: number; // ID del medicamento
  medicine_name: string; // Nombre del medicamento
  current_stock: number; // Stock actual
  minimum_stock: number; // Stock mínimo
  alert_type: 'LOW_STOCK' | 'OUT_OF_STOCK'; // Tipo de alerta
}

// Alerta de expiración próxima o vencida
export interface ExpirationAlert {
  medicine_id: number; // ID del medicamento
  medicine_name: string; // Nombre del medicamento
  expiration_date: Date; // Fecha de expiración
  days_to_expiration: number; // Días para expirar
  lot?: string; // Número de lote (opcional)
  alert_type: 'EXPIRING_SOON' | 'EXPIRED'; // Tipo de alerta
}

// Importa las interfaces de Provider y ProviderResponse para asociar con el medicamento
import { Provider, ProviderResponse } from './Provider';