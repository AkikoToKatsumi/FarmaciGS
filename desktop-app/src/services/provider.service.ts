// src/services/provider.service.ts
import axios from 'axios';

// Create axios instance with base configuration
const API = axios.create({ 
  baseURL: 'http://localhost:4004/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to include authentication token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || 
                  sessionStorage.getItem('authToken') ||
                  localStorage.getItem('token') ||
                  sessionStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle authentication errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface Provider {
  id: number;
  name: string;
  email: string;
  phone: string;
  tax_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProviderData {
  name: string;
  email: string;
  phone: string;
  taxId: string;
}

export interface UpdateProviderData {
  name: string;
  email: string;
  phone: string;
  taxId: string;
}

// Obtener todos los proveedores
export const getProviders = async (token?: string): Promise<Provider[]> => {
  try {
    const response = await API.get('/providers');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching providers:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener proveedores');
  }
};

// Obtener un proveedor por ID
export const getProviderById = async (id: number, token?: string): Promise<Provider> => {
  try {
    const response = await API.get(`/providers/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching provider:', error);
    if (error.response?.status === 404) {
      throw new Error('Proveedor no encontrado');
    }
    throw new Error(error.response?.data?.message || 'Error al obtener el proveedor');
  }
};

// Crear un nuevo proveedor
export const createProvider = async (providerData: CreateProviderData, token?: string): Promise<Provider> => {
  try {
    const response = await API.post('/providers', providerData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating provider:', error);
    if (error.response?.status === 409) {
      throw new Error('Ya existe un proveedor con el mismo email o número de identificación fiscal');
    }
    throw new Error(error.response?.data?.message || 'Error al crear el proveedor');
  }
};

// Actualizar un proveedor
export const updateProvider = async (
  id: number, 
  providerData: UpdateProviderData, 
  token?: string
): Promise<Provider> => {
  try {
    const response = await API.put(`/providers/${id}`, providerData);
    return response.data;
  } catch (error: any) {
    console.error('Error updating provider:', error);
    if (error.response?.status === 404) {
      throw new Error('Proveedor no encontrado');
    }
    if (error.response?.status === 409) {
      throw new Error('Ya existe otro proveedor con el mismo email o número de identificación fiscal');
    }
    throw new Error(error.response?.data?.message || 'Error al actualizar el proveedor');
  }
};

// Eliminar un proveedor
export const deleteProvider = async (id: number, token?: string): Promise<void> => {
  try {
    await API.delete(`/providers/${id}`);
  } catch (error: any) {
    console.error('Error deleting provider:', error);
    if (error.response?.status === 404) {
      throw new Error('Proveedor no encontrado');
    }
    if (error.response?.status === 409) {
      throw new Error('No se puede eliminar el proveedor porque tiene productos asociados');
    }
    throw new Error(error.response?.data?.message || 'Error al eliminar el proveedor');
  }
};