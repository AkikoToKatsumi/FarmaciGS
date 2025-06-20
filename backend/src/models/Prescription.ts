export interface Prescription {
  id: number;
  client_id?: number;
  doctor_name?: string;
  description?: string;
  issued_date?: Date;
  created_at: Date;
  client?: Client;
}

export interface CreatePrescriptionData {
  client_id: number;
  doctor_name: string;
  description?: string;
  issued_date?: Date;
}

export interface UpdatePrescriptionData {
  client_id?: number;
  doctor_name?: string;
  description?: string;
  issued_date?: Date;
}

export interface PrescriptionResponse {
  id: number;
  client_id?: number;
  doctor_name?: string;
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

export interface PrescriptionWithClient {
  id: number;
  doctor_name?: string;
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

export interface PrescriptionStats {
  total_prescriptions: number;
  prescriptions_this_month: number;
  top_doctors: Array<{
    doctor_name: string;
    prescriptions_count: number;
  }>;
  recent_prescriptions: PrescriptionResponse[];
}

export enum PrescriptionStatus {
  PENDING = 'pending',
  FILLED = 'filled',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export interface DigitalPrescription extends Prescription {
  status: PrescriptionStatus;
  medications: Array<{
    medicine_name: string;
    dosage: string;
    quantity: number;
    instructions: string;
  }>;
  expiration_date: Date;
  filled_date?: Date;
  filled_by?: number;
  notes?: string;
}

import { Client } from './Client';