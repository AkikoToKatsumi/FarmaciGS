"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateProviderInput = exports.validatePrescriptionInput = void 0;
// src/validators/prescription.validator.ts
const validatePrescriptionInput = async (data) => {
    const { clientId, medicines } = data;
    if (!clientId || !Array.isArray(medicines) || medicines.length === 0) {
        return {
            isValid: false,
            message: 'Debe proporcionar un cliente y al menos un medicamento',
        };
    }
    return { isValid: true, message: '' };
};
exports.validatePrescriptionInput = validatePrescriptionInput;
const validateProviderInput = (data) => {
    // lógica de validación
    return { isValid: true, message: 'OK' };
};
exports.validateProviderInput = validateProviderInput;
