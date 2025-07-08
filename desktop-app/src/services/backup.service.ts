import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:4003/api' });

export const createBackup = async (token: string) => {
  const res = await API.post('/reports/backup', {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getBackups = async (token: string) => {
  const res = await API.get('/reports/backups', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const deleteBackup = async (filename: string, token: string) => {
  const res = await API.delete(`/reports/backups/${filename}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};
