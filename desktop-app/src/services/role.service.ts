import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:4004/api' });

export const getRoles = async (token: string) => {
  try {
    const res = await API.get('/roles', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error: any) {
    // Log error details for debugging
    console.error('getRoles error:', error?.response?.data || error.message);
    // Optionally, throw a more descriptive error
    throw new Error(
      error?.response?.data?.message ||
      'No se pudieron obtener los roles. Intente más tarde.'
    );
  }
};

export const createRole = async (data: any, token: string) => {
  const res = await API.post('/roles', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateRole = async (id: number, data: any, token: string) => {
  const res = await API.put(`/roles/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteRole = async (id: number, token: string) => {
  const res = await API.delete(`/roles/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
