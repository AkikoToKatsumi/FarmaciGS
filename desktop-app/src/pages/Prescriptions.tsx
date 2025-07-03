import React, { useEffect, useState } from 'react';
import { getClients } from '../services/client.service';
import { getMedicines } from '../services/inventory.service';
import { createPrescription, getPrescriptions } from '../services/prescription.service';
import { useUserStore } from '../store/user';

const Prescriptions = () => {
  const token = useUserStore((s) => s.token);
  const [clients, setClients] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [selectedMedicines, setSelectedMedicines] = useState<number[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadClients();
    loadMedicines();
  }, []);

  useEffect(() => {
    if (selectedClient) loadPrescriptions(selectedClient);
  }, [selectedClient]);

  const loadClients = async () => {
    const res = await getClients(token!);
    setClients(res);
  };

  const loadMedicines = async () => {
    const res = await getMedicines(token!);
    setMedicines(res);
  };

  const loadPrescriptions = async (clientId: number) => {
    const res = await getPrescriptions(token!);
    const filtered = res.filter((p: any) => p.clientId === clientId);
    setPrescriptions(filtered);
  };

  const handleToggleMedicine = (id: number) => {
    if (selectedMedicines.includes(id)) {
      setSelectedMedicines((prev) => prev.filter((mid) => mid !== id));
    } else {
      setSelectedMedicines((prev) => [...prev, id]);
    }
  };

  const handleCreatePrescription = async () => {
    if (!selectedClient || selectedMedicines.length === 0) {
      setError('Debe seleccionar un cliente y al menos un medicamento');
      return;
    }
    setError('');
    await createPrescription(
      { clientId: selectedClient, medicineIds: selectedMedicines },
      token!
    );
    setSelectedMedicines([]);
    loadPrescriptions(selectedClient);
  };

  return (
    <div className="p-6">
      <button
        onClick={() => window.history.back()}
        style={{
          marginBottom: '20px',
          padding: '8px 16px',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px'
        }}
      >
        ← Volver
      </button>
      <h2 className="text-xl font-bold mb-4">Asignar Receta</h2>
      <div className="mb-4">
        <label className="block mb-1">Selecciona un Cliente:</label>
        <select
          className="border p-2 w-full"
          value={selectedClient || ''}
          onChange={(e) => setSelectedClient(Number(e.target.value))}
        >
          <option value="">-- Selecciona --</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-1">Selecciona medicamentos:</label>
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border p-2">
          {medicines.map((m) => (
            <label key={m.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedMedicines.includes(m.id)}
                onChange={() => handleToggleMedicine(m.id)}
              />
              {m.name}
            </label>
          ))}
        </div>
      </div>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <button
        onClick={handleCreatePrescription}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Crear Receta
      </button>
      {selectedClient && prescriptions.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Historial de Recetas</h3>
          <ul className="border p-2 space-y-2 max-h-60 overflow-y-auto">
            {prescriptions.map((p) => (
              <li key={p.id} className="border-b pb-1">
                Receta #{p.id} - {new Date(p.issuedAt).toLocaleString()} -{' '}
                <strong>{p.medicines?.length || 0} meds</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Prescriptions;
