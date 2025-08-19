// Descargar cuadre de caja en CSV
export const downloadCashboxCSV = async (token: string): Promise<Blob> => {
  const response = await API.get('/sales/cashbox-summary/export', {
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'blob'
  });
  return response.data;
};
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
