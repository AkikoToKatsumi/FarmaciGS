// Definición de la interfaz para un cliente
export interface Client {
  id: number; // Identificador único del cliente
  name: string; // Nombre del cliente
  phone?: string; // Teléfono del cliente (opcional)
  email?: string; // Correo electrónico del cliente (opcional)
  created_at: Date; // Fecha de creación del cliente
  prescriptions?: Prescription[]; // Recetas asociadas al cliente (opcional)
  sales?: Sale[]; // Ventas asociadas al cliente (opcional)
}

// Datos requeridos para crear un cliente
export interface CreateClientData {
  name: string; // Nombre del cliente
  phone?: string; // Teléfono (opcional)
  email?: string; // Correo electrónico (opcional)
}

// Datos permitidos para actualizar un cliente
export interface UpdateClientData {
  name?: string; // Nombre (opcional)
  phone?: string; // Teléfono (opcional)
  email?: string; // Correo electrónico (opcional)
}

// Respuesta de cliente con información adicional
export interface ClientResponse {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  created_at: Date;
  total_purchases?: number; // Total de compras realizadas
  last_purchase?: Date; // Fecha de la última compra
  prescriptions_count?: number; // Cantidad de recetas
}

// Cliente con historial de compras y recetas
export interface ClientWithHistory {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  created_at: Date;
  purchase_history: ClientPurchaseHistory[]; // Historial de compras
  prescriptions: Prescription[]; // Recetas
  total_spent: number; // Total gastado
  last_purchase_date?: Date; // Fecha de la última compra
}

// Historial de compras de un cliente
export interface ClientPurchaseHistory {
  sale_id: number; // ID de la venta
  date: Date; // Fecha de la venta
  total: number; // Total de la venta
  payment_method?: string; // Método de pago (opcional)
  items: Array<{
    medicine_name: string; // Nombre del medicamento
    quantity: number; // Cantidad
    price: number; // Precio
  }>;
}

// Estadísticas generales de clientes
export interface ClientStats {
  total_clients: number; // Total de clientes
  new_clients_this_month: number; // Nuevos clientes este mes
  active_clients: number; // Clientes activos
  top_clients: Array<{
    id: number;
    name: string;
    total_spent: number;
    purchases_count: number;
  }>;
}

// Importa las interfaces de Prescription y Sale para asociar con el cliente
import { Prescription } from './Prescription';
import { Sale } from './Sale';