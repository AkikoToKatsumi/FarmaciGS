import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:4002/api' });

export const getSalesReport = async (from: string, to: string, token: string) => {
  const res = await API.get(`/reports/sales?from=${from}&to=${to}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getStockLowReport = async (token: string) => {
  const res = await API.get('/reports/low-stock', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getExpiringSoonReport = async (token: string) => {
  const res = await API.get('/reports/expiring', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
