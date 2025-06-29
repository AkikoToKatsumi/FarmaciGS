import React, { useEffect, useState } from 'react';
// Suponiendo que tienes estos servicios:
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../services/employees.service';
import { getRoles } from '../services/role.service';
import { useUserStore } from '../store/user';

const Employees = () => {
  const token = useUserStore((s) => s.token);
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    roleId: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadEmployees();
    loadRoles();
  }, []);

  const loadEmployees = async () => {
    const res = await getEmployees(token!);
    setEmployees(res);
  };

  const loadRoles = async () => {
    const res = await getRoles(token!);
    setRoles(res);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!form.email.trim()) newErrors.email = 'El email es obligatorio';
    if (!form.roleId) newErrors.roleId = 'El rol es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (editingId) {
      await updateEmployee(editingId, form, token!);
    } else {
      await createEmployee(form, token!);
    }
    setForm({ name: '', email: '', roleId: '' });
    setEditingId(null);
    setErrors({});
    loadEmployees();
  };

  const handleEdit = (emp: any) => {
    setForm({
      name: emp.name,
      email: emp.email,
      roleId: emp.roleId || '',
    });
    setEditingId(emp.id);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar este empleado?')) {
      await deleteEmployee(id, token!);
      loadEmployees();
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Empleados</h1>
      <div className="mb-4 grid grid-cols-3 gap-4">
        <div>
          <input
            type="text"
            placeholder="Nombre"
            value={form.name}
            onChange={e => {
              setForm({ ...form, name: e.target.value });
              if (errors.name) validateForm();
            }}
            className={`border p-2 w-full ${errors.name ? 'border-red-500' : ''}`}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => {
              setForm({ ...form, email: e.target.value });
              if (errors.email) validateForm();
            }}
            className={`border p-2 w-full ${errors.email ? 'border-red-500' : ''}`}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>
        <div>
          <select
            value={form.roleId}
            onChange={e => {
              setForm({ ...form, roleId: e.target.value });
              if (errors.roleId) validateForm();
            }}
            className={`border p-2 w-full ${errors.roleId ? 'border-red-500' : ''}`}
          >
            <option value="">Seleccionar rol</option>
            {roles.map((r: any) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          {errors.roleId && <p className="text-red-500 text-sm">{errors.roleId}</p>}
        </div>
      </div>
      <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded mb-4">
        {editingId ? 'Actualizar' : 'Registrar'} empleado
      </button>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">Nombre</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Rol</th>
            <th className="border p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp: any) => (
            <tr key={emp.id}>
              <td className="border p-2">{emp.id}</td>
              <td className="border p-2">{emp.name}</td>
              <td className="border p-2">{emp.email}</td>
              <td className="border p-2">
                {
                  // Soluciona el error tipando roles como any[]
                  (roles as any[]).find((r) => r.id === emp.roleId)?.name || ''
                }
              </td>
              <td className="border p-2 space-x-2">
                <button onClick={() => handleEdit(emp)} className="bg-yellow-400 px-2 py-1 text-white rounded">Editar</button>
                <button onClick={() => handleDelete(emp.id)} className="bg-red-600 px-2 py-1 text-white rounded">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Employees;
