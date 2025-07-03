import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:4002/api' });

export const getDashboardStats = async (token: string) => {
  const headers = { Authorization: `Bearer ${token}` };

  const [salesToday, salesMonth, lowStock, clientCount, latestSales] =
    await Promise.all([
      API.get('/sales/summary?filter=today', { headers }),
      API.get('/sales/summary?filter=month', { headers }),
      API.get('/inventory/low-stock', { headers }),
      API.get('/clients/count', { headers }),
      API.get('/sales/latest', { headers }),
    ]);

  return {
    salesToday: salesToday.data.total,
    salesMonth: salesMonth.data.total,
    lowStock: lowStock.data.length,
    clients: clientCount.data.count,
    latestSales: latestSales.data,
  };
};
