// src/services/sales.service.ts
import axios from 'axios';
import { Medicine } from './inventory.service';

const API = axios.create({
  baseURL: 'http://localhost:4004/api',
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor para añadir token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de respuesta - NO redirigir automáticamente
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // NO redirigir automáticamente, solo loguear el error
    console.error('Error en API:', error.response?.status, error.response?.data);
    
    // Dejar que el componente maneje el error
    return Promise.reject(error);
  }
);

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
  pdf: string;
}

export const createSale = async (
  userId: number,
  clientId: number | null,
  items: SaleItemInput[]
): Promise<SaleResponse> => {
  try {
    console.log('Creando venta con:', { userId, clientId, items });
    
    const response = await API.post('/sales', {
      userId,
      clientId,
      items
    });
    
    console.log('Venta creada exitosamente:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error al crear venta:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // Re-lanzar el error para que el componente lo maneje
    throw error;
  }
};