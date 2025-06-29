import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:4000/api' });

export const getRoles = async (token: string) => {
  const res = await API.get('/roles', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
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
