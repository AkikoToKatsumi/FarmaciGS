import axios from 'axios';

export const createPrescription = async (
  clientId: number,
  medicines: { medicineId: number; quantity: number }[], // Ya recibe el formato correcto
  token: string
) => {
  const response = await axios.post('http://localhost:4004/api/prescriptions', {
    clientId,
    medicines
  }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
       
  return response.data;
};

export const getPrescriptionsByClient = async (clientId: number, token: string, ) => {
  // El backend espera /client/:id, así que el param debe ser id
  const res = await axios.get(`http://localhost:4004/api/prescriptions/client/${clientId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const getLatestPrescriptionByClient = async (clientId: number, token: string) => {
  const response = await axios.get(`http://localhost:4004/api/prescriptions/latest/${clientId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export default createPrescription;