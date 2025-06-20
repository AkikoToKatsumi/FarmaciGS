import { Request, Response } from 'express';
import { prisma } from '../config/database';

export const getProviders = async (_req: Request, res: Response) => {
  const providers = await prisma.provider.findMany();
  res.json(providers);
};

export const getProviderById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const provider = await prisma.provider.findUnique({ where: { id } });

  if (!provider) return res.status(404).json({ message: 'Proveedor no encontrado' });

  res.json(provider);
};

export const createProvider = async (req: Request, res: Response) => {
  const provider = await prisma.provider.create({ data: req.body });
  res.status(201).json(provider);
};

export const updateProvider = async (req: Request, res: Response) => {
  const { id } = req.params;
  const provider = await prisma.provider.update({ where: { id }, data: req.body });
  res.json(provider);
};

export const deleteProvider = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.provider.delete({ where: { id } });
  res.status(204).send();
};
