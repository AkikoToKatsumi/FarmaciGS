// src/validators/role.validator.ts
import { z } from 'zod';

const roleSchema = z.object({
  name: z.string().min(1, 'Nombre de rol requerido'),
});

export const validateRoleInput = (data: any) => {
  const result = roleSchema.safeParse(data);
  if (result.success) {
    return { isValid: true, message: '' };
  } else {
    return { isValid: false, message: result.error.errors[0]?.message || 'Datos inválidos' };
  }
};