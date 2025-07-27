// src/controllers/roles.controller.ts
import { Request, Response } from 'express';
import pool from '../config/db';
import { validateRoleInput } from '../validators/role.validator';

// Obtiene todos los roles, incluyendo sus permisos
export const getRoles = async (_: Request, res: Response) => {
  try {
    const rolesResult = await pool.query('SELECT * FROM roles');
    console.log('Roles result:', rolesResult.rows);

    if (!rolesResult.rows || rolesResult.rows.length === 0) {
      return res.json([]);
    }

    const permissionsResult = await pool.query('SELECT * FROM permissions');
    const roles = rolesResult.rows.map((role: any) => ({
      ...role,
      permissions: permissionsResult.rows.filter((p: any) => p.role_id === role.id),
    }));
    return res.json(roles);
  } catch (error: any) {
    // Log the error stack for debugging
    console.error('Error al obtener roles:', error.stack || error);
    return res.status(500).json({ message: 'Error al obtener roles', error: error.message || error });
  }
};

// Crea un nuevo rol con validación y verificación de nombre duplicado
export const createRole = async (req: Request, res: Response) => {
  const validation = await validateRoleInput(req.body);
  if (!validation.isValid) {
    return res.status(400).json({ message: validation.message });
  }
  const { name, permissions } = req.body;
  const existingRole = await pool.query('SELECT * FROM roles WHERE name = $1', [name]);
  if (existingRole.rows.length > 0) {
    return res.status(400).json({
      message: 'El nombre del rol ya está en uso.',
    });
  }
  try {
    const roleResult = await pool.query(
      'INSERT INTO roles (name) VALUES ($1) RETURNING *',
      [name]
    );
    const role = roleResult.rows[0];
    for (const action of permissions) {
      await pool.query(
        'INSERT INTO permissions (role_id, action) VALUES ($1, $2)',
        [role.id, action]
      );
    }
    // Devuelve el rol creado con permisos
    const perms = await pool.query('SELECT * FROM permissions WHERE role_id = $1', [role.id]);
    return res.status(201).json({ ...role, permissions: perms.rows });
  } catch (error) {
    return res.status(500).json({ message: 'Error al crear el rol', error });
  }
};

// Actualiza un rol existente y sus permisos
export const updateRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, permissions } = req.body;
  try {
    await pool.query('DELETE FROM permissions WHERE role_id = $1', [id]);
    await pool.query('UPDATE roles SET name = $1 WHERE id = $2', [name, id]);
    for (const action of permissions) {
      await pool.query(
        'INSERT INTO permissions (role_id, action) VALUES ($1, $2)',
        [id, action]
      );
    }
    const roleResult = await pool.query('SELECT * FROM roles WHERE id = $1', [id]);
    const perms = await pool.query('SELECT * FROM permissions WHERE role_id = $1', [id]);
    return res.json({ ...roleResult.rows[0], permissions: perms.rows });
  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar el rol', error });
  }
};

// Elimina un rol y sus permisos asociados
export const deleteRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM permissions WHERE role_id = $1', [id]);
    await pool.query('DELETE FROM roles WHERE id = $1', [id]);
    return res.json({ message: 'Rol eliminado correctamente' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al eliminar el rol', error });
  }
};
export function getRoleById(arg0: string, getRoleById: any) {
  throw new Error('Function not implemented.');
}

