"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRole = exports.updateRole = exports.createRole = exports.getRoles = void 0;
exports.getRoleById = getRoleById;
const db_1 = __importDefault(require("../config/db"));
const role_validator_1 = require("../validators/role.validator");
// Obtiene todos los roles, incluyendo sus permisos
const getRoles = async (_, res) => {
    try {
        const rolesResult = await db_1.default.query('SELECT * FROM roles');
        const permissionsResult = await db_1.default.query('SELECT * FROM permissions');
        // Une roles y permisos en JS
        const roles = rolesResult.rows.map((role) => ({
            ...role,
            permissions: permissionsResult.rows.filter((p) => p.role_id === role.id),
        }));
        return res.json(roles);
    }
    catch (error) {
        return res.status(500).json({ message: 'Error al obtener roles', error });
    }
};
exports.getRoles = getRoles;
// Crea un nuevo rol con validación y verificación de nombre duplicado
const createRole = async (req, res) => {
    const validation = await (0, role_validator_1.validateRoleInput)(req.body);
    if (!validation.isValid) {
        return res.status(400).json({ message: validation.message });
    }
    const { name, permissions } = req.body;
    const existingRole = await db_1.default.query('SELECT * FROM roles WHERE name = $1', [name]);
    if (existingRole.rows.length > 0) {
        return res.status(400).json({
            message: 'El nombre del rol ya está en uso.',
        });
    }
    try {
        const roleResult = await db_1.default.query('INSERT INTO roles (name) VALUES ($1) RETURNING *', [name]);
        const role = roleResult.rows[0];
        for (const action of permissions) {
            await db_1.default.query('INSERT INTO permissions (role_id, action) VALUES ($1, $2)', [role.id, action]);
        }
        // Devuelve el rol creado con permisos
        const perms = await db_1.default.query('SELECT * FROM permissions WHERE role_id = $1', [role.id]);
        return res.status(201).json({ ...role, permissions: perms.rows });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error al crear el rol', error });
    }
};
exports.createRole = createRole;
// Actualiza un rol existente y sus permisos
const updateRole = async (req, res) => {
    const { id } = req.params;
    const { name, permissions } = req.body;
    try {
        await db_1.default.query('DELETE FROM permissions WHERE role_id = $1', [id]);
        await db_1.default.query('UPDATE roles SET name = $1 WHERE id = $2', [name, id]);
        for (const action of permissions) {
            await db_1.default.query('INSERT INTO permissions (role_id, action) VALUES ($1, $2)', [id, action]);
        }
        const roleResult = await db_1.default.query('SELECT * FROM roles WHERE id = $1', [id]);
        const perms = await db_1.default.query('SELECT * FROM permissions WHERE role_id = $1', [id]);
        return res.json({ ...roleResult.rows[0], permissions: perms.rows });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error al actualizar el rol', error });
    }
};
exports.updateRole = updateRole;
// Elimina un rol y sus permisos asociados
const deleteRole = async (req, res) => {
    const { id } = req.params;
    try {
        await db_1.default.query('DELETE FROM permissions WHERE role_id = $1', [id]);
        await db_1.default.query('DELETE FROM roles WHERE id = $1', [id]);
        return res.json({ message: 'Rol eliminado correctamente' });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error al eliminar el rol', error });
    }
};
exports.deleteRole = deleteRole;
function getRoleById(arg0, getRoleById) {
    throw new Error('Function not implemented.');
}
