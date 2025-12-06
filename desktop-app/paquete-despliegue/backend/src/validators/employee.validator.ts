// src/validators/employee.validator.ts
import { z } from 'zod';

export const employeeSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  roleId: z.number().int('El ID de rol debe ser un número'),
  phone: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true; // Opcional
      return /^[+]?[\d\s\-\(\)]{7,20}$/.test(val);
    }, 'El formato del teléfono no es válido'),
});

export const validateEmployeeInput = async (data: any) => {
  const result = employeeSchema.safeParse(data);
  return {
    isValid: result.success,
    message: result.success ? '' : JSON.stringify(result.error.format())
  };
};