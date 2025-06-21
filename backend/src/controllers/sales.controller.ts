// src/controllers/sales.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { createAuditLog } from '../services/audit.service';
import { Parser } from 'json2csv';
import { AuthRequest } from '../types/express';

// Crear venta
export const createSale = async (req: AuthRequest, res: Response) => {
  const { clientId, items } = req.body;
  const userId = req.user.id; // <- desde middleware JWT

  try {
    let total = 0;

    for (const item of items) {
      const med = await prisma.medicine.findUnique({ where: { id: item.medicineId } });
      if (!med) return res.status(404).json({ message: `Medicamento ID ${item.medicineId} no existe` });
      if (med.stock < item.quantity) {
        return res.status(400).json({ message: `Stock insuficiente para ${med.name}` });
      }
      total += item.quantity * med.price;
    }

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

    // Actualizar stock
    for (const item of items) {
      await prisma.medicine.update({
        where: { id: item.medicineId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    await createAuditLog({
      userId,
      action: 'Venta realizada',
      details: `Venta #${sale.id} por ${total} RD$`,
    });

    res.status(201).json(sale);
  } catch (error) {
    console.error('Error en venta:', error);
    res.status(500).json({ message: 'Error al registrar la venta' });
  }
};

// Listar todas las ventas con filtros opcionales
export const getAllSales = async (req: Request, res: Response) => {
  const { clientId, userId, startDate, endDate } = req.query;

  const filters: any = {};

  if (clientId) filters.clientId = Number(clientId);
  if (userId) filters.userId = Number(userId);
  if (startDate || endDate) {
    filters.createdAt = {};
    if (startDate) filters.createdAt.gte = new Date(startDate as string);
    if (endDate) filters.createdAt.lte = new Date(endDate as string);
  }

  const sales = await prisma.sale.findMany({
    where: filters,
    include: {
      items: { include: { medicine: true } },
      user: true,
      client: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(sales);
};

// Obtener venta por ID
export const getSaleById = async (req: Request, res: Response) => {
  const sale = await prisma.sale.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      items: { include: { medicine: true } },
      user: true,
      client: true,
    },
  });

  if (!sale) return res.status(404).json({ message: 'Venta no encontrada' });
  res.json(sale);
};

export const exportSalesToCSV = async (req: Request, res: Response) => {
  const { clientId, userId, startDate, endDate } = req.query;

  const filters: any = {};
  if (clientId) filters.clientId = Number(clientId);
  if (userId) filters.userId = Number(userId);
  if (startDate || endDate) {
    filters.createdAt = {};
    if (startDate) filters.createdAt.gte = new Date(startDate as string);
    if (endDate) filters.createdAt.lte = new Date(endDate as string);
  }

  const sales = await prisma.sale.findMany({
    where: filters,
    include: {
      client: true,
      user: true,
      items: {
        include: {
          medicine: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const flatSales = sales.map((sale: { id: any; createdAt: { toISOString: () => string; }; user: { name: any; }; client: { name: any; }; total: number; items: any[]; }) => ({
    id: sale.id,
    fecha: sale.createdAt.toISOString().split('T')[0],
    usuario: sale.user.name,
    cliente: sale.client?.name ?? 'Consumidor Final',
    total: sale.total.toFixed(2),
   productos: sale.items.map((i: typeof sale.items[number]) =>`${i.medicine.name} (x${i.quantity})`).join('; ')
  }));

  const parser = new Parser({
    fields: ['id', 'fecha', 'usuario', 'cliente', 'total', 'productos'],
    delimiter: ','
  });

  const csv = parser.parse(flatSales);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=ventas.csv');
  res.status(200).send(csv);
};
