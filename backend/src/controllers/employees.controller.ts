// src/controllers/employees.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import bcrypt from 'bcryptjs';

export const createEmployee = async (req: Request, res: Response) => {
  const { name, email, password, roleId } = req.body;

  // Verifica si ya existe un usuario con ese correo
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res
      .status(400)
      .json({ message: 'Ya existe un empleado con ese correo electrónico.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newEmployee = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      roleId,
    },
  });

  res.status(201).json(newEmployee);
};

export const getEmployees = async (_: Request, res: Response) => {
  const employees = await prisma.user.findMany({ include: { role: true } });
  return res.json(employees);
};

export const getAllUsers = async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    include: { role: true },
  });
  res.json(users);
};

export const getUserById = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(req.params.id) },
    include: { role: true },
  });

  if (!user)
    return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json(user);
};

export const createUser = async (req: Request, res: Response) => {
  const { name, email, password, roleId } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      roleId,
    },
  });

  res.status(201).json(newUser);
};

export const updateUser = async (req: Request, res: Response) => {
  const { name, email, roleId } = req.body;

  if (email) {
    const existingEmail = await prisma.user.findUnique({ where: { email } });

    if (existingEmail && existingEmail.id !== Number(req.params.id)) {
      return res.status(400).json({ message: 'Ese correo ya pertenece a otro empleado.' });
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: Number(req.params.id) },
    data: { name, email, roleId },
  });

  res.json(updatedUser);
};

export const deleteUser = async (req: Request, res: Response) => {
  await prisma.user.delete({
    where: { id: Number(req.params.id) },
  });

  res.json({ message: 'Usuario eliminado correctamente' });
};
