import { AxiosError } from 'axios';
import API from './api';

export const getSalesReport = async (from: string, to: string) => {
  try {
    const res = await API.get('/reports/sales', {
      params: { from, to },
    });
    return res.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    console.error('Error fetching sales report:', axiosError.response?.data || axiosError.message);
    throw new Error(axiosError.response?.data?.message || 'No se pudo obtener el reporte de ventas.');
  }
};

export const getStockLowReport = async () => {
  try {
    const res = await API.get('/reports/low-stock');
    return res.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    console.error('Error fetching low stock report:', axiosError.response?.data || axiosError.message);
    throw new Error(axiosError.response?.data?.message || 'No se pudo obtener el reporte de stock bajo.');
  }
};

export const getExpiringSoonReport = async () => {
  try {
    const res = await API.get('/reports/expiring');
    return res.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    console.error('Error fetching expiring soon report:', axiosError.response?.data || axiosError.message);
    throw new Error(axiosError.response?.data?.message || 'No se pudo obtener el reporte de productos próximos a vencer.');
  }
};
