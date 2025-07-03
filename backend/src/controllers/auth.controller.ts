// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../config/db';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    // 🔍 LOGS PARA DEBUGGING - Agregar estos console.log aquí
    console.log('Body recibido:', req.body);
    console.log('Email:', email);
    console.log('Password length:', password?.length);
    console.log('JWT_SECRET definido:', !!process.env.JWT_SECRET);
    
    // Validar que email y password estén presentes
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }
     console.log('🔍 Ejecutando consulta SQL...');
    console.log('Query:', 'SELECT * FROM users WHERE email = $1');
    console.log('Parámetros:', [email]);

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      console.log('🔍 Resultado de la consulta:');
    console.log('Filas encontradas:', result.rows.length);
    console.log('Datos completos:', result.rows);

    const user = result.rows[0];
      // 🔍 LOGS PARA DEBUGGING - Verificar si el usuario fue encontrado
     console.log('Usuario encontrado:', user ? 'Sí' : 'No');

    if (!user) {
       console.log('❌ Usuario no encontrado');
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    console.log('🔍 Comparando contraseñas...');
    const isMatch = await bcrypt.compare(password, user.password);
       console.log('Contraseña coincide:', isMatch ? 'Sí' : 'No');
    if (!isMatch) {
      console.log('❌ Contraseña incorrecta');
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Verificar que JWT_SECRET esté definido
    if (!process.env.JWT_SECRET) {
      console.log('❌ JWT_SECRET no definido');
      return res.status(500).json({ message: 'Error de configuración del servidor' });
    }

    console.log('🔍 Generando token...');
    const token = jwt.sign({ id: user.id, role: user.role_id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Remover la contraseña antes de enviar el usuario
    const { password: _, ...userWithoutPassword } = user;
console.log('✅ Login exitoso');
    res.json({ user: userWithoutPassword, accessToken: token });
  } catch (error) {
     console.error('💥 Error en login:', error);
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};