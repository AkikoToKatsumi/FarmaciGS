// Importa la instancia de Prisma para interactuar con la base de datos
import { prisma } from '../config/database';

// Interfaz para los datos de entrada de la venta
interface SaleInput {
  userId: number; // ID del usuario que realiza la venta
  clientId?: number; // ID del cliente (opcional)
  items: {
    medicineId: number; // ID del medicamento
    quantity: number; // Cantidad vendida
    price: number; // Precio unitario
  }[];
}

// Función para validar los datos de una venta antes de crearla
export const validateSaleInput = async (data: SaleInput): Promise<{ isValid: boolean; message?: string }> => {
  const { userId, clientId, items } = data;

  // Validar que el usuario esté definido
  if (!userId) {
    return { isValid: false, message: 'El ID del usuario es obligatorio.' };
  }

  // Validar que haya al menos un producto en la venta
  if (!items || !Array.isArray(items) || items.length === 0) {
    return { isValid: false, message: 'Debe agregar al menos un producto a la venta.' };
  }

  // Validar cada producto de la venta
  for (const item of items) {
    if (!item.medicineId || item.quantity <= 0) {
      return { isValid: false, message: 'Todos los productos deben tener cantidad válida y estar definidos.' };
    }

    // Verificar que el medicamento exista
    const medicine = await prisma.medicine.findUnique({
      where: { id: item.medicineId }
    });

    if (!medicine) {
      return { isValid: false, message: `El medicamento con ID ${item.medicineId} no existe.` };
    }

    // Verificar que haya suficiente stock
    if (medicine.stock < item.quantity) {
      return { isValid: false, message: `Stock insuficiente para ${medicine.name}.` };
    }
  }

  // Si se especifica cliente, verificar que exista
  if (clientId) {
    const clientExists = await prisma.client.findUnique({ where: { id: clientId } });
    if (!clientExists) {
      return { isValid: false, message: 'El cliente especificado no existe.' };
    }
  }

  // Si pasa todas las validaciones, es válido
  return { isValid: true };
};
