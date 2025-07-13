"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEmployeeInput = exports.employeeSchema = void 0;
// src/validators/employee.validator.ts
const zod_1 = require("zod");
exports.employeeSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'El nombre es obligatorio'),
    email: zod_1.z.string().email('Correo electrónico inválido'),
    password: zod_1.z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    roleId: zod_1.z.number().int('El ID de rol debe ser un número'),
});
const validateEmployeeInput = async (data) => {
    const result = exports.employeeSchema.safeParse(data);
    return {
        isValid: result.success,
        message: result.success ? '' : JSON.stringify(result.error.format())
    };
};
exports.validateEmployeeInput = validateEmployeeInput;
