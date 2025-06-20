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
