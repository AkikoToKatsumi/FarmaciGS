import { prisma } from '../config/database';

interface ProviderInput {
  name: string;
  email?: string;
  phone?: string;
  taxId?: string;
  id?: string; // Para edición
}

export const validateProviderInput = async (data: ProviderInput): Promise<{ isValid: boolean; message?: string }> => {
  const { name, email, phone, taxId, id } = data;

  if (!name || name.trim().length < 2) {
    return { isValid: false, message: 'El nombre del proveedor es obligatorio.' };
  }

  if (email) {
    const exists = await prisma.provider.findFirst({ where: { email } });
    if (exists && exists.id !== id) {
      return { isValid: false, message: 'El correo ya está registrado para otro proveedor.' };
    }
  }

  if (taxId) {
    const exists = await prisma.provider.findFirst({ where: { taxId } });
    if (exists && exists.id !== id) {
      return { isValid: false, message: 'El RNC ya está registrado para otro proveedor.' };
    }
  }

  return { isValid: true };
};
