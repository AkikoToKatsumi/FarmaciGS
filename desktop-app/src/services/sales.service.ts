import API from './api';

interface SaleItemData {
  productId: number;
  quantity: number;
  price: number;
  discount: number;
}

interface CreateSaleData {
  items: SaleItemData[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  customerName: string;
  customerDocument: string;
  paymentMethod: string;
  userId: number;
}

export const getSales = async () => {
  const res = await API.get('/sales');
  return res.data;
};


export const getSalesByDate = async (token: string, startDate: string, endDate: string) => {
  const res = await API.get(`/sales/date?start=${startDate}&end=${endDate}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getSalesByCustomer = async (token: string, customerName: string) => {
  const res = await API.get(`/sales/customer/${encodeURIComponent(customerName)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getDailySales = async (token: string, date: string) => {
  const res = await API.get(`/sales/daily?date=${date}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getMonthlySales = async (token: string, year: number, month: number) => {
  const res = await API.get(`/sales/monthly?year=${year}&month=${month}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getSalesStats = async (token: string) => {
  const res = await API.get('/sales/stats', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const createSale = async (token: string, saleData: CreateSaleData) => {
  const res = await API.post('/sales', saleData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateSale = async (token: string, id: number, saleData: Partial<CreateSaleData>) => {
  const res = await API.put(`/sales/${id}`, saleData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const cancelSale = async (token: string, id: number, reason: string) => {
  const res = await API.patch(`/sales/${id}/cancel`, { reason }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteSale = async (token: string, id: number) => {
  const res = await API.delete(`/sales/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const printSaleReceipt = async (token: string, id: number) => {
  const res = await API.get(`/sales/${id}/receipt`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'blob'
  });
  return res.data;
};