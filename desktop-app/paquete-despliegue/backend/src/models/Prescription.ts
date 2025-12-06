// Definición de la interfaz para una receta médica
export interface Prescription {
  id: number; // Identificador único de la receta
  client_id?: number; // ID del cliente asociado (opcional)
 
  description?: string; // Descripción o notas de la receta (opcional)
  issued_date?: Date; // Fecha de emisión de la receta (opcional)
  created_at: Date; // Fecha de creación del registro
  client?: Client; // Objeto cliente asociado (opcional)
}

// Datos requeridos para crear una receta
export interface CreatePrescriptionData {
  client_id: number; // ID del cliente
  
  description?: string; // Descripción (opcional)
  issued_date?: Date; // Fecha de emisión (opcional)
}

// Datos permitidos para actualizar una receta
export interface UpdatePrescriptionData {
  client_id?: number; // ID del cliente (opcional)
 
  description?: string; // Descripción (opcional)
  issued_date?: Date; // Fecha de emisión (opcional)
}

// Respuesta de receta con información adicional
export interface PrescriptionResponse {
  id: number;
  client_id?: number;

  description?: string;
  issued_date?: Date;
  created_at: Date;
  client?: {
    id: number;
    name: string;
    phone?: string;
    email?: string;
  };
}

// Receta con información completa del cliente
export interface PrescriptionWithClient {
  id: number;
 
  description?: string;
  issued_date?: Date;
  created_at: Date;
  client: {
    id: number;
    name: string;
    phone?: string;
    email?: string;
  };
}

// Estadísticas generales de recetas
export interface PrescriptionStats {
  total_prescriptions: number; // Total de recetas
  prescriptions_this_month: number; // Recetas emitidas este mes
  
    prescriptions_count: number; // Cantidad de recetas emitidas
  };
  const responses: PrescriptionResponse[] = []; // ✅ correcto
 // Recetas recientes


// Enum para el estado de la receta
export enum PrescriptionStatus {
  PENDING = 'pending', // Pendiente
  FILLED = 'filled', // Surtida
  EXPIRED = 'expired', // Expirada
  CANCELLED = 'cancelled' // Cancelada
}

// Receta digital con detalles adicionales
export interface DigitalPrescription extends Prescription {
  status: PrescriptionStatus; // Estado de la receta
  medications: Array<{
    medicine_name: string; // Nombre del medicamento
    dosage: string; // Dosis
    quantity: number; // Cantidad
    instructions: string; // Instrucciones
  }>;
  expiration_date: Date; // Fecha de expiración de la receta
  filled_date?: Date; // Fecha en que fue surtida (opcional)
  filled_by?: number; // ID del usuario que la surtió (opcional)
  notes?: string; // Notas adicionales (opcional)
}

// Importa la interfaz de cliente para asociar con la receta
import { Client } from './Client';