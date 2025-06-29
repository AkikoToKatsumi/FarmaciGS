import React, { useEffect, useState } from 'react';
import {
  getMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} from '../services/inventory.service';
import { useUserStore } from '../store/user';

const Inventory = () => {
  const [medicines, setMedicines] = useState([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    stock: 0,
    price: 0,
    expirationDate: '',
    lot: '',
  });

  // Agregado: estado para errores
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Agregado: función de validación
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!form.stock || form.stock < 0) newErrors.stock = 'Stock inválido';
    if (!form.price || form.price < 0) newErrors.price = 'Precio inválido';
    if (!form.expirationDate) newErrors.expirationDate = 'Fecha requerida';
    if (!form.lot.trim()) newErrors.lot = 'El lote es obligatorio';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const token = useUserStore((s) => s.token);

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    const res = await getMedicines(token!);
    setMedicines(res);
  };

  // Modificado: handleSubmit ahora valida antes de enviar
  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (editingId) {
      await updateMedicine(editingId, form, token!);
    } else {
      await createMedicine(form, token!);
    }
    await loadMedicines();
    setForm({ name: '', description: '', stock: 0, price: 0, expirationDate: '', lot: '' });
    setEditingId(null);
    setErrors({});
  };

  const handleEdit = (med: any) => {
    setForm({
      name: med.name,
      description: med.description || '',
      stock: med.stock,
      price: med.price,
      expirationDate: med.expirationDate.split('T')[0],
      lot: med.lot,
    });
    setEditingId(med.id);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Seguro que deseas eliminar este medicamento?')) {
      await deleteMedicine(id, token!);
      await loadMedicines();
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Inventario de Medicamentos</h1>

      {/* Formulario */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <input
            type="text"
            placeholder="Nombre"
            value={form.name}
            onChange={(e) => {
              setForm({ ...form, name: e.target.value });
              if (errors.name) validateForm();
            }}
            className={`border p-2 w-full ${errors.name ? 'border-red-500' : ''}`}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>
        <div>
          <input
            type="text"
            placeholder="Descripción"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border p-2 w-full"
          />
          {/* No hay validación para descripción */}
        </div>
        <div>
          <input
            type="number"
            placeholder="Stock"
            value={form.stock}
            onChange={(e) => {
              setForm({ ...form, stock: Number(e.target.value) });
              if (errors.stock) validateForm();
            }}
            className={`border p-2 w-full ${errors.stock ? 'border-red-500' : ''}`}
          />
          {errors.stock && <p className="text-red-500 text-sm">{errors.stock}</p>}
        </div>
        <div>
          <input
            type="number"
            placeholder="Precio"
            value={form.price}
            onChange={(e) => {
              setForm({ ...form, price: Number(e.target.value) });
              if (errors.price) validateForm();
            }}
            className={`border p-2 w-full ${errors.price ? 'border-red-500' : ''}`}
          />
          {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
        </div>
        <div>
          <input
            type="date"
            value={form.expirationDate}
            onChange={(e) => {
              setForm({ ...form, expirationDate: e.target.value });
              if (errors.expirationDate) validateForm();
            }}
            className={`border p-2 w-full ${errors.expirationDate ? 'border-red-500' : ''}`}
          />
          {errors.expirationDate && <p className="text-red-500 text-sm">{errors.expirationDate}</p>}
        </div>
        <div>
          <input
            type="text"
            placeholder="Lote"
            value={form.lot}
            onChange={(e) => {
              setForm({ ...form, lot: e.target.value });
              if (errors.lot) validateForm();
            }}
            className={`border p-2 w-full ${errors.lot ? 'border-red-500' : ''}`}
          />
          {errors.lot && <p className="text-red-500 text-sm">{errors.lot}</p>}
        </div>
      </div>

      <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">
        {editingId ? 'Actualizar' : 'Registrar'} medicamento
      </button>

      {/* Tabla */}
      <table className="mt-6 w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Nombre</th>
            <th className="border p-2">Stock</th>
            <th className="border p-2">Precio</th>
            <th className="border p-2">Vencimiento</th>
            <th className="border p-2">Lote</th>
            <th className="border p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {medicines.map((med: any) => (
            <tr key={med.id}>
              <td className="border p-2">{med.name}</td>
              <td className="border p-2">{med.stock}</td>
              <td className="border p-2">${med.price.toFixed(2)}</td>
              <td className="border p-2">{new Date(med.expirationDate).toLocaleDateString()}</td>
              <td className="border p-2">{med.lot}</td>
              <td className="border p-2 space-x-2">
                <button onClick={() => handleEdit(med)} className="bg-yellow-400 px-2 py-1 text-white rounded">Editar</button>
                <button onClick={() => handleDelete(med.id)} className="bg-red-600 px-2 py-1 text-white rounded">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Inventory;
