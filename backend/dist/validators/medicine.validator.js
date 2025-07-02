// src/validators/medicine.validator.ts
import { z } from 'zod';
export const medicineSchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio'),
    description: z.string().optional(),
    stock: z.number().int().nonnegative(),
    price: z.number().nonnegative(),
    expirationDate: z.string().refine(date => !isNaN(Date.parse(date)), {
        message: 'Fecha inválida',
    }),
    lot: z.string().min(1, 'El lote es obligatorio'),
});
