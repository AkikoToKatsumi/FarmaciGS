"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRoleInput = void 0;
// src/validators/role.validator.ts
const zod_1 = require("zod");
const roleSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Nombre de rol requerido'),
});
const validateRoleInput = (data) => {
    const result = roleSchema.safeParse(data);
    if (result.success) {
        return { isValid: true, message: '' };
    }
    else {
        return { isValid: false, message: result.error.errors[0]?.message || 'Datos inválidos' };
    }
};
exports.validateRoleInput = validateRoleInput;
