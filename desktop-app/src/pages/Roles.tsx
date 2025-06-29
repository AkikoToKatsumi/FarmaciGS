import React, { useEffect, useState } from 'react';
// Suponiendo que tienes estos servicios:
import { getRoles, createRole, updateRole, deleteRole } from '../services/role.service';
import { useUserStore } from '../store/user';

const Roles = () => {
  const token = useUserStore((s) => s.token);
  const [roles, setRoles] = useState([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    const res = await getRoles(token!);
    setRoles(res);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.name.trim()) newErrors.name = 'El nombre es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (editingId) {
      await updateRole(editingId, form, token!);
    } else {
      await createRole(form, token!);
    }
    setForm({ name: '' });
    setEditingId(null);
    setErrors({});
    loadRoles();
  };

  const handleEdit = (role: any) => {
    setForm({ name: role.name });
    setEditingId(role.id);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar este rol?')) {
      await deleteRole(id, token!);
      loadRoles();
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Roles</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Nombre del rol"
          value={form.name}
          onChange={e => {
            setForm({ ...form, name: e.target.value });
            if (errors.name) validateForm();
          }}
          className={`border p-2 w-full ${errors.name ? 'border-red-500' : ''}`}
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded mt-2">
          {editingId ? 'Actualizar' : 'Crear'} rol
        </button>
      </div>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">Nombre</th>
            <th className="border p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role: any) => (
            <tr key={role.id}>
              <td className="border p-2">{role.id}</td>
              <td className="border p-2">{role.name}</td>
              <td className="border p-2 space-x-2">
                <button onClick={() => handleEdit(role)} className="bg-yellow-400 px-2 py-1 text-white rounded">Editar</button>
                <button onClick={() => handleDelete(role.id)} className="bg-red-600 px-2 py-1 text-white rounded">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Roles;
