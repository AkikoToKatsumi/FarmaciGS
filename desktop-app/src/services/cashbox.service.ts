// src/services/cashbox.service.ts
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:4004/api',
  headers: { 'Content-Type': 'application/json' }
});

export interface CashboxSummary {
  totalSales: number;
  totalTransactions: number;
  byPaymentMethod: Record<string, number>;
}

export interface SaleDetail {
  id: number;
  user_name: string;
  client_name: string;
  total: number;
  created_at: string;
  payment_method: string;
  items: Array<{
    medicine_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

export interface CashboxDetails {
  summary: CashboxSummary;
  sales: SaleDetail[];
}

export const getCashboxSummary = async (token: string): Promise<CashboxSummary> => {
  try {
    const response = await API.get('/sales/cashbox-summary', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error: any) {
    // Manejo de error 500 y otros
    if (error.response?.status === 500) {
      throw new Error('Error interno del servidor al obtener el cuadre de caja.');
    }
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

export const getCashboxDetails = async (token: string): Promise<CashboxDetails> => {
  try {
    const response = await API.get('/sales/cashbox-details', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 500) {
      throw new Error('Error interno del servidor al obtener los detalles del cuadre de caja.');
    }
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};
