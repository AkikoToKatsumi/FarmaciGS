// Importa la instancia de Prisma para interactuar con la base de datos
import { prisma } from '../config/database';

// Interfaz para los datos de entrada de la receta
interface PrescriptionInput {
  clientId: number; // ID del cliente
  medicineIds: number[]; // Array de IDs de medicamentos
}

// Función para validar los datos de una receta antes de crearla
export const validatePrescriptionInput = async (data: PrescriptionInput): Promise<{ isValid: boolean; message?: string }> => {
  const { clientId, medicineIds } = data;

  // Validar que se proporcione el ID del cliente
  if (!clientId) {
    return { isValid: false, message: 'Se requiere el ID del cliente.' };
  }

  // Validar que se seleccione al menos un medicamento
  if (!Array.isArray(medicineIds) || medicineIds.length === 0) {
    return { isValid: false, message: 'Debe seleccionar al menos un medicamento para la receta.' };
  }

  // Verificar que el cliente exista
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) {
    return { isValid: false, message: 'El cliente especificado no existe.' };
  }

  // Verificar que todos los medicamentos existan
  const medicines = await prisma.medicine.findMany({
    where: {
      id: { in: medicineIds }
    }
  });

  if (medicines.length !== medicineIds.length) {
    return { isValid: false, message: 'Uno o más medicamentos no existen.' };
  }

  // Si pasa todas las validaciones, es válido
  return { isValid: true };
};
