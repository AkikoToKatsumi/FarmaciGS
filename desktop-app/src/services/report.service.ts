import axios from 'axios';


export const getSalesReport = async (from: string, to: string, token: string) => {
  const res = await axios.get(`http://localhost:4004/api/reports/sales?from=${from}&to=${to}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};


export const getStockLowReport = async (token: string) => {
  const res = await axios.get(`http://localhost:4004/api/reports/low-stock`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getExpiringSoonReport = async (token: string) => {
  const res = await axios.get(`http://localhost:4004/api/reports/expiring`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
