import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Clients from './pages/Clients';
import Reports from './pages/Reports';
import Admin from './pages/Admin';
import Login from './pages/Login';
import { useUserStore } from './store/user';

export default function App() {
  const { user } = useUserStore();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      {/* Rutas protegidas */}
      {user ? (
        <>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </>
      ) : (
        <Route path="/" element={<Navigate to="/login" />} />
      )}
    </Routes>
  );
}
