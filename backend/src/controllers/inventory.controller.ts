// src/controllers/inventory.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../config/database';

// Función para validar la entrada de los medicamentos
const validateMedicineInput = async (data: any) => {
  const { name, lot } = data;
  if (!name || !lot) {
    return { isValid: false, message: 'Nombre y lote son requeridos' };
  }
  // Otras validaciones según sea necesario
  return { isValid: true, message: '' };
};

// Obtener todos los medicamentos
export const getAllMedicines = async (_req: Request, res: Response) => {
  const medicines = await prisma.medicine.findMany();
  res.json(medicines);
};

// Obtener un medicamento por ID
export const getMedicineById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const medicine = await prisma.medicine.findUnique({ where: { id: Number(id) } });
  if (!medicine) return res.status(404).json({ message: 'No encontrado' });
  res.json(medicine);
};

// Crear medicamento
export const createMedicine = async (req: Request, res: Response) => {
  const { name, description, stock, price, expirationDate, lot } = req.body;

  const validation = await validateMedicineInput({ name, lot });
  if (!validation.isValid) {
    return res.status(400).json({ message: validation.message });
  }

  const newMed = await prisma.medicine.create({
    data: {
      name,
      description,
      stock,
      price,
      expirationDate: new Date(expirationDate),
      lot,
    },
  });

  res.status(201).json(newMed);
};

// Actualizar medicamento
export const updateMedicine = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const updated = await prisma.medicine.update({
      where: { id: Number(id) },
      data,
    });
    res.json(updated);
  } catch {
    res.status(404).json({ message: 'Medicamento no encontrado' });
  }
};

// Eliminar medicamento
export const deleteMedicine = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.medicine.delete({ where: { id: Number(id) } });
    res.json({ message: 'Eliminado correctamente' });
  } catch {
    res.status(404).json({ message: 'No encontrado' });
  }
};

// Medicamentos con alertas (bajo stock o próximos a vencer)
export const getAlerts = async (_req: Request, res: Response) => {
  const now = new Date();
  const threshold = 10;

  const medicines = await prisma.medicine.findMany({
    where: {
      OR: [
        { stock: { lt: threshold } },
        { expirationDate: { lt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) } }, // menos de 7 días
      ],
    },
  });

  res.json(medicines);
};
