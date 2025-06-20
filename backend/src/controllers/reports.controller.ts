// src/controllers/reports.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../config/database';

export const getSalesReport = async (req: Request, res: Response) => {
  const { from, to } = req.query;

  const sales = await prisma.sale.findMany({
    where: {
      createdAt: {
        gte: new Date(from as string),
        lte: new Date(to as string),
      },
    },
    include: { items: true },
  });

  return res.json(sales);
};

export const getLowStockMedicines = async (_: Request, res: Response) => {
  const lowStock = await prisma.medicine.findMany({ where: { stock: { lt: 10 } } });
  return res.json(lowStock);
};

export const getExpiringMedicines = async (_: Request, res: Response) => {
  const now = new Date();
  const soon = new Date();
  soon.setMonth(soon.getMonth() + 1);

  const expiring = await prisma.medicine.findMany({
    where: {
      expirationDate: {
        gte: now,
        lte: soon,
      },
    },
  });

  return res.json(expiring);
};
