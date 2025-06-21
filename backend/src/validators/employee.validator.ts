import { prisma } from '../config/database';

interface EmployeeInput {
  name: string;
  email: string;
  roleId: number;
  id?: number; // para actualizaciones
}

export const validateEmployeeInput = async (data: EmployeeInput): Promise<{ isValid: boolean; message?: string }> => {
  const { email, id } = data;

  if (!email || !email.includes('@')) {
    return { isValid: false, message: 'Correo electrónico inválido.' };
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing && existing.id !== id) {
    return { isValid: false, message: 'Ya existe un empleado con ese correo.' };
  }

  return { isValid: true };
};
