import React, { useEffect, useState } from 'react';
import { getAuditLogs } from '../services/audit.service';
import { useUserStore } from '../store/user';

const Audit = () => {
  const token = useUserStore((s) => s.token);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const data = await getAuditLogs(token!);
      setLogs(data);
    };
    fetchLogs();
  }, [token]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Registro de Auditoría</h2>

      <table className="w-full table-auto border text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Usuario</th>
            <th className="p-2 border">Acción</th>
            <th className="p-2 border">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log: any) => (
            <tr key={log.id}>
              <td className="border p-2">{log.id}</td>
              <td className="border p-2">{log.user.name}</td>
              <td className="border p-2">{log.action}</td>
              <td className="border p-2">{new Date(log.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Audit;
