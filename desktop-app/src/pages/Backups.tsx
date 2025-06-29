import React, { useEffect, useState } from 'react';
import { createBackup, getBackups, deleteBackup } from '../services/backup.service';
import { useUserStore } from '../store/user';

const Backups = () => {
  const token = useUserStore(s => s.token)!;
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBackups = async () => {
    const result = await getBackups(token);
    setBackups(result);
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      await createBackup(token);
      await fetchBackups();
      alert('Backup creado correctamente');
    } catch (err) {
      alert('Error al crear backup');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!window.confirm(`¿Eliminar ${filename}?`)) return;
    await deleteBackup(filename, token);
    await fetchBackups();
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Gestión de Backups</h2>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4 disabled:opacity-50"
        onClick={handleCreate}
        disabled={loading}
      >
        {loading ? 'Creando...' : 'Crear Backup'}
      </button>

      <table className="w-full border text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">Nombre</th>
            <th className="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {backups.map((b) => (
            <tr key={b.id}>
              <td className="p-2 border">{b.name}</td>
              <td className="p-2 border space-x-2">
                <a
                  href={`http://localhost:4000/backups/${b.name}`}
                  className="text-blue-600 underline"
                  download
                >
                  Descargar
                </a>
                <button
                  onClick={() => handleDelete(b.name)}
                  className="text-red-500 underline"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
          {backups.length === 0 && (
            <tr>
              <td colSpan={2} className="text-center p-4">
                No hay backups aún.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Backups;
