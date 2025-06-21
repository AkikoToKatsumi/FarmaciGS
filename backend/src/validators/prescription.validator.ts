import { prisma } from '../config/database';

interface PrescriptionInput {
  clientId: number;
  medicineIds: number[];
}

export const validatePrescriptionInput = async (data: PrescriptionInput): Promise<{ isValid: boolean; message?: string }> => {
  const { clientId, medicineIds } = data;

  if (!clientId) {
    return { isValid: false, message: 'Se requiere el ID del cliente.' };
  }

  if (!Array.isArray(medicineIds) || medicineIds.length === 0) {
    return { isValid: false, message: 'Debe seleccionar al menos un medicamento para la receta.' };
  }

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) {
    return { isValid: false, message: 'El cliente especificado no existe.' };
  }

  const medicines = await prisma.medicine.findMany({
    where: {
      id: { in: medicineIds }
    }
  });

  if (medicines.length !== medicineIds.length) {
    return { isValid: false, message: 'Uno o más medicamentos no existen.' };
  }

  return { isValid: true };
};
