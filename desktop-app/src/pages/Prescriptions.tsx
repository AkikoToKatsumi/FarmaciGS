import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getClients } from '../services/client.service';
import { getMedicine } from '../services/inventory.service';
import { getPrescriptionsByClient, createPrescription } from '../services/prescription.service';
import { useUserStore } from '../store/user';

// Styled Components
const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f8f9fa;
  min-height: 100vh;
`;

const BackButton = styled.button`
  background-color: #f3f4f6;
  color: #374151;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.04);
  transition: background 0.25s, color 0.25s, box-shadow 0.25s, transform 0.15s;

  &:hover {
    background: linear-gradient(90deg, #2563eb 0%, #60a5fa 100%);
    color: #fff;
    box-shadow: 0 4px 16px rgba(37, 99, 235, 0.15);
    transform: translateY(-2px) scale(1.03);
  }
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #2c3e50;
  text-align: center;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #007bff, #0056b3);
    border-radius: 2px;
  }
`;

const FormSection = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #495057;
  font-size: 0.95rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  &:hover {
    border-color: #ced4da;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  &:hover {
    border-color: #ced4da;
  }

  &[type="number"] {
    width: 80px;
    text-align: center;
  }
`;

const MedicineGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  max-height: 300px;
  overflow-y: auto;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  background-color: #f8f9fa;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;

    &:hover {
      background: #a8a8a8;
    }
  }
`;

const MedicineItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border-color: #007bff;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  font-weight: 500;
  color: #495057;
  cursor: pointer;
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #007bff;
`;

const QuantityContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #f8f9fa;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #e9ecef;
`;

const QuantityLabel = styled.span`
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 500;
`;

const ErrorMessage = styled.p`
  color: #dc3545;
  font-weight: 500;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  text-align: center;
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(40, 167, 69, 0.2);
  display: block;
  margin: 0 auto;

  &:hover {
    background: linear-gradient(135deg, #218838, #1e7e34);
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(40, 167, 69, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const HistorySection = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  margin-top: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
`;

const HistoryTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '📋';
    font-size: 1.2rem;
  }
`;

const HistoryList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background-color: #f8f9fa;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;

    &:hover {
      background: #a8a8a8;
    }
  }
`;

const HistoryItem = styled.li`
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  background: white;
  margin: 0.5rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  &:hover {
    background-color: #f8f9fa;
    transform: translateX(4px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const PrescriptionInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const PrescriptionId = styled.span`
  font-weight: 600;
  color: #007bff;
  font-size: 1.1rem;
`;

const PrescriptionDate = styled.span`
  color: #6c757d;
  font-size: 0.9rem;
`;

const MedicineList = styled.ul`
  list-style-type: disc;
  padding-left: 20px;
  margin-top: 0.75rem;
  color: #495057;
  width: 100%;
`;

const MedicineListItem = styled.li`
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
`;

const Prescriptions = () => {
  const token = useUserStore((s) => s.token);
  const [clients, setClients] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [selectedMedicines, setSelectedMedicines] = useState<{ id: number; quantity: number }[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Nuevo estado para el filtro de búsqueda de productos
  const [medicineSearch, setMedicineSearch] = useState('');

  const userRole = localStorage.getItem('userRole');
  console.log('Rol del usuario:', userRole);

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
    const res = await getMedicine();
    setMedicines(res);
  };

  const loadPrescriptions = async (clientId: number) => {
    try {
      const res = await getPrescriptionsByClient(clientId, token!, );
      setPrescriptions(res);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      setPrescriptions([]);
    }
  };

  const handleToggleMedicine = (id: number) => {
    const existingIndex = selectedMedicines.findIndex((med) => med.id === id);
    if (existingIndex >= 0) {
      setSelectedMedicines((prev) => prev.filter((med) => med.id !== id));
    } else {
      setSelectedMedicines((prev) => [...prev, { id, quantity: 1 }]);
    }
  };

  const handleQuantityChange = (id: number, quantity: number) => {
    setSelectedMedicines((prev) =>
      prev.map((med) => (med.id === id ? { ...med, quantity } : med))
    );
  };

  const handleCreatePrescription = async () => {
    if (!selectedClient || selectedMedicines.length === 0) {
      setError('Selecciona un cliente y al menos un medicamento.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Mapear selectedMedicines al formato correcto que espera el backend
      const medicinesForBackend = selectedMedicines.map(med => ({
        medicineId: med.id,
        quantity: med.quantity
      }));

      const res = await createPrescription(selectedClient, medicinesForBackend, token!);
      alert(res.message);
      
      // Recargar las recetas después de crear una nueva
      loadPrescriptions(selectedClient);
      
      // Limpiar la selección de medicamentos
      setSelectedMedicines([]);
      setError('');
      
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Error al crear receta');
    } finally {
      setLoading(false);
    }
  };

  const isMedicineSelected = (id: number) => {
    return selectedMedicines.some((med) => med.id === id);
  };

  const getMedicineQuantity = (id: number) => {
    const medicine = selectedMedicines.find((med) => med.id === id);
    return medicine?.quantity || 1;
  };

  // Filtrar los medicamentos según el término de búsqueda
  const filteredMedicines = medicines.filter((m) =>
    m.name.toLowerCase().includes(medicineSearch.toLowerCase()) ||
    (m.description && m.description.toLowerCase().includes(medicineSearch.toLowerCase()))
  );

  return (
    <Container>
      <BackButton onClick={() => window.history.back()}>← Volver</BackButton>

      <Title>Asignar Receta Médica</Title>

      <FormSection>
        <FormGroup>
          <Label>Selecciona un Cliente:</Label>
          <Select
            value={selectedClient || ''}
            onChange={(e) => setSelectedClient(Number(e.target.value))}
          >
            <option value="">-- Selecciona un cliente --</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </FormGroup>

        {/* Buscador de productos */}
        <FormGroup>
          <Label>Buscar producto:</Label>
          <Input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={medicineSearch}
            onChange={e => setMedicineSearch(e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <Label>Selecciona medicamentos y cantidades:</Label>
          <MedicineGrid>
            {filteredMedicines.map((m) => (
              <MedicineItem key={m.id}>
                <CheckboxLabel>
                  <Checkbox
                    checked={isMedicineSelected(m.id)}
                    onChange={() => handleToggleMedicine(m.id)}
                  />
                  {m.name}
                </CheckboxLabel>
                {isMedicineSelected(m.id) && (
                  <QuantityContainer>
                    <QuantityLabel>Cantidad:</QuantityLabel>
                    <Input
                      type="number"
                      min="1"
                      value={getMedicineQuantity(m.id)}
                      onChange={(e) =>
                        handleQuantityChange(m.id, parseInt(e.target.value) || 1)
                      }
                    />
                  </QuantityContainer>
                )}
              </MedicineItem>
            ))}
          </MedicineGrid>
        </FormGroup>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <SubmitButton onClick={handleCreatePrescription} disabled={loading}>
          {loading ? 'Creando Receta...' : 'Crear Receta Médica'}
        </SubmitButton>
      </FormSection>

      {selectedClient && prescriptions.length > 0 && (
        <HistorySection>
          <HistoryTitle>Historial de Recetas</HistoryTitle>
          <HistoryList>
            {prescriptions.map((p) => (
              <HistoryItem key={p.id}>
                <PrescriptionInfo>
                  <PrescriptionId>Receta #{p.id}</PrescriptionId>
                  <PrescriptionDate>
                    {new Date(p.issued_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </PrescriptionDate>
                </PrescriptionInfo>
                <MedicineList>
                  {/* Cambiar 'medicines' por 'medicine' para coincidir con el backend */}
                  {p.medicine?.map((med: any) => (
                    <MedicineListItem key={med.id}>
                      {med.name} - {med.quantity} unidad(es)
                    </MedicineListItem>
                  ))}
                </MedicineList>
              </HistoryItem>
            ))}
          </HistoryList>
        </HistorySection>
      )}
    </Container>
  );
};

export default Prescriptions;