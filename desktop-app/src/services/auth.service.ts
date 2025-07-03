import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:4002/api',
});

export const login = async (email: string, password: string) => {
  try {
    const res = await API.post('/auth/login', { email, password });
    return res.data;
  } catch (error: any) {
    console.error('Error en login:', error.response?.data || error.message);
    throw error;
  }
};

export const logout = async () => API.post('/auth/logout');

export const refreshToken = async () => {
  const res = await API.post('/auth/refresh');
  return res.data;
};