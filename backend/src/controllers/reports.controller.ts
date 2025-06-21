// src/controllers/reports.controller.ts
// Importa los tipos de Request y Response de Express
import { Request, Response } from 'express';
// Importa la instancia de Prisma para interactuar con la base de datos
import { prisma } from '../config/database';

// Obtiene el reporte de ventas en un rango de fechas
export const getSalesReport = async (req: Request, res: Response) => {
  // Extrae las fechas de inicio y fin del query string
  const { from, to } = req.query;

  // Busca las ventas en el rango de fechas especificado
  const sales = await prisma.sale.findMany({
    where: {
      createdAt: {
        gte: new Date(from as string),
        lte: new Date(to as string),
      },
    },
    include: { items: true }, // Incluye los items de cada venta
  });

  // Devuelve el reporte de ventas
  return res.json(sales);
};

// Obtiene los medicamentos con bajo stock (menos de 10 unidades)
export const getLowStock = async (req: Request, res: Response) => {
  // Busca medicamentos cuyo stock sea menor a 10
  const lowStock = await prisma.medicine.findMany({ where: { stock: { lt: 10 } } });
  // Devuelve la lista de medicamentos con bajo stock
  return res.json(lowStock);
};

// Obtiene los medicamentos que están próximos a vencer (en el próximo mes)
export const getExpiringMedicines = async (_: Request, res: Response) => {
  // Obtiene la fecha actual
  const now = new Date();
  // Calcula la fecha dentro de un mes
  const soon = new Date();
  soon.setMonth(soon.getMonth() + 1);

  // Busca medicamentos cuya fecha de vencimiento esté entre hoy y dentro de un mes
  const expiring = await prisma.medicine.findMany({
    where: {
      expirationDate: {
        gte: now,
        lte: soon,
      },
    },
  });

  // Devuelve la lista de medicamentos próximos a vencer
  return res.json(expiring);
};
