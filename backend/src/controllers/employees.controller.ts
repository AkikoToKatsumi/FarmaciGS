// src/controllers/employees.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import bcrypt from 'bcryptjs';

export const createEmployee = async (req: Request, res: Response) => {
  const { name, email, password, roleId } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, roleId },
  });

  return res.status(201).json(user);
};

export const getEmployees = async (_: Request, res: Response) => {
  const employees = await prisma.user.findMany({ include: { role: true } });
  return res.json(employees);
};
