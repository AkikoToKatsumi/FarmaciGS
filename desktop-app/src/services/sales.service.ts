// src/services/sales.service.ts
import axios from 'axios';
import { Medicine } from './inventory.service';

const API = axios.create({
  baseURL: 'http://localhost:4004/api',
  headers: { 'Content-Type': 'application/json' }
});

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

// Nueva interfaz para cliente con información completa
export interface ClientWithDetails {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  rnc?: string;
  address?: string;
}

// Nueva interfaz para recetas con medicamentos
export interface PrescriptionWithMedicines {
  id: number;
  issued_at: string;
  medicines: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
    medicine_id: number;
  }>;
}

// Función para obtener cliente por ID con toda su información
export const getClientById = async (clientId: number, token: string): Promise<ClientWithDetails> => {
  try {
    const response = await API.get(`/clients/${clientId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener cliente:', error);
    throw error;
  }
};

// Función para obtener todas las recetas de un cliente
export const getPrescriptionsByClientId = async (clientId: number, token: string): Promise<PrescriptionWithMedicines[]> => {
  try {
    const response = await API.get(`/prescriptions/client/${clientId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener recetas del cliente:', error);
    throw error;
  }
};
export const medicineExists = async (medicineId: number, token: string): Promise<boolean> => {
  try {
    const response = await API.get(`/inventory/${medicineId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return true;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return false;
    }
    throw error;
  }
};

// Función para obtener la última receta de un cliente (mantener compatibilidad)
export const getLatestPrescriptionByClient = async (clientId: number, token: string) => {
  try {
    const response = await API.get(`/prescriptions/latest/${clientId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener última receta:', error);
    throw error;
  }
};
// Función para crear una venta
// Incluye manejo de errores y validación de datos
export interface SaleItem {
  medicine_id: number;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
} 



export const createSale = async (
  userId: number,
  clientId: number | null,
  items: SaleItemInput[],
  token: string,
  paymentMethod: string,
  rnc?: string
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
        Authorization: `Bearer ${token}`
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
    
    throw error;
  }
};