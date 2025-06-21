// src/controllers/clients.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { validateClientInput } from '../validators/client.validator';
import { validatePrescriptionInput } from '../validators/prescription.validator';

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
  try {
    const { name, email, phone } = req.body;
    const validation = await validateClientInput({ name, email, phone });
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
    }
    const client = await prisma.client.create({ data: { name, email, phone } });
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear cliente' });
  }
};

export const updateClient = async (req: Request, res: Response) => {
  try {
    const clientId = Number(req.params.id);
    const { name, email, phone } = req.body;
    const validation = await validateClientInput({ name, email, phone, id: clientId });
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
    }
    const client = await prisma.client.update({
      where: { id: clientId },
      data: { name, email, phone }
    });
    res.json(client);
  } catch (error) {
    res.status(404).json({ message: 'Cliente no encontrado o error al actualizar' });
  }
};

export const deleteClient = async (req: Request, res: Response) => {
  try {
    const clientId = Number(req.params.id);
    await prisma.client.delete({ where: { id: clientId } });
    res.json({ message: 'Cliente eliminado' });
  } catch (error) {
    res.status(404).json({ message: 'Cliente no encontrado o error al eliminar' });
  }
};

export const getClientPrescriptions = async (req: Request, res: Response) => {
  // Lógica para obtener recetas de un cliente
  res.json({ message: 'Recetas del cliente' });
};

export const addPrescription = async (req: Request, res: Response) => {
  const clientId = Number(req.params.id);
  const { medicineIds } = req.body;

  const validation = await validatePrescriptionInput({
    clientId,
    medicineIds,
  });

  if (!validation.isValid) {
    return res.status(400).json({ message: validation.message });
  }

  // Lógica para agregar una receta a un cliente
  res.status(201).json({ message: 'Receta agregada' });
};
