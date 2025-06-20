export interface Sale {
  id: number;
  client_id?: number;
  user_id?: number;
  total: number;
  payment_method?: string;
  created_at: Date;
  client?: Client;
  user?: User;
  sale_items?: SaleItem[];
}

export interface SaleItem {
  id: number;
  sale_id?: number;
  medicine_id?: number;
  quantity: number;
  price: number;
  medicine?: Medicine;
}

export interface CreateSaleData {
  client_id?: number;
  user_id: number;
  payment_method?: string;
  items: CreateSaleItemData[];
}

export interface CreateSaleItemData {
  medicine_id: number;
  quantity: number;
  price: number;
}

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
  items: SaleItemResponse[];
}

export interface SaleItemResponse {
  id: number;
  medicine_id: number;
  medicine_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface SalesReport {
  period: string;
  total_sales: number;
  total_revenue: number;
  average_sale: number;
  total_items_sold: number;
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

export interface DailySales {
  date: string;
  sales_count: number;
  total_revenue: number;
  items_sold: number;
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  TRANSFER = 'transfer',
  CREDIT = 'credit'
}

export interface POS_Sale {
  items: Array<{
    medicine_id: number;
    medicine_name: string;
    price: number;
    quantity: number;
    subtotal: number;
  }>;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  client_id?: number;
  payment_method: PaymentMethod;
}

import { Client } from './Client';
import { User } from './User';
import { Medicine } from './Medicine';