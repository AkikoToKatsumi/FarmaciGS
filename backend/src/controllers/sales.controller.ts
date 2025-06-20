// src/controllers/sales.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../config/database';

export const createSale = async (req: Request, res: Response) => {
  const { userId, clientId, items } = req.body;

  const total = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

  const sale = await prisma.sale.create({
    data: {
      userId,
      clientId,
      total,
      items: {
        create: items.map((item: any) => ({
          medicineId: item.medicineId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
    include: { items: true },
  });

  return res.status(201).json(sale);
};

export const getSales = async (req: Request, res: Response) => {
  // Lógica para obtener ventas
  // Ejemplo:
  // const ventas = await Sale.findAll();
  // return res.json(ventas);
  res.json({ message: 'Listado de ventas' });
};
