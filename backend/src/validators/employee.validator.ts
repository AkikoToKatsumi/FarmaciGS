// Importa la instancia de Prisma para interactuar con la base de datos
import { prisma } from '../config/database';

// Interfaz para los datos de entrada del empleado
interface EmployeeInput {
  name: string; // Nombre del empleado
  email: string; // Correo electrónico
  roleId: number; // ID del rol
  id?: number; // ID del empleado (opcional, para actualizaciones)
}

// Función para validar los datos de un empleado antes de crear o actualizar
export const validateEmployeeInput = async (data: EmployeeInput): Promise<{ isValid: boolean; message?: string }> => {
  const { email, id } = data;

  // Validar que el email sea válido
  if (!email || !email.includes('@')) {
    return { isValid: false, message: 'Correo electrónico inválido.' };
  }

  // Verificar si ya existe un usuario con ese correo
  const existing = await prisma.user.findUnique({ where: { email } });

  // Si existe y no es el mismo (en edición), retorna error
  if (existing && existing.id !== id) {
    return { isValid: false, message: 'Ya existe un empleado con ese correo.' };
  }

  // Si pasa todas las validaciones, es válido
  return { isValid: true };
};
