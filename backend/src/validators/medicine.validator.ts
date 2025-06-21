import { prisma } from '../config/database';

interface MedicineInput {
  name: string;
  lot: string;
  id?: number;
}

export const validateMedicineInput = async (data: MedicineInput): Promise<{ isValid: boolean; message?: string }> => {
  const { name, lot, id } = data;

  if (!name || name.trim().length < 2) {
    return { isValid: false, message: 'El nombre del medicamento es obligatorio.' };
  }

  const existing = await prisma.medicine.findFirst({
    where: {
      name,
      lot
    }
  });

  if (existing && existing.id !== id) {
    return { isValid: false, message: 'Ya existe un medicamento con ese nombre y lote.' };
  }

  return { isValid: true };
};
