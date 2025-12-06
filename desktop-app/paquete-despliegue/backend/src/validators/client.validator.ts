// src/validators/client.validator.ts
import pool from '../config/db';

export const validateClientInput = async (data: any) => {
  const { name, email, phone, cedula, rnc, id } = data;

  if (!name || !email || !phone) {
    return {
      isValid: false,
      message: 'Todos los campos (nombre, correo, teléfono) son requeridos',
    };
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      message: 'El formato del email no es válido',
    };
  }

  // Validar formato de teléfono
  const phoneRegex = /^[+]?[\d\s\-\(\)]{7,20}$/;
  if (!phoneRegex.test(phone)) {
    return {
      isValid: false,
      message: 'El formato del teléfono no es válido',
    };
  }

  try {
    // Verificar duplicados de email
    let emailQuery = 'SELECT id FROM clients WHERE LOWER(email) = LOWER($1)';
    let emailParams = [email];
    
    if (id) { // Si estamos actualizando, excluir el cliente actual
      emailQuery += ' AND id != $2';
      emailParams.push(id);
    }
    
    const emailCheck = await pool.query(emailQuery, emailParams);
    if (emailCheck.rows.length > 0) {
      return {
        isValid: false,
        message: 'Ya existe un cliente con ese correo electrónico',
      };
    }

    // Verificar duplicados de teléfono
    let phoneQuery = 'SELECT id FROM clients WHERE phone = $1';
    let phoneParams = [phone];
    
    if (id) {
      phoneQuery += ' AND id != $2';
      phoneParams.push(id);
    }
    
    const phoneCheck = await pool.query(phoneQuery, phoneParams);
    if (phoneCheck.rows.length > 0) {
      return {
        isValid: false,
        message: 'Ya existe un cliente con ese número de teléfono',
      };
    }

    // Verificar duplicados de cédula (solo si se proporciona)
    if (cedula && cedula.trim() !== '') {
      let cedulaQuery = 'SELECT id FROM clients WHERE cedula = $1';
      let cedulaParams = [cedula];
      
      if (id) {
        cedulaQuery += ' AND id != $2';
        cedulaParams.push(id);
      }
      
      const cedulaCheck = await pool.query(cedulaQuery, cedulaParams);
      if (cedulaCheck.rows.length > 0) {
        return {
          isValid: false,
          message: 'Ya existe un cliente con esa cédula',
        };
      }
    }

    // Verificar duplicados de RNC (solo si se proporciona)
    if (rnc && rnc.trim() !== '') {
      let rncQuery = 'SELECT id FROM clients WHERE rnc = $1';
      let rncParams = [rnc];
      
      if (id) {
        rncQuery += ' AND id != $2';
        rncParams.push(id);
      }
      
      const rncCheck = await pool.query(rncQuery, rncParams);
      if (rncCheck.rows.length > 0) {
        return {
          isValid: false,
          message: 'Ya existe un cliente con ese RNC',
        };
      }
    }

    return { isValid: true, message: '' };
  } catch (error) {
    console.error('Error validating client input:', error);
    return {
      isValid: false,
      message: 'Error interno del servidor al validar datos',
    };
  }
};
