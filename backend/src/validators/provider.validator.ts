// Importa la instancia de Prisma para interactuar con la base de datos
import { prisma } from '../config/database';

// Interfaz para los datos de entrada del proveedor
interface ProviderInput {
  name: string; // Nombre del proveedor
  email?: string; // Correo electrónico (opcional)
  phone?: string; // Teléfono (opcional)
  taxId?: string; // RNC o identificación fiscal (opcional)
  id?: string; // ID del proveedor (opcional, para edición)
}

// Función para validar los datos de un proveedor antes de crear o actualizar
export const validateProviderInput = async (data: ProviderInput): Promise<{ isValid: boolean; message?: string }> => {
  const { name, email, phone, taxId, id } = data;

  // Validar que el nombre sea obligatorio y tenga al menos 2 caracteres
  if (!name || name.trim().length < 2) {
    return { isValid: false, message: 'El nombre del proveedor es obligatorio.' };
  }

  // Validar que el correo no esté repetido en otro proveedor
  if (email) {
    const exists = await prisma.provider.findFirst({ where: { email } });
    if (exists && exists.id !== id) {
      return { isValid: false, message: 'El correo ya está registrado para otro proveedor.' };
    }
  }

  // Validar que el RNC no esté repetido en otro proveedor
  if (taxId) {
    const exists = await prisma.provider.findFirst({ where: { taxId } });
    if (exists && exists.id !== id) {
      return { isValid: false, message: 'El RNC ya está registrado para otro proveedor.' };
    }
  }

  // Si pasa todas las validaciones, es válido
  return { isValid: true };
};
