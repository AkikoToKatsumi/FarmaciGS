import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:4004/api' });

interface ClientData {
  name: string;
  email?: string;
  phone?: string;
  rnc?: string;
  cedula?: string;
  address?: string;
}

export const getClients = async (token: string) => {
  const res = await API.get('/clients', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const createClient = async (data: ClientData, token: string) => {
  const res = await API.post('/clients', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateClient = async (id: number, data: ClientData, token: string) => {
  const res = await API.put(`/clients/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteClient = async (id: number, token: string) => {
  const res = await API.delete(`/clients/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
