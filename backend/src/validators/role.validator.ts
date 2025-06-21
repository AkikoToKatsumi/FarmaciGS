// Importa la instancia de Prisma para interactuar con la base de datos
import { prisma } from '../config/database';

// Interfaz para los datos de entrada del rol
interface RoleInput {
  name: string; // Nombre del rol
  id?: number; // ID del rol (opcional, para edición)
}

// Función para validar los datos de un rol antes de crear o actualizar
export const validateRoleInput = async (data: RoleInput): Promise<{ isValid: boolean; message?: string }> => {
  const { name, id } = data;

  // Validar que el nombre tenga al menos 3 caracteres
  if (!name || name.trim().length < 3) {
    return { isValid: false, message: 'Nombre del rol demasiado corto.' };
  }

  // Verificar si ya existe un rol con ese nombre
  const existing = await prisma.role.findUnique({ where: { name } });

  // Si existe y no es el mismo (en edición), retorna error
  if (existing && existing.id !== id) {
    return { isValid: false, message: 'Ya existe un rol con ese nombre.' };
  }

  // Si pasa todas las validaciones, es válido
  return { isValid: true };
};
