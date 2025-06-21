// src/controllers/sales.controller.ts
// Importa los tipos de Request y Response de Express
import { Request, Response } from 'express';
// Importa la instancia de Prisma para interactuar con la base de datos
import { prisma } from '../config/database';
// Importa el servicio para crear logs de auditoría
import { createAuditLog } from '../services/audit.service';
// Importa el parser para exportar datos a CSV
import { Parser } from 'json2csv';
// Importa el tipo AuthRequest para peticiones autenticadas
import { AuthRequest } from '../types/express';
// Importa el validador para ventas
import { validateSaleInput } from '../validators/sale.validator';

// Crear venta
export const createSale = async (req: AuthRequest, res: Response) => {
  // Extrae los datos necesarios del cuerpo de la petición
  const { clientId, items } = req.body;
  // Obtiene el ID del usuario autenticado
  const userId = req.user.id; // <- desde middleware JWT

  // Valida los datos de la venta
  const validation = await validateSaleInput({ userId, clientId, items });
  if (!validation.isValid) {
    // Si la validación falla, responde con error 400
    return res.status(400).json({ message: validation.message });
  }

  try {
    let total = 0;

    // Calcula el total y verifica stock de cada medicamento
    for (const item of items) {
      const med = await prisma.medicine.findUnique({ where: { id: item.medicineId } });
      if (!med) return res.status(404).json({ message: `Medicamento ID ${item.medicineId} no existe` });
      if (med.stock < item.quantity) {
        return res.status(400).json({ message: `Stock insuficiente para ${med.name}` });
      }
      total += item.quantity * med.price;
    }

    // Crea la venta en la base de datos
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

    // Actualiza el stock de los medicamentos vendidos
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

    // Crea un registro de auditoría de la venta
    await createAuditLog({
      userId,
      action: 'Venta realizada',
      details: `Venta #${sale.id} por ${total} RD$`,
    });

    // Devuelve la venta creada
    res.status(201).json(sale);
  } catch (error) {
    // Si ocurre un error, lo muestra en consola y responde con error 500
    console.error('Error en venta:', error);
    res.status(500).json({ message: 'Error al registrar la venta' });
  }
};

// Listar todas las ventas con filtros opcionales
export const getAllSales = async (req: Request, res: Response) => {
  // Extrae los filtros de la query
  const { clientId, userId, startDate, endDate } = req.query;

  const filters: any = {};

  if (clientId) filters.clientId = Number(clientId);
  if (userId) filters.userId = Number(userId);
  if (startDate || endDate) {
    filters.createdAt = {};
    if (startDate) filters.createdAt.gte = new Date(startDate as string);
    if (endDate) filters.createdAt.lte = new Date(endDate as string);
  }

  // Busca las ventas según los filtros
  const sales = await prisma.sale.findMany({
    where: filters,
    include: {
      items: { include: { medicine: true } },
      user: true,
      client: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Devuelve la lista de ventas
  res.json(sales);
};

// Obtener venta por ID
export const getSaleById = async (req: Request, res: Response) => {
  // Busca la venta por su ID e incluye usuario, cliente y medicamentos
  const sale = await prisma.sale.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      items: { include: { medicine: true } },
      user: true,
      client: true,
    },
  });

  // Si no existe, responde con error 404
  if (!sale) return res.status(404).json({ message: 'Venta no encontrada' });
  // Devuelve la venta encontrada
  res.json(sale);
};

// Exporta las ventas a un archivo CSV
export const exportSalesToCSV = async (req: Request, res: Response) => {
  // Extrae los filtros de la query
  const { clientId, userId, startDate, endDate } = req.query;

  const filters: any = {};
  if (clientId) filters.clientId = Number(clientId);
  if (userId) filters.userId = Number(userId);
  if (startDate || endDate) {
    filters.createdAt = {};
    if (startDate) filters.createdAt.gte = new Date(startDate as string);
    if (endDate) filters.createdAt.lte = new Date(endDate as string);
  }

  // Busca las ventas según los filtros e incluye datos relacionados
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

  // Prepara los datos en formato plano para el CSV
  const flatSales = sales.map((sale: { id: any; createdAt: { toISOString: () => string; }; user: { name: any; }; client: { name: any; }; total: number; items: any[]; }) => ({
    id: sale.id,
    fecha: sale.createdAt.toISOString().split('T')[0],
    usuario: sale.user.name,
    cliente: sale.client?.name ?? 'Consumidor Final',
    total: sale.total.toFixed(2),
   productos: sale.items.map((i: typeof sale.items[number]) =>`${i.medicine.name} (x${i.quantity})`).join('; ')
  }));

  // Crea el parser para CSV
  const parser = new Parser({
    fields: ['id', 'fecha', 'usuario', 'cliente', 'total', 'productos'],
    delimiter: ','
  });

  // Parsea los datos a formato CSV
  const csv = parser.parse(flatSales);

  // Configura los headers para descarga de archivo
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=ventas.csv');
  // Envía el archivo CSV
  res.status(200).send(csv);
};
