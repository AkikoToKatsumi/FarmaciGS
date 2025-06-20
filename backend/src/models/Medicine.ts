export interface Medicine {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  expiration_date?: Date;
  lot_number?: string;
  created_at: Date;
  provider_id?: number;
  provider?: Provider;
}

export interface CreateMedicineData {
  name: string;
  description?: string;
  price: number;
  stock: number;
  expiration_date?: Date;
  lot_number?: string;
  provider_id?: number;
}

export interface UpdateMedicineData {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  expiration_date?: Date;
  lot_number?: string;
  provider_id?: number;
}

export interface MedicineResponse {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  expiration_date?: Date;
  lot_number?: string;
  created_at: Date;
  provider?: ProviderResponse;
}

export interface MedicineInventory {
  id: number;
  name: string;
  stock: number;
  expiration_date?: Date;
  lot_number?: string;
  days_to_expiration?: number;
  is_expired: boolean;
  is_low_stock: boolean;
}

export interface StockAlert {
  medicine_id: number;
  medicine_name: string;
  current_stock: number;
  minimum_stock: number;
  alert_type: 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export interface ExpirationAlert {
  medicine_id: number;
  medicine_name: string;
  expiration_date: Date;
  days_to_expiration: number;
  lot_number?: string;
  alert_type: 'EXPIRING_SOON' | 'EXPIRED';
}

import { Provider, ProviderResponse } from './Provider';