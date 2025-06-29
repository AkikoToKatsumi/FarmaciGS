import React, { useEffect, useState } from 'react';
import { useUserStore } from '../store/user';
import {
  getSalesReport,
  getExpiringSoonReport,
  getStockLowReport,
} from '../services/report.service';
// Corrige la importación: no existen downloadBackup ni restoreBackup
import { createBackup } from '../services/backup.service';

const Reports = () => {
  const token = useUserStore((s) => s.token);
  const [sales, setSales] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    const loadReports = async () => {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const s = await getSalesReport(weekAgo, today, token!);
      const e = await getExpiringSoonReport(token!);
      const l = await getStockLowReport(token!);

      setSales(s);
      setExpiring(e);
      setLowStock(l);
    };
    loadReports();
  }, [token]);

  // Exportar a CSV
  const exportSalesCSV = () => {
    const header = ['ID', 'Cliente', 'Total'];
    const rows = sales.map((s: any) => [
      s.id,
      s.client?.name || 'Cliente General',
      s.total,
    ]);
    const csvContent = [header, ...rows].map((r) => r.join(',')).join('\n');
    downloadCSV(csvContent, 'ventas.csv');
  };

  const exportExpiringCSV = () => {
    const header = ['ID', 'Nombre', 'Fecha de Vencimiento'];
    const rows = expiring.map((m: any) => [
      m.id,
      m.name,
      new Date(m.expirationDate).toLocaleDateString(),
    ]);
    const csvContent = [header, ...rows].map((r) => r.join(',')).join('\n');
    downloadCSV(csvContent, 'por_vencer.csv');
  };

  const exportLowStockCSV = () => {
    const header = ['ID', 'Nombre', 'Stock'];
    const rows = lowStock.map((m: any) => [
      m.id,
      m.name,
      m.stock,
    ]);
    const csvContent = [header, ...rows].map((r) => r.join(',')).join('\n');
    downloadCSV(csvContent, 'stock_bajo.csv');
  };

  function downloadCSV(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Backup manual
  const handleBackup = async () => {
    await createBackup(token!);
  };

  // Restore manual (no implementado en el servicio frontend)
  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    alert('Funcionalidad de restaurar backup no implementada en frontend.');
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Reportes</h2>

      {/* Backup y Restore */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={handleBackup}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Descargar Backup
        </button>
        <label className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer">
          Restaurar Backup
          <input
            type="file"
            accept=".json"
            onChange={handleRestore}
            className="hidden"
          />
        </label>
      </div>

      <section>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Ventas (últimos 7 días)</h3>
          <button
            onClick={exportSalesCSV}
            className="bg-gray-300 px-2 py-1 rounded text-sm"
          >
            Exportar CSV
          </button>
        </div>
        <ul className="border p-4">
          {sales.map((s: any) => (
            <li key={s.id}>
              #{s.id} - {s.client?.name || 'Cliente General'} - RD${s.total}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Medicamentos por vencer</h3>
          <button
            onClick={exportExpiringCSV}
            className="bg-gray-300 px-2 py-1 rounded text-sm"
          >
            Exportar CSV
          </button>
        </div>
        <ul className="border p-4">
          {expiring.map((m: any) => (
            <li key={m.id}>
              {m.name} - Vence:{' '}
              {new Date(m.expirationDate).toLocaleDateString()}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Stock Bajo</h3>
          <button
            onClick={exportLowStockCSV}
            className="bg-gray-300 px-2 py-1 rounded text-sm"
          >
            Exportar CSV
          </button>
        </div>
        <ul className="border p-4">
          {lowStock.map((m: any) => (
            <li key={m.id}>
              {m.name} - Quedan: {m.stock}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Reports;
