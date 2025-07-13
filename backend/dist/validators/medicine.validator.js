"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.medicineSchema = void 0;
// src/validators/medicine.validator.ts
const zod_1 = require("zod");
exports.medicineSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'El nombre es obligatorio'),
    description: zod_1.z.string().optional(),
    stock: zod_1.z.number().int().nonnegative(),
    price: zod_1.z.number().nonnegative(),
    expirationDate: zod_1.z.string().refine(date => !isNaN(Date.parse(date)), {
        message: 'Fecha inválida',
    }),
    lot: zod_1.z.string().min(1, 'El lote es obligatorio'),
});
