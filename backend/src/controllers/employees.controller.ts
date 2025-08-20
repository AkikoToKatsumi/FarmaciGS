import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import pool from '../config/db';
import bcrypt from 'bcryptjs';

// Obtener todos los empleados con información completa
export const getEmployees = async (req: Request, res: Response) => {
  try {
    console.log('=== DEBUGGING EMPLOYEES QUERY ===');
    // Check for employees without user_id
    const withoutIdResult = await pool.query('SELECT COUNT(*) as count FROM employees WHERE user_id IS NULL');
    console.log('Employees without user_id:', withoutIdResult.rows[0].count);

    if (parseInt(withoutIdResult.rows[0].count) > 0) {
      console.log('Assigning user_ids to existing employees...');
      const maxIdResult = await pool.query('SELECT COALESCE(MAX(user_id), 0) as max_id FROM employees WHERE user_id IS NOT NULL');
      let nextId = parseInt(maxIdResult.rows[0].max_id) + 1;

      // Use email as unique identifier if id column does not exist
      const employeesWithoutId = await pool.query('SELECT email FROM employees WHERE user_id IS NULL ORDER BY email');
      for (const emp of employeesWithoutId.rows) {
        await pool.query('UPDATE employees SET user_id = $1 WHERE email = $2', [nextId, emp.email]);
        console.log(`Assigned user_id ${nextId} to employee with email ${emp.email}`);
        nextId++;
      }
    }

    // Consulta principal para obtener todos los empleados
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
      WHERE user_id IS NOT NULL
      ORDER BY name ASC
    `);

    console.log('Employees fetched:', result.rows.length);
    console.log('Sample employee:', result.rows[0]);
    console.log('=== END DEBUGGING ===');

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

  try {
    // Extraer y normalizar datos del request
    const {
      name,
      email,
      position,
      department,
      salary,
      contractType,
      contracttype, // Alternativa para compatibilidad
      schedule,
      phone,
      address,
      status = 'active'
    } = req.body;

    // Normalizar salary y contracttype
    const normalizedSalary = (salary !== undefined && salary !== null && salary !== '') ? Number(salary) : null;
    const normalizedContractType = contractType || contracttype;

    // Validación básica de campos requeridos
    if (!name || !email) {
      return res.status(400).json({ 
        message: 'Los campos nombre y email son obligatorios.' 
      });
    }

    // Validar salary si se proporciona
    if (salary !== undefined && salary !== null && salary !== '') {
      if (normalizedSalary === null || isNaN(normalizedSalary) || normalizedSalary <= 0) {
        return res.status(400).json({ 
          message: 'El salario debe ser un número válido mayor a 0.' 
        });
      }
    }

    // Verificar si ya existe un usuario con el mismo email
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        message: 'Ya existe un usuario con ese correo electrónico.' 
      });
    }

    // Verificar si ya existe un empleado con el mismo email
    const existingEmployee = await pool.query(
      'SELECT user_id, status FROM employees WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (existingEmployee.rows.length > 0) {
      const existing = existingEmployee.rows[0];
      if (existing.status === 'active') {
        return res.status(400).json({ 
          message: 'Ya existe un empleado activo con ese correo electrónico.' 
        });
      } else {
        return res.status(400).json({ 
          message: 'Ya existe un empleado con ese correo electrónico (inactivo). Considere reactivarlo.' 
        });
      }
    }

    // Verificar si ya existe un empleado con el mismo teléfono (solo si se proporciona)
    if (phone && phone.trim() !== '') {
      const existingPhone = await pool.query(
        'SELECT user_id FROM employees WHERE phone = $1 AND status = $2',
        [phone, 'active']
      );

      if (existingPhone.rows.length > 0) {
        return res.status(400).json({ 
          message: 'Ya existe un empleado activo con ese número de teléfono.' 
        });
      }
    }

    // Buscar el rol de empleado o usar un rol por defecto
    let roleId = 3; // Fallback role ID para empleado
    
    try {
      const employeeRoleResult = await pool.query(
        'SELECT id FROM roles WHERE LOWER(name) = LOWER($1)',
        ['employee']
      );

      if (employeeRoleResult.rows.length > 0) {
        roleId = employeeRoleResult.rows[0].id;
      } else {
        // Si no existe el rol 'employee', intentar obtener cualquier rol o crear uno
        const anyRoleResult = await pool.query('SELECT id FROM roles ORDER BY id LIMIT 1');
        if (anyRoleResult.rows.length > 0) {
          roleId = anyRoleResult.rows[0].id;
        } else {
          // Si no hay roles, crear uno básico
          const newRoleResult = await pool.query(
            'INSERT INTO roles (name) VALUES ($1) RETURNING id',
            ['employee']
          );
          roleId = newRoleResult.rows[0].id;
        }
      }
    } catch (roleError) {
      console.warn('Error handling roles, using default roleId:', roleError);
      // Continuar con el roleId por defecto
    }

    // Generar una contraseña temporal (puede ser cambiada después)
    const tempPassword = Math.random().toString(36).slice(-8); // Contraseña temporal
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Primero crear el usuario
    const userResult = await pool.query(`
      INSERT INTO users (name, email, password, role_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [name, email, hashedPassword, roleId]);

    const userId = userResult.rows[0].id;
    console.log('User created with ID:', userId);

    // Luego crear el empleado usando el user_id
    const result = await pool.query(`
      INSERT INTO employees (
        user_id,
        name,
        email,
        position,
        department,
        salary,
        contracttype,
        schedule,
        phone,
        address,
        status,
        hire_date,
        startdate
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_DATE, CURRENT_DATE
      ) RETURNING *
    `, [
      userId,
      name,
      email,
      position || null,
      department || null,
      normalizedSalary,
      normalizedContractType || null,
      schedule || null,
      phone || null,
      address || null,
      status
    ]);

    console.log('Employee created successfully:', result.rows[0]);
    console.log('Temporary password for employee:', tempPassword);
    
    // Retornar el empleado creado junto con la contraseña temporal
    res.status(201).json({ 
      ...result.rows[0], 
      tempPassword: tempPassword,
      message: 'Empleado creado exitosamente. Contraseña temporal generada.'
    });
  } catch (error) {
    console.error('Error creando empleado:', error);
    res.status(500).json({ message: 'Error al crear el empleado' });
  }
};

