import React, { useEffect, useState } from 'react';
import { getClients, createClient, updateClient, deleteClient } from '../services/client.service';
import { useUserStore } from '../store/user';

const Clients = () => {
  const token = useUserStore((s) => s.token);
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    const res = await getClients(token!);
    setClients(res);
  };

  const validateForm = () => {
    const e: { [key: string]: string } = {};
    if (!form.name.trim()) e.name = 'El nombre es obligatorio';
    if (form.email && !form.email.includes('@')) e.email = 'Email inválido';
    if (form.phone && form.phone.length < 7) e.phone = 'Teléfono inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (editingId) {
      await updateClient(editingId, form, token!);
    } else {
      await createClient(form, token!);
    }

    setForm({ name: '', email: '', phone: '' });
    setEditingId(null);
    setErrors({});
    loadClients();
  };

  const handleEdit = (c: any) => {
    setForm({ name: c.name, email: c.email || '', phone: c.phone || '' });
    setEditingId(c.id);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar este cliente?')) {
      await deleteClient(id, token!);
      loadClients();
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Clientes</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <input
            type="text"
            placeholder="Nombre"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={`border p-2 w-full ${errors.name ? 'border-red-500' : ''}`}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        <div>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={`border p-2 w-full ${errors.email ? 'border-red-500' : ''}`}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>

        <div>
          <input
            type="text"
            placeholder="Teléfono"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={`border p-2 w-full ${errors.phone ? 'border-red-500' : ''}`}
          />
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
        </div>
      </div>

      <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">
        {editingId ? 'Actualizar' : 'Crear'} Cliente
      </button>

      <table className="w-full border mt-6">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Nombre</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Teléfono</th>
            <th className="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c: any) => (
            <tr key={c.id}>
              <td className="p-2 border">{c.id}</td>
              <td className="p-2 border">{c.name}</td>
              <td className="p-2 border">{c.email}</td>
              <td className="p-2 border">{c.phone}</td>
              <td className="p-2 border">
                <button onClick={() => handleEdit(c)} className="mr-2 text-blue-500">
                  Editar
                </button>
                <button onClick={() => handleDelete(c.id)} className="text-red-500">
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Clients;
