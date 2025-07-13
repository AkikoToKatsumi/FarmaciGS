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
}

export const getDashboardStats = async (token: string): Promise<DashboardStats> => {
  const response = await axios.get(`${API_URL}/dashboard/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};