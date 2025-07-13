// src/services/sales.service.ts
import axios from 'axios';
import { Medicine } from './inventory.service';

const API = axios.create({
  baseURL: 'http://localhost:4004/api',
  headers: { 'Content-Type': 'application/json' }
});
export const getMedicineByBarcode = async (barcode: string): Promise<Medicine> => {
  const response = await API.get(`/inventory/barcode/${barcode}`);
  return response.data;
};


export interface SaleItemInput {
  medicineId: number;
  quantity: number;
}

export interface SaleResponse {
  sale: {
    id: number;
    total: number;
    created_at: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  pdf: string; // base64
}

export const createSale = async (
  userId: number,
  clientId: number | null,
  items: SaleItemInput[]
): Promise<SaleResponse> => {
  const response = await API.post('/sales', {
    userId,
    clientId,
    items
  });

  return response.data;
};
