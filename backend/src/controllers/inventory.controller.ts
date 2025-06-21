// src/controllers/inventory.controller.ts
// Importa los tipos de Request y Response de Express
import { Request, Response } from 'express';
// Importa la instancia de Prisma para interactuar con la base de datos
import { prisma } from '../config/database';

// Función para validar la entrada de los medicamentos (ejemplo simple)
const validateMedicineInput = async (data: any) => {
  const { name, lot } = data;
  // Verifica que el nombre y el lote estén presentes
  if (!name || !lot) {
    return { isValid: false, message: 'Nombre y lote son requeridos' };
  }
  // Otras validaciones según sea necesario
  return { isValid: true, message: '' };
};

// Obtener todos los medicamentos
export const getAllMedicines = async (_req: Request, res: Response) => {
  // Busca todos los medicamentos en la base de datos
  const medicines = await prisma.medicine.findMany();
  // Devuelve la lista de medicamentos
  res.json(medicines);
};

// Obtener un medicamento por ID
export const getMedicineById = async (req: Request, res: Response) => {
  const { id } = req.params;
  // Busca el medicamento por su ID
  const medicine = await prisma.medicine.findUnique({ where: { id: Number(id) } });
  // Si no existe, responde con error 404
  if (!medicine) return res.status(404).json({ message: 'No encontrado' });
  // Devuelve el medicamento encontrado
  res.json(medicine);
};

// Crear medicamento
export const createMedicine = async (req: Request, res: Response) => {
  const { name, description, stock, price, expirationDate, lot } = req.body;

  // Valida los datos del medicamento
  const validation = await validateMedicineInput({ name, lot });
  if (!validation.isValid) {
    // Si la validación falla, responde con error 400
    return res.status(400).json({ message: validation.message });
  }

  // Crea el medicamento en la base de datos
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

  // Devuelve el medicamento creado
  res.status(201).json(newMed);
};

// Actualizar medicamento
export const updateMedicine = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;

  try {
    // Actualiza el medicamento en la base de datos
    const updated = await prisma.medicine.update({
      where: { id: Number(id) },
      data,
    });
    // Devuelve el medicamento actualizado
    res.json(updated);
  } catch {
    // Si ocurre un error, responde con error 404
    res.status(404).json({ message: 'Medicamento no encontrado' });
  }
};

// Eliminar medicamento
export const deleteMedicine = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Elimina el medicamento de la base de datos
    await prisma.medicine.delete({ where: { id: Number(id) } });
    // Devuelve mensaje de éxito
    res.json({ message: 'Eliminado correctamente' });
  } catch {
    // Si ocurre un error, responde con error 404
    res.status(404).json({ message: 'No encontrado' });
  }
};

// Medicamentos con alertas (bajo stock o próximos a vencer)
export const getAlerts = async (_req: Request, res: Response) => {
  // Obtiene la fecha actual
  const now = new Date();
  // Define el umbral de stock bajo
  const threshold = 10;

  // Busca medicamentos con bajo stock o próximos a vencer (menos de 7 días)
  const medicines = await prisma.medicine.findMany({
    where: {
      OR: [
        { stock: { lt: threshold } },
        { expirationDate: { lt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) } }, // menos de 7 días
      ],
    },
  });

  // Devuelve la lista de medicamentos en alerta
  res.json(medicines);
};
