"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saleSchema = void 0;
// src/validators/sale.validator.ts
const zod_1 = require("zod");
exports.saleSchema = zod_1.z.object({
    clientId: zod_1.z.number().int(),
    total: zod_1.z.number().nonnegative(),
    details: zod_1.z.array(zod_1.z.object({
        medicineId: zod_1.z.number().int(),
        quantity: zod_1.z.number().int().positive(),
        price: zod_1.z.number().nonnegative(),
    })).min(1, 'Debe incluir al menos un producto'),
});
