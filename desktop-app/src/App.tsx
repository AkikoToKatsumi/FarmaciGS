// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from './store/User';
import { useEffect } from 'react';

// Importar páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
// Corrige el import para Sales (no default export)
import CategoryManager from './pages/CategoryManager';
import Sales from './pages/Sales';
import Clients from './pages/Clients';
import Reports from './pages/Reports';
import Admin from './pages/Admin';

import User from './pages/Users';
import Roles from './pages/Roles';
import Prescriptions from './pages/Prescriptions';

import Providers from './pages/providers';
import { Users } from 'lucide-react';


export default function App() {
  const { user, setUser } = useUserStore();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser, storedToken);
      } catch (error) {
        console.error('Error al parsear usuario desde localStorage:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, [setUser]);

  console.log('Usuario actual:', user);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Rutas protegidas */}
      {user ? (
        <>
          <Route path="/categories" element={<CategoryManager />} />
         <Route path="/providers" element={<Providers />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/clients" element={<Clients />} />
          { <Route path="/reports" element={<Reports />} /> }
          <Route path="/admin" element={<Admin />} />
          <Route path="/users" element={<User />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/prescriptions" element={<Prescriptions />} />
         
         
        
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </>
      ) : (
        <>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      )}
    </Routes>
  );
}