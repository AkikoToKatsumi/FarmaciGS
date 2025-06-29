import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:4000/api',
});

export const getSales = async (token: string) => {
  const res = await API.get('/sales', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const createSale = async (data: any, token: string) => {
  const res = await API.post('/sales', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteSale = async (id: number, token: string) => {
  const res = await API.delete(`/sales/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
