// src/pages/Sales.tsx
import React, { useState, useEffect } from 'react';
import { useUserStore } from '../store/user';
import { useNavigate } from 'react-router-dom';

interface Sale {
  id: number;
  client_name: string;
  total: number;
  date: string;
  employee_name: string;
  status: string;
}

const Sales = () => {
  const { user, clearUser } = useUserStore();
  const navigate = useNavigate();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [formData, setFormData] = useState({
    client_name: '',
    total: '',
    status: 'completed'
  });

  useEffect(() => {
    // Simulación de carga de datos
    setTimeout(() => {
      setSales([
        {
          id: 1,
          client_name: 'Juan Pérez',
          total: 45.50,
          date: '2025-01-15',
          employee_name: user?.name || 'Admin',
          status: 'completed'
        },
        {
          id: 2,
          client_name: 'María García',
          total: 123.75,
          date: '2025-01-14',
          employee_name: user?.name || 'Admin',
          status: 'completed'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSale) {
      // Actualizar venta
      setSales(sales.map(sale => 
        sale.id === editingSale.id 
          ? { ...sale, ...formData, total: parseFloat(formData.total) }
          : sale
      ));
    } else {
      // Crear nueva venta
      const newSale: Sale = {
        id: Date.now(),
        client_name: formData.client_name,
        total: parseFloat(formData.total),
        date: new Date().toISOString().split('T')[0],
        employee_name: user?.name || 'Admin',
        status: formData.status
      };
      setSales([...sales, newSale]);
    }
    
    setFormData({ client_name: '', total: '', status: 'completed' });
    setEditingSale(null);
    setShowForm(false);
  };

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
    setFormData({
      client_name: sale.client_name,
      total: sale.total.toString(),
      status: sale.status
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta venta?')) {
      setSales(sales.filter(sale => sale.id !== id));
    }
  };

  const handleLogout = () => {
    clearUser();
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Cargando ventas...</div>;
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Gestión de Ventas</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button onClick={handleLogout}>Cerrar Sesión</button>
        </div>
      </header>

      <div className="page-content">
        <div className="actions-bar">
          <button 
            className="btn-primary" 
            onClick={() => setShowForm(true)}
          >
            Nueva Venta
          </button>
        </div>

        {showForm && (
          <div className="modal">
            <div className="modal-content">
              <h3>{editingSale ? 'Editar Venta' : 'Nueva Venta'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Cliente:</label>
                  <input
                    type="text"
                    value={formData.client_name}
                    onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Total:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.total}
                    onChange={(e) => setFormData({...formData, total: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Estado:</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="completed">Completada</option>
                    <option value="pending">Pendiente</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    {editingSale ? 'Actualizar' : 'Crear'}
                  </button>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => {
                      setShowForm(false);
                      setEditingSale(null);
                      setFormData({ client_name: '', total: '', status: 'completed' });
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Fecha</th>
                <th>Empleado</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(sale => (
                <tr key={sale.id}>
                  <td>{sale.id}</td>
                  <td>{sale.client_name}</td>
                  <td>${sale.total.toFixed(2)}</td>
                  <td>{sale.date}</td>
                  <td>{sale.employee_name}</td>
                  <td>
                    <span className={`status ${sale.status}`}>
                      {sale.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(sale)}
                    >
                      Editar
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(sale.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Sales;