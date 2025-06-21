// src/controllers/roles.controller.ts
// Importa los tipos de Request y Response de Express
import { Request, Response } from 'express';
// Importa la instancia de Prisma para interactuar con la base de datos
import { prisma } from '../config/database';
// Importa el validador para roles
import { validateRoleInput } from '../validators/role.validator';

// Obtiene todos los roles, incluyendo sus permisos
export const getRoles = async (_: Request, res: Response) => {
  try {
    // Busca todos los roles e incluye sus permisos
    const roles = await prisma.role.findMany({
      include: { permissions: true },
    });
    // Devuelve la lista de roles
    return res.json(roles);
  } catch (error) {
    // Si ocurre un error, responde con error 500
    return res.status(500).json({ message: 'Error al obtener roles', error });
  }
};

// Crea un nuevo rol con validación y verificación de nombre duplicado
export const createRole = async (req: Request, res: Response) => {
  // Valida los datos del rol
  const validation = await validateRoleInput(req.body);

  if (!validation.isValid) {
    // Si la validación falla, responde con error 400
    return res.status(400).json({ message: validation.message });
  }

  const { name, permissions } = req.body;

  // Verifica si ya existe un rol con ese nombre
  const existingRole = await prisma.role.findUnique({
    where: { name },
  });

  if (existingRole) {
    // Si ya existe, responde con error 400
    return res.status(400).json({
      message: 'El nombre del rol ya está en uso.',
    });
  }

  try {
    // Crea el rol y sus permisos asociados
    const role = await prisma.role.create({
      data: {
        name,
        permissions: {
          create: permissions.map((action: string) => ({ action })),
        },
      },
      include: { permissions: true },
    });

    // Devuelve el rol creado
    return res.status(201).json(role);
  } catch (error) {
    // Si ocurre un error, responde con error 500
    return res.status(500).json({ message: 'Error al crear el rol', error });
  }
};

// Actualiza un rol existente y sus permisos
export const updateRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, permissions } = req.body;

  try {
    // Primero, elimina los permisos antiguos del rol
    await prisma.permission.deleteMany({
      where: { roleId: parseInt(id) },
    });

    // Actualiza el rol y crea los nuevos permisos
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

    // Devuelve el rol actualizado
    return res.json(role);
  } catch (error) {
    // Si ocurre un error, responde con error 500
    return res.status(500).json({ message: 'Error al actualizar el rol', error });
  }
};

// Elimina un rol y sus permisos asociados
export const deleteRole = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Elimina todos los permisos asociados al rol
    await prisma.permission.deleteMany({ where: { roleId: parseInt(id) } });
    // Elimina el rol
    await prisma.role.delete({ where: { id: parseInt(id) } });
    // Devuelve mensaje de éxito
    return res.json({ message: 'Rol eliminado correctamente' });
  } catch (error) {
    // Si ocurre un error, responde con error 500
    return res.status(500).json({ message: 'Error al eliminar el rol', error });
  }
};
