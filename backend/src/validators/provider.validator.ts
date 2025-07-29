// src/validators/provider.validator.ts
interface ProviderInput {
  name: string;
  email: string;
  phone: string;
  taxId: string;
}

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const validateProviderInput = async (input: ProviderInput): Promise<ValidationResult> => {
  const { name, email, phone, taxId } = input;

  // Validar nombre
  if (!name || typeof name !== 'string') {
    return { isValid: false, message: 'El nombre es requerido' };
  }
  if (name.trim().length < 2) {
    return { isValid: false, message: 'El nombre debe tener al menos 2 caracteres' };
  }
  if (name.trim().length > 100) {
    return { isValid: false, message: 'El nombre no puede tener más de 100 caracteres' };
  }

  // Validar email
  if (!email || typeof email !== 'string') {
    return { isValid: false, message: 'El email es requerido' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'El formato del email no es válido' };
  }
  if (email.length > 100) {
    return { isValid: false, message: 'El email no puede tener más de 100 caracteres' };
  }

  // Validar teléfono
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, message: 'El teléfono es requerido' };
  }
  const phoneRegex = /^[+]?[\d\s\-\(\)]{7,20}$/;
  if (!phoneRegex.test(phone)) {
    return { isValid: false, message: 'El formato del teléfono no es válido' };
  }

  // Validar Tax ID
  if (!taxId || typeof taxId !== 'string') {
    return { isValid: false, message: 'El número de identificación fiscal es requerido' };
  }
  if (taxId.trim().length < 5) {
    return { isValid: false, message: 'El número de identificación fiscal debe tener al menos 5 caracteres' };
  }
  if (taxId.trim().length > 50) {
    return { isValid: false, message: 'El número de identificación fiscal no puede tener más de 50 caracteres' };
  }

  return { isValid: true };
};