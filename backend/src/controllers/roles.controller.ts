// src/controllers/roles.controller.ts

import { Request, Response } from 'express';
import { prisma } from '../config/database';

export const getRoles = async (_: Request, res: Response) => {
  try {
    const roles = await prisma.role.findMany({
      include: { permissions: true },
    });
    return res.json(roles);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener roles', error });
  }
};

export const createRole = async (req: Request, res: Response) => {
  const { name, permissions } = req.body;

  try {
    const role = await prisma.role.create({
      data: {
        name,
        permissions: {
          create: permissions.map((action: string) => ({ action })),
        },
      },
      include: { permissions: true },
    });

    return res.status(201).json(role);
  } catch (error) {
    return res.status(500).json({ message: 'Error al crear el rol', error });
  }
};

export const updateRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, permissions } = req.body;

  try {
    // Primero, elimina las viejas
    await prisma.permission.deleteMany({
      where: { roleId: parseInt(id) },
    });

    const role = await prisma.role.update({
      where: { id: parseInt(id) },
      data: {
        name,
        permissions: {
          create: permissions.map((action: string) => ({ action })),
        },
      },
      include: { permissions: true },
    });

    return res.json(role);
  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar el rol', error });
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.permission.deleteMany({ where: { roleId: parseInt(id) } });
    await prisma.role.delete({ where: { id: parseInt(id) } });
    return res.json({ message: 'Rol eliminado correctamente' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al eliminar el rol', error });
  }
};
