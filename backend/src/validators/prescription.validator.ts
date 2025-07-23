import pool from '../config/db';

interface PrescriptionData {
  clientId: number;
  medicines: { id: number; quantity: number }[];
}

export const validatePrescriptionInput = async (data: PrescriptionData) => {
  const { clientId, medicines } = data;

  // Validar que clientId esté presente
  if (!clientId || isNaN(Number(clientId))) {
    return { isValid: false, message: 'ID del cliente es requerido y debe ser un número válido' };
  }

  // Validar que medicines esté presente y no esté vacío
  if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
    return { isValid: false, message: 'Se debe especificar al menos un medicamento' };
  }

  // Validar estructura de medicamentos
  for (const medicine of medicines) {
    if (!medicine.id || isNaN(Number(medicine.id))) {
      return { isValid: false, message: 'Todos los medicamentos deben tener un ID válido' };
    }
    if (medicine.quantity && (isNaN(Number(medicine.quantity)) || Number(medicine.quantity) <= 0)) {
      return { isValid: false, message: 'La cantidad de medicamento debe ser un número positivo' };
    }
  }

  try {
    // Verificar que el cliente existe
    const clientResult = await pool.query('SELECT id FROM clients WHERE id = $1', [clientId]);
    if (clientResult.rows.length === 0) {
      return { isValid: false, message: 'El cliente especificado no existe' };
    }

    // Verificar que todos los medicamentos existen (tabla medicine, no medicines)
    const medicineIds = medicines.map(m => m.id);
    const medicineResult = await pool.query(
      'SELECT id FROM medicine WHERE id = ANY($1)',
      [medicineIds]
    );

    if (medicineResult.rows.length !== medicineIds.length) {
      const foundIds = medicineResult.rows.map(row => row.id);
      const missingIds = medicineIds.filter(id => !foundIds.includes(id));
      return { 
        isValid: false, 
        message: `Los siguientes medicamentos no existen: ${missingIds.join(', ')}` 
      };
    }

    // Verificar stock disponible para cada medicamento
    for (const med of medicines) {
      const stockResult = await pool.query(
        'SELECT stock FROM medicine WHERE id = $1',
        [med.id]
      );
      
      if (stockResult.rows.length > 0) {
        const availableStock = stockResult.rows[0].stock;
        if (availableStock < med.quantity) {
          const medicineNameResult = await pool.query(
            'SELECT name FROM medicine WHERE id = $1',
            [med.id]
          );
          const medicineName = medicineNameResult.rows[0]?.name || `ID ${med.id}`;
          return { 
            isValid: false, 
            message: `Stock insuficiente para ${medicineName}. Disponible: ${availableStock}, Solicitado: ${med.quantity}` 
          };
        }
      }
    }

    return { isValid: true, message: 'Validación exitosa' };
  } catch (error) {
    console.error('Error en validación:', error);
    return { isValid: false, message: 'Error interno de validación' };
  }
};