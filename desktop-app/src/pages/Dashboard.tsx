// src/pages/Dashboard.tsx
import React from 'react';
import { useUserStore } from '../store/user';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { user, clearUser } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearUser();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Panel de Control - Farmacia</h1>
        <div className="user-info">
          <span>Bienvenido, {user?.name}</span>
          <span className="role">({user?.role_name})</span>
          <button onClick={handleLogout} className="logout-btn">
            Cerrar Sesión
          </button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button onClick={() => navigate('/inventory')}>Inventario</button>
        <button onClick={() => navigate('/sales')}>Ventas</button>
        <button onClick={() => navigate('/clients')}>Clientes</button>
        <button onClick={() => navigate('/prescriptions')}>Prescripciones</button>
        <button onClick={() => navigate('/employees')}>Empleados</button>
        <button onClick={() => navigate('/reports')}>Reportes</button>
        {user?.role_name === 'admin' && (
          <>
            <button onClick={() => navigate('/admin')}>Administración</button>
            <button onClick={() => navigate('/roles')}>Roles</button>
            <button onClick={() => navigate('/backups')}>Respaldos</button>
            <button onClick={() => navigate('/audit')}>Auditoría</button>
          </>
        )}
      </nav>

      <main className="dashboard-content">
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Ventas del Día</h3>
            <p className="dashboard-stat">$1,234.56</p>
          </div>
          <div className="dashboard-card">
            <h3>Productos Vendidos</h3>
            <p className="dashboard-stat">45</p>
          </div>
          <div className="dashboard-card">
            <h3>Clientes Atendidos</h3>
            <p className="dashboard-stat">23</p>
          </div>
          <div className="dashboard-card">
            <h3>Stock Bajo</h3>
            <p className="dashboard-stat">8</p>
          </div>
        </div>

        <div className="recent-activities">
          <h3>Actividades Recientes</h3>
          <ul>
            <li>Venta realizada - Cliente: Juan Pérez - $45.00</li>
            <li>Producto agregado - Paracetamol 500mg - 100 unidades</li>
            <li>Cliente registrado - María García</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;