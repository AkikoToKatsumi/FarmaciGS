// src/controllers/employees.controller.ts
// Importa los tipos de Request y Response de Express
import { Request, Response } from 'express';
// Importa la instancia de Prisma para interactuar con la base de datos
import { prisma } from '../config/database';
// Importa bcryptjs para hashear contraseñas
import bcrypt from 'bcryptjs';
// Importa el validador para empleados
import { validateEmployeeInput } from '../validators/employee.validator';

// Crea un nuevo empleado con validación y verificación de email duplicado
export const createEmployee = async (req: Request, res: Response) => {
  // Valida los datos del empleado
  const validation = await validateEmployeeInput(req.body);

  if (!validation.isValid) {
    // Si la validación falla, responde con error 400
    return res.status(400).json({ message: validation.message });
  }

  const { name, email, password, roleId } = req.body;

  // Verifica si ya existe un usuario con ese correo
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    // Si ya existe, responde con error 400
    return res
      .status(400)
      .json({ message: 'Ya existe un empleado con ese correo electrónico.' });
  }

  // Hashea la contraseña antes de guardar
  const hashedPassword = await bcrypt.hash(password, 10);

  // Crea el nuevo empleado en la base de datos
  const newEmployee = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      roleId,
    },
  });

  // Devuelve el empleado creado
  res.status(201).json(newEmployee);
};

// Obtiene todos los empleados, incluyendo su rol
export const getEmployees = async (_: Request, res: Response) => {
  const employees = await prisma.user.findMany({ include: { role: true } });
  return res.json(employees);
};

// Obtiene todos los usuarios, incluyendo su rol
export const getAllUsers = async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    include: { role: true },
  });
  res.json(users);
};

// Obtiene un usuario por su ID
export const getUserById = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(req.params.id) },
    include: { role: true },
  });

  if (!user)
    // Si no existe, responde con error 404
    return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json(user);
};

// Crea un usuario (sin validación extra)
export const createUser = async (req: Request, res: Response) => {
  const { name, email, password, roleId } = req.body;

  // Hashea la contraseña antes de guardar
  const hashedPassword = await bcrypt.hash(password, 10);

  // Crea el usuario en la base de datos
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      roleId,
    },
  });

  // Devuelve el usuario creado
  res.status(201).json(newUser);
};

// Actualiza un usuario existente, validando que el email no esté duplicado
export const updateUser = async (req: Request, res: Response) => {
  const { name, email, roleId } = req.body;

  if (email) {
    // Verifica si el email ya pertenece a otro usuario
    const existingEmail = await prisma.user.findUnique({ where: { email } });

    if (existingEmail && existingEmail.id !== Number(req.params.id)) {
      // Si ya existe, responde con error 400
      return res.status(400).json({ message: 'Ese correo ya pertenece a otro empleado.' });
    }
  }

  // Actualiza el usuario en la base de datos
  const updatedUser = await prisma.user.update({
    where: { id: Number(req.params.id) },
    data: { name, email, roleId },
  });

  // Devuelve el usuario actualizado
  res.json(updatedUser);
};

// Elimina un usuario por su ID
export const deleteUser = async (req: Request, res: Response) => {
  await prisma.user.delete({
    where: { id: Number(req.params.id) },
  });

  // Devuelve mensaje de éxito
  res.json({ message: 'Usuario eliminado correctamente' });
};
