import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:4004/api/categories',
  headers: { 'Content-Type': 'application/json' }
});

export interface Category {
  id: number;
  name: string;
}

export const getCategories = async (token: string): Promise<Category[]> => {
  const response = await API.get('/', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data; // [{id, name}]
};

export const createCategory = async (name: string, token: string): Promise<Category> => {
  const response = await API.post('/', { name }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteCategory = async (id: number, token: string): Promise<void> => {
  await API.delete(`/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
