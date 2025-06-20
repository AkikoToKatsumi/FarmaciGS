// src/controllers/clients.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../config/database';

export const getClients = async (_: Request, res: Response) => {
  const clients = await prisma.client.findMany({ include: { prescriptions: true } });
  return res.json(clients);
};

export const addClient = async (req: Request, res: Response) => {
  const { name, email, phone } = req.body;
  const client = await prisma.client.create({ data: { name, email, phone } });
  return res.status(201).json(client);
};

export const createClient = async (req: Request, res: Response) => {
  // Lógica para crear cliente
  res.status(201).json({ message: 'Cliente creado' });
};

export const getClientPrescriptions = async (req: Request, res: Response) => {
  // Lógica para obtener recetas de un cliente
  res.json({ message: 'Recetas del cliente' });
};

export const addPrescription = async (req: Request, res: Response) => {
  // Lógica para agregar una receta a un cliente
  res.status(201).json({ message: 'Receta agregada' });
};
