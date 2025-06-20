export interface Client {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  created_at: Date;
  prescriptions?: Prescription[];
  sales?: Sale[];
}

export interface CreateClientData {
  name: string;
  phone?: string;
  email?: string;
}

export interface UpdateClientData {
  name?: string;
  phone?: string;
  email?: string;
}

export interface ClientResponse {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  created_at: Date;
  total_purchases?: number;
  last_purchase?: Date;
  prescriptions_count?: number;
}

export interface ClientWithHistory {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  created_at: Date;
  purchase_history: ClientPurchaseHistory[];
  prescriptions: Prescription[];
  total_spent: number;
  last_purchase_date?: Date;
}

export interface ClientPurchaseHistory {
  sale_id: number;
  date: Date;
  total: number;
  payment_method?: string;
  items: Array<{
    medicine_name: string;
    quantity: number;
    price: number;
  }>;
}

export interface ClientStats {
  total_clients: number;
  new_clients_this_month: number;
  active_clients: number;
  top_clients: Array<{
    id: number;
    name: string;
    total_spent: number;
    purchases_count: number;
  }>;
}

import { Prescription } from './Prescription';
import { Sale } from './Sale';