import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:4003/api' });

export const getAuditLogs = async (token: string) => {
  const res = await API.get('/audit', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
