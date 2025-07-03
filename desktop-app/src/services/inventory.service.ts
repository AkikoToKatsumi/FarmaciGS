import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:4002/api',
});

export const getMedicines = async (token: string) => {
  const res = await API.get('/inventory', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const createMedicine = async (data: any, token: string) => {
  const res = await API.post('/inventory', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateMedicine = async (id: number, data: any, token: string) => {
  const res = await API.put(`/inventory/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteMedicine = async (id: number, token: string) => {
  const res = await API.delete(`/inventory/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
