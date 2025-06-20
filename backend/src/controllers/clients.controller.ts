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
