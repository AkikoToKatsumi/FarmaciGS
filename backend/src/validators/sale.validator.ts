
// src/validators/sale.validator.ts
import { z } from 'zod';

export const saleSchema = z.object({
  clientId: z.number().int(),
  total: z.number().nonnegative(),
  details: z.array(z.object({
    medicineId: z.number().int(),
    quantity: z.number().int().positive(),
    price: z.number().nonnegative(),
  })).min(1, 'Debe incluir al menos un producto'),
});
