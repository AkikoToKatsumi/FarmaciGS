// src/validators/prescription.validator.ts
export const validatePrescriptionInput = async (data: any) => {
  const { clientId, medicines } = data;

  if (!clientId || !Array.isArray(medicines) || medicines.length === 0) {
    return {
      isValid: false,
      message: 'Debe proporcionar un cliente y al menos un medicamento',
    };
  }

  return { isValid: true, message: '' };
};

export const validateProviderInput = (data: any) => {
  // lógica de validación
  return { isValid: true, message: 'OK' };
};
