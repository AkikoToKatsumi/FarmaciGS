import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:4004/api' });

export const getPrescriptions = async (token: string) => {
  const res = await API.get('/prescriptions', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const createPrescription = async (data: any, token: string) => {
  const res = await API.post('/prescriptions', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
