// Definición de la interfaz para una venta
export interface Sale {
  id: number; // Identificador único de la venta
  client_id?: number; // ID del cliente (opcional)
  user_id?: number; // ID del usuario que realizó la venta (opcional)
  total: number; // Total de la venta
  payment_method?: string; // Método de pago (opcional)
  created_at: Date; // Fecha de creación de la venta
  client?: Client; // Objeto cliente asociado (opcional)
  user?: User; // Objeto usuario asociado (opcional)
  sale_items?: SaleItem[]; // Lista de items de la venta (opcional)
}

// Detalle de un item de venta
export interface SaleItem {
  id: number; // Identificador único del item
  sale_id?: number; // ID de la venta (opcional)
  medicine_id?: number; // ID del medicamento (opcional)
  quantity: number; // Cantidad vendida
  price: number; // Precio unitario
  medicine?: Medicine; // Objeto medicamento asociado (opcional)
}

// Datos requeridos para crear una venta
export interface CreateSaleData {
  client_id?: number; // ID del cliente (opcional)
  user_id: number; // ID del usuario que realiza la venta
  payment_method?: string; // Método de pago (opcional)
  items: CreateSaleItemData[]; // Lista de items de la venta
}

// Datos requeridos para crear un item de venta
export interface CreateSaleItemData {
  medicine_id: number; // ID del medicamento
  quantity: number; // Cantidad
  price: number; // Precio unitario
}

// Respuesta de venta con información adicional
export interface SaleResponse {
  id: number;
  client_id?: number;
  user_id?: number;
  total: number;
  payment_method?: string;
  created_at: Date;
  client?: {
    id: number;
    name: string;
    phone?: string;
  };
  user?: {
    id: number;
    name: string;
  };
  items: SaleItemResponse[]; // Lista de items de la venta
}

// Respuesta de un item de venta
export interface SaleItemResponse {
  id: number;
  medicine_id: number;
  medicine_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

// Reporte de ventas para análisis
export interface SalesReport {
  period: string; // Periodo del reporte
  total_sales: number; // Total de ventas
  total_revenue: number; // Ingresos totales
  average_sale: number; // Venta promedio
  total_items_sold: number; // Total de items vendidos
  top_medicines: Array<{
    medicine_id: number;
    medicine_name: string;
    quantity_sold: number;
    revenue: number;
  }>;
  sales_by_payment_method: Array<{
    payment_method: string;
    count: number;
    total: number;
  }>;
  daily_sales: Array<{
    date: string;
    sales_count: number;
    revenue: number;
  }>;
}

// Reporte diario de ventas
export interface DailySales {
  date: string; // Fecha
  sales_count: number; // Cantidad de ventas
  total_revenue: number; // Ingresos totales
  items_sold: number; // Total de items vendidos
}

// Enum para los métodos de pago
export enum PaymentMethod {
  CASH = 'cash', // Efectivo
  CARD = 'card', // Tarjeta
  TRANSFER = 'transfer', // Transferencia
  CREDIT = 'credit' // Crédito
}

// Estructura para una venta en el punto de venta (POS)
export interface POS_Sale {
  items: Array<{
    medicine_id: number; // ID del medicamento
    medicine_name: string; // Nombre del medicamento
    price: number; // Precio unitario
    quantity: number; // Cantidad
    subtotal: number; // Subtotal por item
  }>;
  subtotal: number; // Subtotal de la venta
  tax: number; // Impuesto
  discount: number; // Descuento
  total: number; // Total de la venta
  client_id?: number; // ID del cliente (opcional)
  payment_method: PaymentMethod; // Método de pago
}

// Importa las interfaces de Client, User y Medicine para asociar con la venta
import { Client } from './Client';
import { User } from './user';
import { Medicine } from './Medicine';