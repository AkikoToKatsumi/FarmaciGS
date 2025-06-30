import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '../services/dashboard.service';
import { useUserStore } from '../store/user';
import StatCard from '../components/common/StatCard';
// Asegúrate de instalar recharts y sus tipos ejecutando:
// npm install recharts
// 
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const Dashboard = () => {
  const token = useUserStore((s) => s.token);
  const user = useUserStore((s) => s.user);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });
  const [branch, setBranch] = useState('');
  // No uses chartData si no tienes salesByDay
  // const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Corrige la comparación de rol
    if (!user?.role || user.role.name !== 'Administrador') return;
    const loadStats = async () => {
      // Solo pasa el token, ya que getDashboardStats espera solo 1 argumento
      const res = await getDashboardStats(token!);
      setStats(res);
      setLoading(false);
    };
    loadStats();
  }, [token, user]);

  const exportMetrics = () => {
    if (!stats) return;
    const rows = [
      ['Ventas Hoy', stats.salesToday],
      ['Ventas del Mes', stats.salesMonth],
      ['Clientes', stats.clients],
      ['Stock Bajo', stats.lowStock]
    ];
    const csvContent = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'metricas_dashboard.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Corrige la comparación de rol aquí también
  if (!user || !user.role || user.role.name !== 'Administrador') {
    return <div className="p-6 text-red-600">Acceso restringido solo para administradores.</div>;
  }

  if (loading) return <div className="p-6">Cargando estadísticas...</div>;

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Panel de Control</h2>

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
        <div>
          <label className="block text-sm">Sucursal</label>
          <select
            value={branch}
            onChange={e => setBranch(e.target.value)}
            className="border p-2"
          >
            <option value="">Todas</option>
            <option value="principal">Principal</option>
            <option value="sucursal2">Sucursal 2</option>
          </select>
        </div>
        <button onClick={exportMetrics} className="bg-blue-600 text-white px-4 py-2 rounded self-end">
          Exportar métricas
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Ventas Hoy" value={`RD$ ${stats.salesToday}`} color="bg-green-600" />
        <StatCard title="Ventas del Mes" value={`RD$ ${stats.salesMonth}`} color="bg-blue-600" />
        <StatCard title="Clientes" value={stats.clients} color="bg-purple-600" />
        <StatCard title="Stock Bajo" value={stats.lowStock} color="bg-red-600" />
      </div>

      {/* Si no tienes datos para la gráfica, puedes ocultarla o mostrar un placeholder */}
      {/* <div className="bg-white p-4 rounded shadow mt-4">
        <h3 className="text-lg font-semibold mb-2">Ventas por Día</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#3182ce" />
          </BarChart>
        </ResponsiveContainer>
      </div> */}

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Últimas Ventas</h3>
        <ul className="border p-4 space-y-2 max-h-72 overflow-y-auto">
          {stats.latestSales.map((sale: any) => (
            <li key={sale.id} className="flex justify-between border-b pb-1">
              <span>
                #{sale.id} - {sale.client?.name || 'Cliente General'}
              </span>
              <span className="text-green-700 font-bold">RD$ {sale.total}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
