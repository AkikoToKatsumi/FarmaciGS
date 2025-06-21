// Importa la instancia de Prisma para interactuar con la base de datos
import { prisma } from '../config/database';

// Interfaz para los datos de entrada del cliente
interface ClientInput {
  name: string; // Nombre del cliente
  email?: string; // Correo electrónico (opcional)
  phone?: string; // Teléfono (opcional)
  id?: number; // ID del cliente (opcional, para edición)
}

// Función para validar los datos de un cliente antes de crear o actualizar
export const validateClientInput = async (data: ClientInput): Promise<{ isValid: boolean; message?: string }> => {
  const { email, phone, id } = data;

  // Validar que el nombre sea obligatorio y tenga al menos 2 caracteres
  if (!data.name || data.name.trim().length < 2) {
    return { isValid: false, message: 'El nombre del cliente es obligatorio.' };
  }

  // Validar que el email no esté repetido en otro cliente
  if (email) {
    const existingEmail = await prisma.client.findFirst({
      where: { email }
    });

    if (existingEmail && existingEmail.id !== id) {
      return { isValid: false, message: 'Ya existe un cliente con ese correo.' };
    }
  }

  // Validar que el teléfono no esté repetido en otro cliente
  if (phone) {
    const existingPhone = await prisma.client.findFirst({
      where: { phone }
    });

    if (existingPhone && existingPhone.id !== id) {
      return { isValid: false, message: 'Ya existe un cliente con ese número.' };
    }
  }

  // Si pasa todas las validaciones, es válido
  return { isValid: true };
};
