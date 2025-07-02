// src/validators/client.validator.ts
export const validateClientInput = async (data: any) => {
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
