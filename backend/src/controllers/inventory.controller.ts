// src/controllers/inventory.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../config/database';

export const getMedicines = async (_: Request, res: Response) => {
  const medicines = await prisma.medicine.findMany();
  return res.json(medicines);
};

export const addMedicine = async (req: Request, res: Response) => {
  const { name, description, stock, price, expirationDate, lot } = req.body;
  const medicine = await prisma.medicine.create({ data: { name, description, stock, price, expirationDate, lot } });
  return res.status(201).json(medicine);
};

export const deleteMedicine = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.medicine.delete({ where: { id: Number(id) } });
  return res.json({ message: 'Medicamento eliminado' });
};

export const updateMedicine = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, stock, price, expirationDate, lot } = req.body;
  const medicine = await prisma.medicine.update({
    where: { id: Number(id) },
    data: { name, description, stock, price, expirationDate, lot },
  });
  return res.json({ message: 'Medicamento actualizado' });
};

export const createMedicine = async (req: Request, res: Response) => {
  // Lógica para crear un medicamento
  // Ejemplo:
  // const nuevo = await Medicine.create(req.body);
  // res.status(201).json(nuevo);
  res.status(201).json({ message: 'Medicamento creado' });
};
