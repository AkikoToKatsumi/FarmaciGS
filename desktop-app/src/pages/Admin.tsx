import React, { useEffect } from 'react';
import { useUserStore } from '../store/user';
import Employees from './Employees';
import Roles from './Roles';

const AdminPanel = () => {
  const user = useUserStore((s) => s.user);

  if (!user || user.role?.name !== 'Administrador') {
    return (
      <div className="p-6 text-red-500 font-semibold">
        No tienes permiso para acceder a este módulo.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Panel de Administración</h2>

      <section>
        <h3 className="text-xl font-semibold mb-2">Gestión de Roles</h3>
        <Roles />
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-2">Gestión de Empleados</h3>
        <Employees />
      </section>
    </div>
  );
};

export default AdminPanel;
