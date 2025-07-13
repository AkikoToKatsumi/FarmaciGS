"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePrescriptionInput = exports.prescriptionSchema = void 0;
// src/validators/prescription.validator.ts
const zod_1 = require("zod");
exports.prescriptionSchema = zod_1.z.object({
    clientId: zod_1.z.number().int().nonnegative(),
    doctorName: zod_1.z.string().min(1, 'Nombre del doctor requerido'),
    medicineIds: zod_1.z.array(zod_1.z.number().int().nonnegative()).min(1, 'Debe incluir al menos un medicamento'),
    notes: zod_1.z.string().optional(),
});
const validatePrescriptionInput = (data) => {
    const result = exports.prescriptionSchema.safeParse(data);
    if (result.success) {
        return { isValid: true, message: 'OK' };
    }
    else {
        return { isValid: false, message: result.error.errors[0]?.message || 'Datos inválidos' };
    }
};
exports.validatePrescriptionInput = validatePrescriptionInput;
