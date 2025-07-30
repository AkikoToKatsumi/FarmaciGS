// controllers/employees.controller.ts
import { Request, Response } from 'express';
import pool from '../config/db';

// Obtener todos los empleados con información completa
export const getEmployees = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        user_id,
        hire_date,
        salary,
        status,
        email,
        name,
        position,
        department,
        contracttype,
        schedule,
        startdate,
        phone,
        address
      FROM employees 
      ORDER BY name ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo empleados:', error);
    res.status(500).json({ message: 'Error al obtener empleados' });
  }
};

// Obtener empleado por ID
export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        user_id,
        hire_date,
        salary,
        status,
        email,
        name,
        position,
        department,
        contracttype,
        schedule,
        startdate,
        phone,
        address
      FROM employees 
      WHERE user_id = $1
    `, [Number(req.params.id)]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error obteniendo empleado:', error);
    res.status(500).json({ message: 'Error al obtener empleado' });
  }
};

// Crear nuevo empleado
export const createEmployee = async (req: Request, res: Response) => {
  console.log('createEmployee called with body:', req.body);

  const {
    name,
    email,
    position,
    department,
    salary,
    contractType,
    schedule,
    phone,
    address,
    status = 'active'
  } = req.body;

  // Verificar si ya existe un empleado con el mismo email
  const existingEmployee = await pool.query('SELECT * FROM employees WHERE email = $1', [email]);
  if (existingEmployee.rows.length > 0) {
    console.log('Email already exists:', email);
    return res.status(400).json({ message: 'Ya existe un empleado con ese correo electrónico.' });
  }

  try {
    const result = await pool.query(`
      INSERT INTO employees (
        hire_date,
        salary,
        status,
        email,
        name,
        position,
        department,
        contracttype,
        schedule,
        startdate,
        phone,
        address
      ) VALUES (
        CURRENT_DATE,
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        CURRENT_DATE,
        $9,
        $10
      ) RETURNING *
    `, [salary, status, email, name, position, department, contractType, schedule, phone, address]);

    console.log('Empleado creado:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creando empleado:', error);
    res.status(500).json({ message: 'Error al crear el empleado' });
  }
};

// Actualizar empleado
export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      position,
      department,
      salary,
      contractType,
      schedule,
      phone,
      address,
      status
    } = req.body;

    // Si se está actualizando el email, verificar que no exista
    if (email) {
      const existingEmail = await pool.query('SELECT * FROM employees WHERE email = $1', [email]);
      if (existingEmail.rows.length > 0 && existingEmail.rows[0].user_id !== Number(id)) {
        return res.status(400).json({ message: 'Ese correo ya pertenece a otro empleado.' });
      }
    }

    const result = await pool.query(`
      UPDATE employees 
      SET 
        name = $1,
        email = $2,
        position = $3,
        department = $4,
        salary = $5,
        contracttype = $6,
        schedule = $7,
        phone = $8,
        address = $9,
        status = $10
      WHERE user_id = $11 
      RETURNING *
    `, [name, email, position, department, salary, contractType, schedule, phone, address, status, Number(id)]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error actualizando empleado:', error);
    res.status(500).json({ message: 'Error al actualizar empleado' });
  }
};

// Eliminar empleado
export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('DELETE FROM employees WHERE user_id = $1 RETURNING *', [Number(req.params.id)]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    res.json({ message: 'Empleado eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando empleado:', error);
    res.status(500).json({ message: 'Error al eliminar empleado' });
  }
};

// Buscar empleados
export const searchEmployees = async (req: Request, res: Response) => {
  try {
    const { term } = req.query;

    if (!term || typeof term !== 'string') {
      return res.status(400).json({ message: 'Término de búsqueda requerido' });
    }

    const result = await pool.query(`
      SELECT 
        user_id,
        hire_date,
        salary,
        status,
        email,
        name,
        position,
        department,
        contracttype,
        schedule,
        startdate,
        phone,
        address
      FROM employees 
      WHERE 
        LOWER(name) LIKE LOWER($1) OR 
        LOWER(position) LIKE LOWER($1) OR 
        LOWER(department) LIKE LOWER($1) OR
        LOWER(email) LIKE LOWER($1)
      ORDER BY name ASC
    `, [`%${term}%`]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error buscando empleados:', error);
    res.status(500).json({ message: 'Error al buscar empleados' });
  }
};

// Obtener empleados por departamento
export const getEmployeesByDepartment = async (req: Request, res: Response) => {
  try {
    const { department } = req.params;

    const result = await pool.query(`
      SELECT 
        user_id,
        hire_date,
        salary,
        status,
        email,
        name,
        position,
        department,
        contracttype,
        schedule,
        startdate,
        phone,
        address
      FROM employees 
      WHERE LOWER(department) = LOWER($1)
      ORDER BY name ASC
    `, [department]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo empleados por departamento:', error);
    res.status(500).json({ message: 'Error al obtener empleados por departamento' });
  }
};

// Obtener empleados por estado
export const getEmployeesByStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.params;

    const result = await pool.query(`
      SELECT 
        user_id,
        hire_date,
        salary,
        status,
        email,
        name,
        position,
        department,
        contracttype,
        schedule,
        startdate,
        phone,
        address
      FROM employees 
      WHERE LOWER(status) = LOWER($1)
      ORDER BY name ASC
    `, [status]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo empleados por estado:', error);
    res.status(500).json({ message: 'Error al obtener empleados por estado' });
  }
};

// Obtener estadísticas de empleados
export const getEmployeeStats = async (req: Request, res: Response) => {
  try {
    const totalResult = await pool.query('SELECT COUNT(*) as count FROM employees');
    const activeResult = await pool.query('SELECT COUNT(*) as count FROM employees WHERE status = \'active\'');
    const inactiveResult = await pool.query('SELECT COUNT(*) as count FROM employees WHERE status = \'inactive\'');
    const departmentResult = await pool.query(`
      SELECT department, COUNT(*) as count 
      FROM employees 
      GROUP BY department 
      ORDER BY count DESC
    `);
    const contractResult = await pool.query(`
      SELECT contracttype, COUNT(*) as count 
      FROM employees 
      GROUP BY contracttype 
      ORDER BY count DESC
    `);

    const stats = {
      total: parseInt(totalResult.rows[0].count),
      active: parseInt(activeResult.rows[0].count),
      inactive: parseInt(inactiveResult.rows[0].count),
      byDepartment: departmentResult.rows,
      byContractType: contractResult.rows
    };

    res.json(stats);
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
};

// Alias para mantener consistencia con tu estructura existente
export const getAllEmployees = getEmployees;