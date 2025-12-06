// Definición de la interfaz para un proveedor
export interface Provider {
  id: number; // Identificador único del proveedor
  name: string; // Nombre del proveedor
  contact_name?: string; // Nombre del contacto (opcional)
  phone?: string; // Teléfono del proveedor (opcional)
  email?: string; // Correo electrónico del proveedor (opcional)
  address?: string; // Dirección del proveedor (opcional)
  created_at: Date; // Fecha de creación
  medicines?: Medicine[]; // Lista de medicamentos asociados (opcional)
}

// Datos requeridos para crear un proveedor
export interface CreateProviderData {
  name: string; // Nombre del proveedor
  contact_name?: string; // Nombre del contacto (opcional)
  phone?: string; // Teléfono (opcional)
  email?: string; // Correo electrónico (opcional)
  address?: string; // Dirección (opcional)
}

// Datos permitidos para actualizar un proveedor
export interface UpdateProviderData {
  name?: string; // Nombre (opcional)
  contact_name?: string; // Nombre del contacto (opcional)
  phone?: string; // Teléfono (opcional)
  email?: string; // Correo electrónico (opcional)
  address?: string; // Dirección (opcional)
}

// Respuesta de proveedor con información adicional
export interface ProviderResponse {
  id: number;
  name: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  created_at: Date;
  medicines_count?: number; // Cantidad de medicamentos asociados
  total_value?: number; // Valor total del inventario
}

// Proveedor con lista de medicamentos y estadísticas
export interface ProviderWithMedicines {
  id: number;
  name: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  created_at: Date;
  medicines: Array<{
    id: number;
    name: string;
    price: number;
    stock: number;
    expiration_date?: Date;
  }>;
  total_medicines: number; // Total de medicamentos
  total_inventory_value: number; // Valor total del inventario
}

// Estadísticas generales de proveedores
export interface ProviderStats {
  total_providers: number; // Total de proveedores
  active_providers: number; // Proveedores activos
  top_providers: Array<{
    id: number;
    name: string;
    medicines_count: number;
    total_inventory_value: number;
  }>;
}

// Orden de compra a proveedor
export interface ProviderOrder {
  provider_id: number; // ID del proveedor
  provider_name: string; // Nombre del proveedor
  order_date: Date; // Fecha de la orden
  expected_delivery?: Date; // Fecha estimada de entrega (opcional)
  status: OrderStatus; // Estado de la orden
  items: Array<{
    medicine_id: number; // ID del medicamento
    medicine_name: string; // Nombre del medicamento
    quantity_ordered: number; // Cantidad ordenada
    unit_price: number; // Precio unitario
    total_price: number; // Precio total
  }>;
  total_amount: number; // Monto total de la orden
  notes?: string; // Notas adicionales (opcional)
}

// Enum para los estados de una orden de proveedor
export enum OrderStatus {
  PENDING = 'pending', // Pendiente
  CONFIRMED = 'confirmed', // Confirmada
  SHIPPED = 'shipped', // Enviada
  DELIVERED = 'delivered', // Entregada
  CANCELLED = 'cancelled' // Cancelada
}

// Importa la interfaz de medicamento para asociar con el proveedor
import { Medicine } from './Medicine';