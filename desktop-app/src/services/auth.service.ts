// src/services/auth.service.ts
import API from './api';

export const login = async (email: string, password: string) => {
  try {
    console.log('🌐 Intentando login con backend remoto...');
    const res = await API.post('/auth/login', { email, password });
    console.log('Respuesta completa del servidor:', res.data);
    return res.data; // Retorna { user, accessToken }
  } catch (error: any) {
    console.error('Error en login:', error.response?.data || error.message);
    throw error;
  }
};

export const logout = async () => {
  try {
    const res = await API.post('/auth/logout');
    return res.data;
  } catch (error: any) {
    console.error('Error en logout:', error);
    // Limpiar de todas formas
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { success: true };
  }
};

export const refreshToken = async () => {
  try {
    const res = await API.post('/auth/refresh');
    return res.data;
  } catch (error: any) {
    console.error('Error en refresh token:', error);
    throw error;
  }
};