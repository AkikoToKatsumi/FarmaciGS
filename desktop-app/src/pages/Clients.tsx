import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getClients, createClient, updateClient, deleteClient } from '../services/client.service';
import { useNavigate } from 'react-router-dom';

import { useUserStore } from '../store/user';

// Styled Components
const Container = styled.div`
  padding: 20px;
`;

const BackButton = styled.button`
  margin-bottom: 20px;
  padding: 8px 16px;
  background-color: #ffffff;
  color: black;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const Card = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.10);
  padding: 32px;
  max-width: 1100px;
  margin: 32px auto;
  min-height: 400px;
`;

const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 24px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const InputContainer = styled.div<{ flex?: number }>`
  flex: ${props => props.flex || 1};
  min-width: 200px;
`;

const FormInput = styled.input<{ hasError?: boolean }>`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid ${props => props.hasError ? '#ef4444' : '#d1d5db'};
  font-size: 1rem;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const ErrorText = styled.p`
  color: #ef4444;
  font-size: 0.95rem;
  margin: 4px 0 0 4px;
`;

const SubmitButton = styled.button`
  background: #22c55e;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 700;
  font-size: 1rem;
  margin-top: 8px;
  margin-bottom: 16px;
  cursor: pointer;
  
  &:hover {
    background: #16a34a;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px;
`;

const TableHeader = styled.th`
  background: #f3f4f6;
  font-weight: 700;
  padding: 12px;
  border: none;
`;

const TableRow = styled.tr`
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const TableCell = styled.td`
  background: #f9fafb;
  padding: 12px;
  border: none;
  border-radius: 8px;
`;

const ActionButton = styled.button<{ variant: 'edit' | 'delete' }>`
  margin-right: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  
  ${props => props.variant === 'edit' && `
    background: #3b82f6;
    color: #fff;
    
    &:hover {
      background: #2563eb;
    }
  `}
  
  ${props => props.variant === 'delete' && `
    background: #ef4444;
    color: #fff;
    
    &:hover {
      background: #dc2626;
    }
  `}
`;

const PaginationContainer = styled.div`
  margin-top: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
`;

const Select = styled.select`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 1rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const Label = styled.label`
  font-weight: 600;
  font-size: 0.95rem;
  color: #374151;
`;

const BaseButton = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  background: #3b82f6;
  color: white;
  
  &:hover {
    background: #2563eb;
  }
  
  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const PageButton = styled(BaseButton)`
  margin: 0 8px;
`;

const PageInfo = styled.span`
  font-size: 0.95rem;
  color: #6b7280;
`;

const PageSizeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

const Clients = () => {
  const token = useUserStore((s) => s.token);
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', rnc: '', cedula: '', address: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when page size changes
  };

  const totalPages = Math.ceil(clients.length / pageSize);

  const currentClients = clients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePreviousPage = () => {
    setCurrentPage(Math.max(1, currentPage - 1));
  };
  
  const handleNextPage = () => {
    setCurrentPage(Math.min(totalPages, currentPage + 1));
  };

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    const res = await getClients(token!);
    setClients(res);
  };

  const validateForm = () => {
    const e: { [key: string]: string } = {};
    if (!form.name.trim()) e.name = 'El nombre es obligatorio';
    if (form.email && !form.email.includes('@')) e.email = 'Email inválido';
    if (form.phone && form.phone.length < 7) e.phone = 'Teléfono inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (editingId) {
      await updateClient(editingId, form, token!);
    } else {
      await createClient(form, token!);
    }

    setForm({ name: '', email: '', phone: '', rnc: '', cedula: '', address: '' });
    setEditingId(null);
    setErrors({});
    loadClients();
  };

  const handleEdit = (c: any) => {
    setForm({ 
      name: c.name || '', 
      email: c.email || '', 
      phone: c.phone || '',
      rnc: c.rnc || '',
      cedula: c.cedula || '',
      address: c.address || ''
    });
    setEditingId(c.id);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar este cliente?')) {
      await deleteClient(id, token!);
      loadClients();
    }
  };

  return (
    <Container>
      <BackButton onClick={() => navigate('/dashboard')}>
       Volver a Inicio
      </BackButton>

      <Card>
        <Title>Clientes</Title>
        
        <FormRow>
          <InputContainer>
            <FormInput
              type="text"
              placeholder="Nombre"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              hasError={!!errors.name}
            />
            {errors.name && <ErrorText>{errors.name}</ErrorText>}
          </InputContainer>
          
          <InputContainer>
            <FormInput
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              hasError={!!errors.email}
            />
            {errors.email && <ErrorText>{errors.email}</ErrorText>}
          </InputContainer>
          
          <InputContainer>
            <FormInput
              type="text"
              placeholder="Teléfono"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              hasError={!!errors.phone}
            />
            {errors.phone && <ErrorText>{errors.phone}</ErrorText>}
          </InputContainer>
        </FormRow>

        <FormRow>
          <InputContainer>
            <FormInput
              type="text"
              placeholder="RNC (Opcional)"
              value={form.rnc}
              onChange={(e) => setForm({ ...form, rnc: e.target.value })}
            />
          </InputContainer>
          
          <InputContainer>
            <FormInput
              type="text"
              placeholder="Cédula (Opcional)"
              value={form.cedula}
              onChange={(e) => setForm({ ...form, cedula: e.target.value })}
            />
          </InputContainer>
          
          <InputContainer flex={2}>
            <FormInput
              type="text"
              placeholder="Dirección (Opcional)"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </InputContainer>
        </FormRow>

        <SubmitButton onClick={handleSubmit}>
          {editingId ? 'Actualizar' : 'Crear'} Cliente
        </SubmitButton>

        <PageSizeContainer>
          <Label htmlFor="pageSize">Clientes por página:</Label>
          <Select id="pageSize" value={pageSize} onChange={handlePageSizeChange} style={{width: 100}}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </Select>
        </PageSizeContainer>

        <Table>
          <thead>
            <tr>
              <TableHeader>ID</TableHeader>
              <TableHeader>Nombre</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>Teléfono</TableHeader>
              <TableHeader>RNC</TableHeader>
              <TableHeader>Cédula</TableHeader>
              <TableHeader>Dirección</TableHeader>
              <TableHeader>Acciones</TableHeader>
            </tr>
          </thead>
          <tbody>
            {currentClients.length > 0 ? currentClients.map((c: any) => (
              <TableRow key={c.id}>
                <TableCell>{c.id}</TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>{c.phone}</TableCell>
                <TableCell>{c.rnc}</TableCell>
                <TableCell>{c.cedula}</TableCell>
                <TableCell>{c.address}</TableCell>
                <TableCell>
                  <ActionButton
                    variant="edit"
                    onClick={() => handleEdit(c)}
                  >
                    Editar
                  </ActionButton>
                  <ActionButton
                    variant="delete"
                    onClick={() => handleDelete(c.id)}
                  >
                    Eliminar
                  </ActionButton>
                </TableCell>
              </TableRow>
            )) : (
              <tr>
                <TableCell colSpan={8} style={{textAlign: 'center'}}>No hay clientes registrados.</TableCell>
              </tr>
            )}
          </tbody>
        </Table>
          
        {totalPages > 1 && (
          <PaginationContainer>
            <PageButton onClick={handlePreviousPage} disabled={currentPage === 1}>
              Anterior
            </PageButton>
            <PageInfo>Página {currentPage} de {totalPages}</PageInfo>
            <PageButton onClick={handleNextPage} disabled={currentPage === totalPages}>
              Siguiente
            </PageButton>
          </PaginationContainer>
        )}
      </Card>
    </Container>
  );
};

export default Clients;