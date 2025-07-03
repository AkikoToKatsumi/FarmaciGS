// src/pages/Admin.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/user';

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();

  if (user?.role_name !== 'admin') {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Acceso Denegado</h1>
        <p>No tienes permisos para acceder a esta página</p>
        <button onClick={() => navigate('/dashboard')}>Volver al Dashboard</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={() => navigate('/dashboard')} style={{ marginBottom: '20px', padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}>
        ← Volver al Dashboard
      </button>
      <h1>Panel de Administración</h1>
      <p>Página de administración del sistema</p>
    </div>
  );
};

export default Admin;