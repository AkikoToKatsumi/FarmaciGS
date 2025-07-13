"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateClientInput = void 0;
// src/validators/client.validator.ts
const validateClientInput = async (data) => {
    const { name, email, phone } = data;
    if (!name || !email || !phone) {
        return {
            isValid: false,
            message: 'Todos los campos (nombre, correo, teléfono) son requeridos',
        };
    }
    // Aquí podrías agregar validaciones más avanzadas (regex de email, etc.)
    return { isValid: true, message: '' };
};
exports.validateClientInput = validateClientInput;
