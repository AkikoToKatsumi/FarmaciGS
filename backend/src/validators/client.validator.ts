import { prisma } from '../config/database';

interface ClientInput {
  name: string;
  email?: string;
  phone?: string;
  id?: number;
}

export const validateClientInput = async (data: ClientInput): Promise<{ isValid: boolean; message?: string }> => {
  const { email, phone, id } = data;

  if (!data.name || data.name.trim().length < 2) {
    return { isValid: false, message: 'El nombre del cliente es obligatorio.' };
  }

  if (email) {
    const existingEmail = await prisma.client.findFirst({
      where: { email }
    });

    if (existingEmail && existingEmail.id !== id) {
      return { isValid: false, message: 'Ya existe un cliente con ese correo.' };
    }
  }

  if (phone) {
    const existingPhone = await prisma.client.findFirst({
      where: { phone }
    });

    if (existingPhone && existingPhone.id !== id) {
      return { isValid: false, message: 'Ya existe un cliente con ese número.' };
    }
  }

  return { isValid: true };
};
