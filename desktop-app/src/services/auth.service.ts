import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:4000/api',
});

export const login = async (email: string, password: string) => {
  const res = await API.post('/auth/login', { email, password });
  return res.data;
};

export const logout = async () => API.post('/auth/logout');

export const refreshToken = async () => {
  const res = await API.post('/auth/refresh');
  return res.data;
};
