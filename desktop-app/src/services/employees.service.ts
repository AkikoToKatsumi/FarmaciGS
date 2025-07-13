import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:4004/api' });

export const getEmployees = async (token: string) => {
  const res = await API.get('/employees', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const createEmployee = async (data: any, token: string) => {
  const res = await API.post('/employees', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateEmployee = async (id: number, data: any, token: string) => {
  const res = await API.put(`/employees/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteEmployee = async (id: number, token: string) => {
  const res = await API.delete(`/employees/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
