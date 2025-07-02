// src/validators/prescription.validator.ts
import { z } from 'zod';
export const prescriptionSchema = z.object({
    clientId: z.number().int().nonnegative(),
    doctorName: z.string().min(1, 'Nombre del doctor requerido'),
    medicineIds: z.array(z.number().int().nonnegative()).min(1, 'Debe incluir al menos un medicamento'),
    notes: z.string().optional(),
});
export const validatePrescriptionInput = (data) => {
    const result = prescriptionSchema.safeParse(data);
    if (result.success) {
        return { isValid: true, message: 'OK' };
    }
    else {
        return { isValid: false, message: result.error.errors[0]?.message || 'Datos inválidos' };
    }
};
