// src/pages/Inventory.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Inventory = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={() => navigate('/dashboard')} style={{ marginBottom: '20px', padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}>
        ← Volver al Dashboard
      </button>
      <h1>Inventario</h1>
      <p>Página de gestión de inventario</p>
    </div>
  );
};

export default Inventory;