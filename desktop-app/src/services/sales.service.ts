// src/services/sales.service.ts
import axios from 'axios';
import { Medicine } from './inventory.service';

const API = axios.create({
  baseURL: 'http://localhost:4004/api',
  headers: { 'Content-Type': 'application/json' }
});

// ❌ PROBLEMA: No uses localStorage directamente
// ✅ SOLUCIÓN: Pasar el token como parámetro
export const getMedicineByBarcode = async (barcode: string, token?: string): Promise<Medicine> => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const response = await API.get(`/inventory/barcode/${barcode}`, config);
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

// ✅ SOLUCIÓN: Recibir token como parámetro
export const createSale = async (
  userId: number,
  clientId: number | null,
  items: SaleItemInput[],
  token: string,
  paymentMethod: string,
  rnc?: string // 👈 Añadir token como parámetro
): Promise<SaleResponse> => {
  try {
    console.log('Creando venta con:', { userId, clientId, items });
    console.log('Token enviado:', token ? 'Presente' : 'Ausente');
    
    const response = await API.post('/sales', {
      userId,
      clientId,
      items,
      paymentMethod,
      rnc
    }, {
      headers: {
        Authorization: `Bearer ${token}`  // 👈 Enviar token en headers
      }
    });
    
    console.log('Venta creada exitosamente:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error al crear venta:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      token: token ? 'Token presente' : 'Token ausente'
    });
    
    // Re-lanzar el error para que el componente lo maneje
    throw error;
  }
};