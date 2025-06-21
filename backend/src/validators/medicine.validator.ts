// Importa la instancia de Prisma para interactuar con la base de datos
import { prisma } from '../config/database';

// Interfaz para los datos de entrada del medicamento
interface MedicineInput {
  name: string; // Nombre del medicamento
  lot: string; // Lote del medicamento
  id?: number; // ID del medicamento (opcional, para edición)
}

// Función para validar los datos de un medicamento antes de crear o actualizar
export const validateMedicineInput = async (data: MedicineInput): Promise<{ isValid: boolean; message?: string }> => {
  const { name, lot, id } = data;

  // Validar que el nombre sea obligatorio y tenga al menos 2 caracteres
  if (!name || name.trim().length < 2) {
    return { isValid: false, message: 'El nombre del medicamento es obligatorio.' };
  }

  // Verificar si ya existe un medicamento con el mismo nombre y lote
  const existing = await prisma.medicine.findFirst({
    where: {
      name,
      lot
    }
  });

  // Si existe y no es el mismo (en edición), retorna error
  if (existing && existing.id !== id) {
    return { isValid: false, message: 'Ya existe un medicamento con ese nombre y lote.' };
  }

  // Si pasa todas las validaciones, es válido
  return { isValid: true };
};
