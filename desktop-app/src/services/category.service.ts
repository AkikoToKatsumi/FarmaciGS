import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:4004/api',
  headers: { 'Content-Type': 'application/json' }
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

export type Category = string;

export const getCategories = async (token?: string): Promise<Category[]> => {
  try {
    const response = await API.get('/categories');
    console.log('Categorías recibidas:', response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    throw new Error('Error al obtener categorías');
  }
};

export const createCategory = async (name: string, token?: string): Promise<Category> => {
  try {
    const response = await API.post('/categories', { name });
    return response.data;
  } catch (error: any) {
    console.error('Error al crear categoría:', error);
    throw new Error(error.response?.data?.message || 'Error al crear categoría');
  }
};

export const deleteCategory = async (idOrName: number | string, token?: string): Promise<void> => {
  try {
    await API.delete(`/categories/${encodeURIComponent(String(idOrName))}`);
  } catch (error: any) {
    console.error('Error al eliminar categoría:', error);
    throw new Error(error.response?.data?.message || 'Error al eliminar categoría');
  }
};
