// Importa los tipos de Request y Response de Express
import { Request, Response } from 'express';
// Importa la instancia de Prisma para interactuar con la base de datos
import { prisma } from '../config/database';
// Importa el validador para proveedores
import { validateProviderInput } from '../validators/provider.validator';

// Obtiene todos los proveedores de la base de datos
export const getProviders = async (_req: Request, res: Response) => {
  // Busca todos los proveedores
  const providers = await prisma.provider.findMany();
  // Devuelve la lista de proveedores en formato JSON
  res.json(providers);
};

// Obtiene un proveedor por su ID
export const getProviderById = async (req: Request, res: Response) => {
  const { id } = req.params;
  // Busca el proveedor por ID
  const provider = await prisma.provider.findUnique({ where: { id } });

  // Si no existe, responde con error 404
  if (!provider) return res.status(404).json({ message: 'Proveedor no encontrado' });

  // Devuelve el proveedor encontrado
  res.json(provider);
};

// Crea un nuevo proveedor
export const createProvider = async (req: Request, res: Response) => {
  // Extrae los datos del cuerpo de la petición
  const { name, email, phone, taxId } = req.body;
  // Valida los datos del proveedor
  const validation = await validateProviderInput({ name, email, phone, taxId });
  if (!validation.isValid) {
    // Si la validación falla, responde con error 400 y el mensaje correspondiente
    return res.status(400).json({ message: validation.message });
  }
  // Crea el proveedor en la base de datos
  const provider = await prisma.provider.create({ data: req.body });
  // Devuelve el proveedor creado con estado 201
  res.status(201).json(provider);
};

// Actualiza un proveedor existente
export const updateProvider = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, phone, taxId } = req.body;
  // Valida los datos antes de actualizar
  const validation = await validateProviderInput({ name, email, phone, taxId, id });
  if (!validation.isValid) {
    // Si la validación falla, responde con error 400
    return res.status(400).json({ message: validation.message });
  }
  // Actualiza el proveedor en la base de datos
  const provider = await prisma.provider.update({ where: { id }, data: req.body });
  // Devuelve el proveedor actualizado
  res.json(provider);
};

// Elimina un proveedor por su ID
export const deleteProvider = async (req: Request, res: Response) => {
  const { id } = req.params;
  // Elimina el proveedor de la base de datos
  await prisma.provider.delete({ where: { id } });
  // Responde con estado 204 (sin contenido)
  res.status(204).send();
};