// Actualizar empleado
export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = Number(id);

    if (isNaN(userId)) {
      return res.status(400).json({ message: 'ID de empleado inválido.' });
    }

    // Verificar que el empleado existe
    const existingEmployee = await pool.query(
      'SELECT * FROM employees WHERE user_id = $1',
      [userId]
    );

    if (existingEmployee.rows.length === 0) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    const currentEmployee = existingEmployee.rows[0];

    // Extraer datos del request
    const {
      name,
      email,
      position,
      department,
      salary,
      contractType,
      contracttype, // Alternativa para compatibilidad
      schedule,
      phone,
      address,
      status
    } = req.body;

    // Usar valores actuales si no se proporcionan nuevos
    const updatedData = {
      name: name !== undefined ? name : currentEmployee.name,
      email: email !== undefined ? email : currentEmployee.email,
      position: position !== undefined ? position : currentEmployee.position,
      department: department !== undefined ? department : currentEmployee.department,
      salary: salary !== undefined ? (salary === null || salary === '' ? null : Number(salary)) : currentEmployee.salary,
      contracttype: (contractType || contracttype) !== undefined ? (contractType || contracttype) : currentEmployee.contracttype,
      schedule: schedule !== undefined ? schedule : currentEmployee.schedule,
      phone: phone !== undefined ? phone : currentEmployee.phone,
      address: address !== undefined ? address : currentEmployee.address,
      status: status !== undefined ? status : currentEmployee.status
    };

    // Validación básica
    if (!updatedData.name || !updatedData.email) {
      return res.status(400).json({ 
        message: 'Los campos nombre y email son obligatorios.' 
      });
    }

    // Validar salary si se proporciona
    if (updatedData.salary !== null && updatedData.salary !== undefined) {
      if (isNaN(Number(updatedData.salary)) || Number(updatedData.salary) <= 0) {
        return res.status(400).json({ 
          message: 'El salario debe ser un número válido mayor a 0.' 
        });
      }
    }

    // Verificar email único (solo si cambió)
    if (updatedData.email !== currentEmployee.email) {
      const emailCheck = await pool.query(
        'SELECT user_id FROM employees WHERE LOWER(email) = LOWER($1) AND user_id != $2',
        [updatedData.email, userId]
      );

      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ 
          message: 'Ese correo electrónico ya pertenece a otro empleado.' 
        });
      }
    }

    // Verificar teléfono único (solo si cambió y se proporciona)
    if (updatedData.phone !== currentEmployee.phone && updatedData.phone && updatedData.phone.trim() !== '') {
      const phoneCheck = await pool.query(
        'SELECT user_id FROM employees WHERE phone = $1 AND user_id != $2 AND status = $3',
        [updatedData.phone, userId, 'active']
      );

      if (phoneCheck.rows.length > 0) {
        return res.status(400).json({ 
          message: 'Ese número de teléfono ya pertenece a otro empleado.' 
        });
      }
    }

    // Actualizar empleado
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
    `, [
      updatedData.name,
      updatedData.email,
      updatedData.position,
      updatedData.department,
      updatedData.salary,
      updatedData.contracttype,
      updatedData.schedule,
      updatedData.phone,
      updatedData.address,
      updatedData.status,
      userId
    ]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error actualizando empleado:', error);
    res.status(500).json({ message: 'Error al actualizar empleado' });
  }
};

// Eliminar empleado (soft delete recomendado)
export const deleteEmployee = async (req: AuthRequest, res: Response) => {
  console.log('=== DELETE EMPLOYEE CONTROLLER ===');
  console.log('Request params:', req.params);
  console.log('Request user:', req.user);
  
  try {
    const userId = Number(req.params.id);
    console.log('Parsed user ID:', userId);

    if (isNaN(userId) || userId <= 0) {
      console.log('❌ Invalid user ID');
      return res.status(400).json({ message: 'ID de empleado inválido.' });
    }

    // Check if employee exists first
    console.log('Checking if employee exists...');
    const existsCheck = await pool.query(
      'SELECT user_id, status, name, email FROM employees WHERE user_id = $1',
      [userId]
    );

    console.log('Existence check result:', existsCheck.rows);

    if (existsCheck.rows.length === 0) {
      console.log('❌ Employee not found');
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    const currentEmployee = existsCheck.rows[0];
    console.log('Current employee status:', currentEmployee.status);

    // Toggle between active and inactive status
    const newStatus = currentEmployee.status === 'active' ? 'inactive' : 'active';
    console.log('New status will be:', newStatus);

    // Perform the status change
    console.log('Updating employee status...');
    const result = await pool.query(
      'UPDATE employees SET status = $1 WHERE user_id = $2 RETURNING *',
      [newStatus, userId]
    );

    console.log('Update result:', result.rows);
    console.log('✅ Employee status updated successfully');
    console.log('=== END DELETE EMPLOYEE CONTROLLER ===');

    const action = newStatus === 'inactive' ? 'desactivado' : 'reactivado';
    res.json({ 
      message: `Empleado ${action} correctamente`,
      employee: result.rows[0],
      previousStatus: currentEmployee.status,
      newStatus: newStatus
    });
  } catch (error) {
    console.error('❌ Error updating employee status:', error);
    console.log('=== END DELETE EMPLOYEE CONTROLLER ===');
    res.status(500).json({ message: 'Error al actualizar el estado del empleado' });
  }
};

// Alias para mantener consistencia con tu estructura existente
export const getAllEmployees = getEmployees;

// Buscar empleados
export const searchEmployees = async (req: Request, res: Response) => {
  try {
    const { term } = req.query;

    if (!term || typeof term !== 'string') {
      return res.status(400).json({ message: 'Término de búsqueda requerido' });
    }

    const searchTerm = `%${term.trim()}%`;

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
        LOWER(email) LIKE LOWER($1) OR
        LOWER(phone) LIKE LOWER($1)
      ORDER BY 
        CASE 
          WHEN LOWER(name) LIKE LOWER($1) THEN 1
          WHEN LOWER(email) LIKE LOWER($1) THEN 2
          ELSE 3
        END,
        name ASC
    `, [searchTerm]);

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

    if (!department || department.trim() === '') {
      return res.status(400).json({ message: 'Departamento requerido' });
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
      WHERE LOWER(department) = LOWER($1)
      ORDER BY name ASC
    `, [department.trim()]);

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

    if (!status || !['active', 'inactive'].includes(status.toLowerCase())) {
      return res.status(400).json({ 
        message: 'Estado inválido. Debe ser "active" o "inactive"' 
      });
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
      WHERE LOWER(status) = LOWER($1)
      ORDER BY name ASC
    `, [status.toLowerCase()]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo empleados por estado:', error);
    res.status(500).json({ message: 'Error al obtener empleados por estado' });
  }
};

