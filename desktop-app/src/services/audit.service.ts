import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:4004/api' });

export const getAuditLogs = async (token: string) => {
  const res = await API.get('/audit', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
