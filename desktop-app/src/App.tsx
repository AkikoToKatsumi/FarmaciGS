// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Clients from './pages/Clients';
import Reports from './pages/Reports';
import Admin from './pages/Admin';
import Login from './pages/Login';
import { useUserStore } from './store/user';
import { useEffect } from 'react';

export default function App() {
  const { user, setUser, isAuthenticated } = useUserStore();

  console.log('Usuario actual:', user);
  console.log('¿Está autenticado?:', isAuthenticated());

  useEffect(() => {
    // Recuperar datos del localStorage al iniciar la app
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    console.log('Datos del localStorage:', { storedUser, storedToken });
    
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser, storedToken);
        console.log('Usuario restaurado desde localStorage:', parsedUser);
      } catch (error) {
        console.error('Error al parsear usuario del localStorage:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, [setUser]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Rutas protegidas */}
      {isAuthenticated() ? (
        <>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </>
      ) : (
        <>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}
    </Routes>
  );
}