// Obtener estadísticas de empleados
export const getEmployeeStats = async (req: Request, res: Response) => {
  try {
    // Estadísticas básicas
    const totalResult = await pool.query('SELECT COUNT(*) as count FROM employees');
    const activeResult = await pool.query('SELECT COUNT(*) as count FROM employees WHERE status = $1', ['active']);
    const inactiveResult = await pool.query('SELECT COUNT(*) as count FROM employees WHERE status = $1', ['inactive']);
    
    // Estadísticas por departamento
    const departmentResult = await pool.query(`
      SELECT 
        department, 
        COUNT(*) as count,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count
      FROM employees 
      WHERE department IS NOT NULL
      GROUP BY department 
      ORDER BY count DESC
    `);
    
    // Estadísticas por tipo de contrato
    const contractResult = await pool.query(`
      SELECT 
        contracttype, 
        COUNT(*) as count,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count
      FROM employees 
      WHERE contracttype IS NOT NULL
      GROUP BY contracttype 
      ORDER BY count DESC
    `);

    // Estadísticas salariales (solo empleados activos con salario)
    const salaryResult = await pool.query(`
      SELECT 
        COUNT(*) as employees_with_salary,
        AVG(salary) as average_salary,
        MIN(salary) as min_salary,
        MAX(salary) as max_salary
      FROM employees 
      WHERE status = 'active' AND salary IS NOT NULL AND salary > 0
    `);

    const stats = {
      total: parseInt(totalResult.rows[0].count),
      active: parseInt(activeResult.rows[0].count),
      inactive: parseInt(inactiveResult.rows[0].count),
      byDepartment: departmentResult.rows.map(row => ({
        department: row.department,
        total: parseInt(row.count),
        active: parseInt(row.active_count)
      })),
      byContractType: contractResult.rows.map(row => ({
        contractType: row.contracttype,
        total: parseInt(row.count),
        active: parseInt(row.active_count)
      })),
      salary: salaryResult.rows[0].employees_with_salary > 0 ? {
        employeesWithSalary: parseInt(salaryResult.rows[0].employees_with_salary),
        average: parseFloat(salaryResult.rows[0].average_salary).toFixed(2),
        min: parseFloat(salaryResult.rows[0].min_salary),
        max: parseFloat(salaryResult.rows[0].max_salary)
      } : null
    };

    res.json(stats);
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
};

// Reactivar empleado
export const reactivateEmployee = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ message: 'ID de empleado inválido.' });
    }

    const result = await pool.query(
      'UPDATE employees SET status = $1 WHERE user_id = $2 AND status = $3 RETURNING *',
      ['active', userId, 'inactive']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Empleado no encontrado o ya está activo.' });
    } 
    res.json({ 
      message: 'Empleado reactivado correctamente',
      employee: result.rows[0]
    });
  } catch (error) {
    console.error('Error reactivando empleado:', error);
    res.status(500).json({ message: 'Error al reactivar empleado' }); 
  }
};