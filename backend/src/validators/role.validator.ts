import { prisma } from '../config/database';

interface RoleInput {
  name: string;
  id?: number;
}

export const validateRoleInput = async (data: RoleInput): Promise<{ isValid: boolean; message?: string }> => {
  const { name, id } = data;

  if (!name || name.trim().length < 3) {
    return { isValid: false, message: 'Nombre del rol demasiado corto.' };
  }

  const existing = await prisma.role.findUnique({ where: { name } });

  if (existing && existing.id !== id) {
    return { isValid: false, message: 'Ya existe un rol con ese nombre.' };
  }

  return { isValid: true };
};
