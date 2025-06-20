export interface Provider {
  id: number;
  name: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  created_at: Date;
  medicines?: Medicine[];
}

export interface CreateProviderData {
  name: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdateProviderData {
  name?: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface ProviderResponse {
  id: number;
  name: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  created_at: Date;
  medicines_count?: number;
  total_value?: number;
}

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
  total_medicines: number;
  total_inventory_value: number;
}

export interface ProviderStats {
  total_providers: number;
  active_providers: number;
  top_providers: Array<{
    id: number;
    name: string;
    medicines_count: number;
    total_inventory_value: number;
  }>;
}

export interface ProviderOrder {
  provider_id: number;
  provider_name: string;
  order_date: Date;
  expected_delivery?: Date;
  status: OrderStatus;
  items: Array<{
    medicine_id: number;
    medicine_name: string;
    quantity_ordered: number;
    unit_price: number;
    total_price: number;
  }>;
  total_amount: number;
  notes?: string;
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

import { Medicine } from './Medicine';