import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:4004/api/categories',
  headers: { 'Content-Type': 'application/json' }
});

export interface Category {
  id: number;
  name: string;
}

export const getCategories = async (): Promise<Category[]> => {
  const response = await API.get('');
  return response.data;
};

export const createCategory = async (name: string): Promise<Category> => {
  const response = await API.post('', { name });
  return response.data;
};

export const deleteCategory = async (id: number): Promise<void> => {
  await API.delete(`/${id}`);
};
