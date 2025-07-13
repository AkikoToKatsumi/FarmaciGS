// src/services/inventory.service.ts
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Create axios instance with base configuration
const API = axios.create({ 
  baseURL: 'http://localhost:4003/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to include authentication token
API.interceptors.request.use(
  (config) => {
    // Get token from localStorage, sessionStorage, or wherever you store it
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
      // Token expired or invalid
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      
      // Redirect to login or emit an event
      
const navigate = useNavigate();
navigate('/login');
    }
    return Promise.reject(error);
  }
);

// Interfaz para los datos de un medicamento, como se reciben de la API.
export interface Medicine {
  id: number;
  name: string;
  description: string;
  stock: number;
  price: number;
  expiration_date: string; // snake_case desde la base de datos
  lot: string;
  category?: string;
  barcode?: string;
}

// Interfaz para los datos que se envían al backend para crear un medicamento.
export interface CreateMedicineData {
  name: string;
  description: string;
  stock: number;
  price: number;
  expirationDate: string; // camelCase para el cuerpo de la solicitud (req.body)
  lot: string;
  category?: string;
  barcode?: string;
}

// La actualización usa un subconjunto de los campos de creación.
export type UpdateMedicineData = Partial<CreateMedicineData>;

// Interfaz para respuestas de error
export interface ErrorResponse {
  message: string;
}

// Interfaz para respuestas de eliminación
export interface DeleteResponse {
  message: string;
}

/**
 * Obtiene todos los medicamentos del inventario
 * @returns Promise<Medicine[]> - Array de medicamentos
 */
export const getMedicine = async (): Promise<Medicine[]> => {
  try {
    const response = await API.get('/inventory');
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener medicamentos:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener medicamentos');
  }
};

/**
 * Obtiene un medicamento por su ID
 * @param id - ID del medicamento
 * @returns Promise<Medicine> - Medicamento encontrado
 */
export const getMedicineById = async (id: number): Promise<Medicine> => {
  try {
    const response = await API.get(`/inventory/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error al obtener medicamento con ID ${id}:`, error);
    if (error.response?.status === 404) {
      throw new Error('Medicamento no encontrado');
    }
    throw new Error(error.response?.data?.message || 'Error al obtener medicamento');
  }
};

/**
 * Crea un nuevo medicamento en el inventario
 * @param data - Datos del medicamento a crear
 * @returns Promise<Medicine> - Medicamento creado
 */
export const createMedicine = async (data: CreateMedicineData): Promise<Medicine> => {
  try {
    // Validación básica en el frontend
    if (!data.name || !data.lot) {
      throw new Error('El nombre y el lote son requeridos');
    }
    
    if (data.stock === undefined || data.price === undefined || !data.expirationDate) {
      throw new Error('Stock, precio y fecha de expiración son requeridos');
    }

    // Validación adicional
    if (data.stock < 0) {
      throw new Error('El stock no puede ser negativo');
    }
    
    if (data.price < 0) {
      throw new Error('El precio no puede ser negativo');
    }

    // Validación de fecha de expiración
    const expirationDate = new Date(data.expirationDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (expirationDate < today) {
      throw new Error('La fecha de expiración no puede ser anterior a hoy');
    }

    const response = await API.post('/inventory', data);
    return response.data;
  } catch (error: any) {
    console.error('Error al crear medicamento:', error);
    
    // Si el error ya tiene un mensaje personalizado, lo mantenemos
    if (error.message && !error.response) {
      throw error;
    }
    
    throw new Error(error.response?.data?.message || 'Error al crear medicamento');
  }
};

/**
 * Actualiza un medicamento existente
 * @param id - ID del medicamento a actualizar
 * @param data - Datos parciales del medicamento
 * @returns Promise<Medicine> - Medicamento actualizado
 */
export const updateMedicine = async (id: number, data: UpdateMedicineData): Promise<Medicine> => {
  try {
    // Validación básica para la actualización
    if (Object.keys(data).length === 0) {
      throw new Error('No se proporcionaron campos para actualizar');
    }

    // Validaciones condicionales
    if (data.stock !== undefined && data.stock < 0) {
      throw new Error('El stock no puede ser negativo');
    }
    
    if (data.price !== undefined && data.price < 0) {
      throw new Error('El precio no puede ser negativo');
    }

    if (data.expirationDate) {
      const expirationDate = new Date(data.expirationDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (expirationDate < today) {
        throw new Error('La fecha de expiración no puede ser anterior a hoy');
      }
    }

    const response = await API.put(`/inventory/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error(`Error al actualizar medicamento con ID ${id}:`, error);
    
    // Si el error ya tiene un mensaje personalizado, lo mantenemos
    if (error.message && !error.response) {
      throw error;
    }
    
    if (error.response?.status === 404) {
      throw new Error('Medicamento no encontrado');
    }
    
    throw new Error(error.response?.data?.message || 'Error al actualizar medicamento');
  }
};

/**
 * Elimina un medicamento del inventario
 * @param id - ID del medicamento a eliminar
 * @returns Promise<DeleteResponse> - Respuesta de confirmación
 */
export const deleteMedicine = async (id: number): Promise<DeleteResponse> => {
  try {
    const response = await API.delete(`/inventory/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error al eliminar medicamento con ID ${id}:`, error);
    
    if (error.response?.status === 404) {
      throw new Error('Medicamento no encontrado');
    }
    
    throw new Error(error.response?.data?.message || 'Error al eliminar medicamento');
  }
};

/**
 * Obtiene alertas de inventario (stock bajo y productos próximos a expirar)
 * @returns Promise<Medicine[]> - Array de medicamentos con alertas
 */
export const getStockAlerts = async (): Promise<Medicine[]> => {
  try {
    const response = await API.get('/inventory/alerts/stock');
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener alertas de stock:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener alertas de stock');
  }
};

/**
 * Obtiene medicamentos filtrados por categoría
 * @param category - Categoría a filtrar
 * @returns Promise<Medicine[]> - Array de medicamentos filtrados
 */
export const getMedicineByCategory = async (category: string): Promise<Medicine[]> => {
  try {
    const response = await API.get(`/inventory?category=${encodeURIComponent(category)}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error al obtener medicamentos por categoría ${category}:`, error);
    throw new Error(error.response?.data?.message || 'Error al obtener medicamentos por categoría');
  }
};

/**
 * Busca medicamentos por nombre o descripción
 * @param searchTerm - Término de búsqueda
 * @returns Promise<Medicine[]> - Array de medicamentos que coinciden con la búsqueda
 */
export const searchMedicine = async (searchTerm: string): Promise<Medicine[]> => {
  try {
    const response = await API.get(`/inventory?search=${encodeURIComponent(searchTerm)}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error al buscar medicamentos con término "${searchTerm}":`, error);
    throw new Error(error.response?.data?.message || 'Error al buscar medicamentos');
  }
};

/**
 * Obtiene estadísticas del inventario
 * @returns Promise con estadísticas básicas
 */
export const getInventoryStats = async () => {
  try {
    const response = await API.get('/inventory/stats/all');
    const stats = response.data;
    // El backend devuelve snake_case, lo convertimos a camelCase si es necesario
    // o ajustamos el frontend para que use los nombres del backend.
    // Por simplicidad, aquí devolvemos los datos tal cual.
    return {
      totalProducts: Number(stats.total_products),
      totalStock: Number(stats.total_stock),
      lowStockCount: Number(stats.low_stock_count),
      categoriesCount: Number(stats.categories_count),
      totalValue: Number(stats.total_value),
      expiringSoonCount: Number(stats.expiring_soon_count),
    }
  } catch (error: any) {
    console.error('Error al obtener estadísticas del inventario:', error);
    throw new Error('Error al obtener estadísticas del inventario');
  }
};

/**
 * Verifica si un medicamento está próximo a expirar
 * @param expirationDate - Fecha de expiración
 * @param daysThreshold - Días de umbral (por defecto 30)
 * @returns boolean - True si está próximo a expirar
 */
export const isExpiringSoon = (expirationDate: string, daysThreshold: number = 30): boolean => {
  const expDate = new Date(expirationDate);
  const today = new Date();
  const thresholdDate = new Date(today.getTime() + daysThreshold * 24 * 60 * 60 * 1000);
  
  return expDate <= thresholdDate;
};

/**
 * Verifica si un medicamento tiene stock bajo
 * @param stock - Cantidad en stock
 * @param threshold - Umbral de stock bajo (por defecto 10)
 * @returns boolean - True si tiene stock bajo
 */
export const isLowStock = (stock: number, threshold: number = 10): boolean => {
  return stock <= threshold;
};

/**
 * Formatea el precio a moneda local
 * @param price - Precio a formatear
 * @param currency - Moneda (por defecto EUR)
 * @returns string - Precio formateado
 */
export const formatPrice = (price: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency
  }).format(price);
};

/**
 * Genera un código de barras automático si no se proporciona
 * @returns string - Código de barras generado
 */
export const generateBarcode = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `MED-${timestamp}-${random}`;
};

// Utility function to set authentication token
export const setAuthToken = (token: string) => {
  localStorage.setItem('authToken', token);
};

// Utility function to remove authentication token
export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
  sessionStorage.removeItem('authToken');
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
};

// Utility function to get current token
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken') || 
         sessionStorage.getItem('authToken') ||
         localStorage.getItem('token') ||
         sessionStorage.getItem('token');
};

// Exportaciones adicionales para utilidades
export const inventoryUtils = {
  isExpiringSoon,
  isLowStock,
  formatPrice,
  generateBarcode,
  setAuthToken,
  removeAuthToken,
  getAuthToken
};