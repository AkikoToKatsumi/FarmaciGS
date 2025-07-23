import axios from 'axios';

export const createPrescription = async (
  clientId: number,
  medicines: { medicineId: number; quantity: number }[],
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

export const getPrescriptionsByClient = async (clientId: number, token: string) => {
  const res = await axios.get(`${'http://localhost:4004/api/prescriptions'}/client/${clientId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export default createPrescription;
