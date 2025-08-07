// src/services/dashboard.service.ts
import axios from 'axios';

const API_URL = 'http://localhost:4004/api'; // Asegúrate de que esta sea tu URL base del API

export interface DashboardStats {
  dailySales: number;
  productsSold: number;
  clientsServed: number;
  lowStockCount: number;
  recentActivities: {
    id: number;
    action: string;
    user: {
      name: string;
    };
    created_at: string;
  }[];
  // Agrega las propiedades opcionales para tendencias
  salesTrend?: Array<{ week: string; sales: number }>;
  totalSalesTrend?: Array<{ date?: string; month?: string; year?: string; sales: number; returns: number; discounts: number }>;
}

export interface Sale {
  id: number;
  user_id: number;
  client_id: number | null;
  total: number;
  created_at: string;
  user_name?: string;
  client_name?: string;
}

export interface SaleItem {
  medicineId: number;
  quantity: number;
}

export interface CreateSaleRequest {
  userId: number;
  clientId: number | null;
  items: SaleItem[];
}

export interface CreateSaleResponse {
  sale: Sale;
  items: any[];
  pdf?: string;
  message: string;
}

// Función para obtener estadísticas del dashboard
export const getDashboardStats = async (
  token: string,
  trendType?: 'semana' | 'mes' | 'año'
): Promise<DashboardStats> => {
  try {
    const params: any = {};
    if (trendType) params.trendType = trendType;
    const response = await axios.get(`${API_URL}/dashboard/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    });
    
    console.log('Dashboard stats response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// Función para obtener todas las ventas
export const getSales = async (token: string): Promise<Sale[]> => {
  try {
    const response = await axios.get(`${API_URL}/sales`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching sales:', error);
    throw error;
  }
};

// Función para obtener una venta específica
export const getSaleById = async (token: string, saleId: number): Promise<{ sale: Sale; items: any[] }> => {
  try {
    const response = await axios.get(`${API_URL}/sales/${saleId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching sale:', error);
    throw error;
  }
};

// Función para crear una nueva venta
export const createSale = async (token: string, saleData: CreateSaleRequest): Promise<CreateSaleResponse> => {
  try {
    console.log('Enviando datos de venta:', saleData);
    
    const response = await axios.post(`${API_URL}/sales`, saleData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Respuesta de creación de venta:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating sale:', error);
    throw error;
  }
};

// Función para obtener registros de auditoría
export const getAuditLogs = async (token: string, params?: {
  page?: number;
  limit?: number;
  user_id?: number;
  action?: string;
  date_from?: string;
  date_to?: string;
}): Promise<{
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await axios.get(`${API_URL}/audit${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
};

// Función para obtener estadísticas de auditoría
export const getAuditStats = async (token: string): Promise<{
  todayActivities: number;
  userActivities: Array<{ name: string; activity_count: number }>;
  commonActivities: Array<{ activity_type: string; count: number }>;
}> => {
  try {
    const response = await axios.get(`${API_URL}/audit/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching audit stats:', error);
    throw error;
  }
};