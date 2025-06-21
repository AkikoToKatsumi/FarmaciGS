import { prisma } from '../config/database';

interface SaleInput {
  userId: number;
  clientId?: number;
  items: {
    medicineId: number;
    quantity: number;
    price: number;
  }[];
}

export const validateSaleInput = async (data: SaleInput): Promise<{ isValid: boolean; message?: string }> => {
  const { userId, clientId, items } = data;

  if (!userId) {
    return { isValid: false, message: 'El ID del usuario es obligatorio.' };
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return { isValid: false, message: 'Debe agregar al menos un producto a la venta.' };
  }

  for (const item of items) {
    if (!item.medicineId || item.quantity <= 0) {
      return { isValid: false, message: 'Todos los productos deben tener cantidad válida y estar definidos.' };
    }

    const medicine = await prisma.medicine.findUnique({
      where: { id: item.medicineId }
    });

    if (!medicine) {
      return { isValid: false, message: `El medicamento con ID ${item.medicineId} no existe.` };
    }

    if (medicine.stock < item.quantity) {
      return { isValid: false, message: `Stock insuficiente para ${medicine.name}.` };
    }
  }

  if (clientId) {
    const clientExists = await prisma.client.findUnique({ where: { id: clientId } });
    if (!clientExists) {
      return { isValid: false, message: 'El cliente especificado no existe.' };
    }
  }

  return { isValid: true };
};
