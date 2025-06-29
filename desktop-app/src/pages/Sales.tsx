import React, { useEffect, useState } from 'react';
// Corrige la importación del servicio de clientes
import { getClients } from '../services/client.service';
import { getSales, createSale, deleteSale } from '../services/sales.service';
import { getMedicines } from '../services/inventory.service';
import { useUserStore } from '../store/user';

// Define los tipos para evitar errores de tipo 'never'
type SaleItem = {
  medicineId: string;
  quantity: number;
};

type SaleForm = {
  clientId: string;
  items: SaleItem[];
};

const Sales = () => {
  const token = useUserStore((s) => s.token);
  const [sales, setSales] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [form, setForm] = useState<SaleForm>({
    clientId: '',
    items: [] as SaleItem[],
  });

  // Filtro por fechas
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });

  useEffect(() => {
    loadSales();
    loadClients();
    loadMedicines();
  }, []);

  const loadSales = async () => {
    const res = await getSales(token!);
    setSales(res);
  };

  const loadClients = async () => {
    const res = await getClients(token!);
    setClients(res);
  };

  const loadMedicines = async () => {
    const res = await getMedicines(token!);
    setMedicines(res);
  };

  const handleAddItem = () => {
    setForm({
      ...form,
      items: [...form.items, { medicineId: '', quantity: 1 }],
    });
  };

  const handleItemChange = <K extends keyof SaleItem>(index: number, field: K, value: SaleItem[K]) => {
    const updatedItems = [...form.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setForm({ ...form, items: updatedItems });
  };

  const handleSubmit = async () => {
    await createSale(form, token!);
    setForm({ clientId: '', items: [] });
    loadSales();
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar esta venta?')) {
      await deleteSale(id, token!);
      loadSales();
    }
  };

  // Filtrar ventas por fecha
  const filteredSales = sales.filter((s: any) => {
    const saleDate = new Date(s.createdAt);
    const from = dateFilter.from ? new Date(dateFilter.from) : null;
    const to = dateFilter.to ? new Date(dateFilter.to) : null;
    if (from && saleDate < from) return false;
    if (to && saleDate > to) return false;
    return true;
  });

  // Exportar a CSV
  const exportCSV = () => {
    const header = [
      'ID',
      'Cliente',
      'Usuario',
      'Fecha',
      'Total',
      'Productos'
    ];
    const rows = filteredSales.map((s: any) => [
      s.id,
      s.client?.name || 'Consumidor final',
      s.user?.name || '',
      new Date(s.createdAt).toLocaleString(),
      s.total.toFixed(2),
      (s.items || []).map((item: any) => {
        const med = medicines.find((m: any) => m.id === item.medicineId);
        return `${med?.name || ''} x${item.quantity}`;
      }).join('; ')
    ]);
    const csvContent =
      [header, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ventas.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Ventas</h1>

      {/* Filtros */}
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm">Desde</label>
          <input
            type="date"
            value={dateFilter.from}
            onChange={e => setDateFilter({ ...dateFilter, from: e.target.value })}
            className="border p-2"
          />
        </div>
        <div>
          <label className="block text-sm">Hasta</label>
          <input
            type="date"
            value={dateFilter.to}
            onChange={e => setDateFilter({ ...dateFilter, to: e.target.value })}
            className="border p-2"
          />
        </div>
        <button onClick={exportCSV} className="bg-blue-600 text-white px-4 py-2 rounded self-end">
          Exportar CSV
        </button>
      </div>

      {/* Formulario */}
      <div className="mb-4">
        <select
          value={form.clientId}
          onChange={(e) => setForm({ ...form, clientId: e.target.value })}
          className="border p-2 mb-2 w-full"
        >
          <option value="">Seleccionar cliente</option>
          {clients.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {form.items.map((item, idx) => (
          <div key={idx} className="grid grid-cols-2 gap-2 mb-2">
            <select
              value={item.medicineId}
              onChange={(e) => handleItemChange(idx, 'medicineId', e.target.value)}
              className="border p-2"
            >
              <option value="">Medicamento</option>
              {medicines.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
              className="border p-2"
              placeholder="Cantidad"
            />
          </div>
        ))}

        <button onClick={handleAddItem} className="bg-gray-300 px-4 py-1 mb-2 rounded">
          Añadir producto
        </button>

        <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded">
          Registrar venta
        </button>
      </div>

      {/* Tabla de ventas */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">Cliente</th>
            <th className="border p-2">Usuario</th>
            <th className="border p-2">Fecha</th>
            <th className="border p-2">Total</th>
            <th className="border p-2">Productos</th>
            <th className="border p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredSales.map((s: any) => (
            <tr key={s.id}>
              <td className="border p-2">{s.id}</td>
              <td className="border p-2">{s.client?.name || 'Consumidor final'}</td>
              <td className="border p-2">{s.user?.name || ''}</td>
              <td className="border p-2">{new Date(s.createdAt).toLocaleString()}</td>
              <td className="border p-2">${s.total.toFixed(2)}</td>
              <td className="border p-2">
                {/* Detalle de productos vendidos */}
                <ul className="list-disc pl-4">
                  {(s.items || []).map((item: any, idx: number) => {
                    const med = medicines.find((m: any) => m.id === item.medicineId);
                    return (
                      <li key={idx}>
                        {med?.name || 'Producto'} x{item.quantity}
                      </li>
                    );
                  })}
                </ul>
              </td>
              <td className="border p-2">
                <button onClick={() => handleDelete(s.id)} className="bg-red-500 px-2 py-1 text-white rounded">
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

export default Sales;
