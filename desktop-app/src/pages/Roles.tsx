import React, { useEffect, useState } from 'react';
import { getRoles, createRole, updateRole, deleteRole } from '../services/role.service';
import { useUserStore } from '../store/user';
import styled from 'styled-components';

// Interfaces
interface Role {
  id: number;
  name: string;
}

interface FormData {
  name: string;
}

// Styled Components
const Container = styled.div`
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const BackButton = styled.button`
  padding: 8px 16px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: #5a6268;
  }
`;

const Title = styled.h1`
  color: #333;
  margin: 0;
  font-size: 28px;
`;

const FormSection = styled.div`
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const FormTitle = styled.h2`
  margin: 0 0 15px 0;
  color: #333;
  font-size: 18px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
`;

const Input = styled.input<{ hasError?: boolean }>`
  padding: 10px 12px;
  border: 1px solid ${props => props.hasError ? '#dc3545' : '#ddd'};
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#dc3545' : '#007bff'};
    box-shadow: 0 0 0 2px ${props => props.hasError ? 'rgba(220, 53, 69, 0.25)' : 'rgba(0, 123, 255, 0.25)'};
  }
`;

const ErrorMessage = styled.p`
  color: #dc3545;
  font-size: 12px;
  margin: 5px 0 0 0;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background-color: #007bff;
          color: white;
          &:hover { background-color: #0056b3; }
          &:disabled { background-color: #6c757d; cursor: not-allowed; }
        `;
      case 'danger':
        return `
          background-color: #dc3545;
          color: white;
          &:hover { background-color: #c82333; }
        `;
      default:
        return `
          background-color: #6c757d;
          color: white;
          &:hover { background-color: #5a6268; }
        `;
    }
  }}
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-start;
`;

const TableSection = styled.div`
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const TableHeader = styled.div`
  background-color: #f8f9fa;
  padding: 15px 20px;
  border-bottom: 1px solid #ddd;
`;

const TableTitle = styled.h2`
  margin: 0;
  color: #333;
  font-size: 18px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  background-color: #f8f9fa;
  padding: 12px 15px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #dee2e6;
`;

const Td = styled.td`
  padding: 12px 15px;
  border-bottom: 1px solid #dee2e6;
  color: #666;
`;

const ActionButton = styled.button<{ variant?: 'edit' | 'delete' }>`
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  margin-right: 8px;
  transition: background-color 0.2s;
  
  ${props => {
    switch (props.variant) {
      case 'edit':
        return `
          background-color: #28a745;
          color: white;
          &:hover { background-color: #218838; }
        `;
      case 'delete':
        return `
          background-color: #dc3545;
          color: white;
          &:hover { background-color: #c82333; }
        `;
      default:
        return `
          background-color: #007bff;
          color: white;
          &:hover { background-color: #0056b3; }
        `;
    }
  }}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
`;

const Roles = () => {
  const token = useUserStore((s) => s.token);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>({ name: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const res = await getRoles(token!);
      setRoles(res);
    } catch (error) {
      console.error('Error loading roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!form.name.trim()) {
      newErrors.name = 'El nombre del rol es obligatorio';
    } else if (form.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    } else if (form.name.trim().length > 50) {
      newErrors.name = 'El nombre no puede tener más de 50 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      
      if (editingId) {
        await updateRole(editingId, form, token!);
      } else {
        await createRole(form, token!);
      }
      
      setForm({ name: '' });
      setEditingId(null);
      setErrors({});
      await loadRoles();
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Error al guardar el rol. Inténtalo de nuevo.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (role: Role) => {
    setForm({ name: role.name });
    setEditingId(role.id);
    setErrors({});
  };

  const handleCancelEdit = () => {
    setForm({ name: '' });
    setEditingId(null);
    setErrors({});
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este rol?')) {
      try {
        await deleteRole(id, token!);
        await loadRoles();
      } catch (error) {
        console.error('Error deleting role:', error);
        alert('Error al eliminar el rol. Inténtalo de nuevo.');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Limpiar errores mientras el usuario escribe
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={() => window.history.back()}>
          ← Volver
        </BackButton>
        <Title>Gestión de Roles</Title>
      </Header>

      {/* Formulario para crear/editar roles */}
      <FormSection>
        <FormTitle>
          {editingId ? 'Editar Rol' : 'Crear Nuevo Rol'}
        </FormTitle>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name">Nombre del Rol</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleInputChange}
              placeholder="Ingresa el nombre del rol"
              hasError={!!errors.name}
              disabled={submitting}
            />
            {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
          </FormGroup>
          
          {errors.submit && <ErrorMessage>{errors.submit}</ErrorMessage>}
          
          <ButtonGroup>
            <Button 
              type="submit" 
              variant="primary"
              disabled={submitting}
            >
              {submitting ? 'Guardando...' : (editingId ? 'Actualizar Rol' : 'Crear Rol')}
            </Button>
            
            {editingId && (
              <Button 
                type="button" 
                variant="secondary"
                onClick={handleCancelEdit}
                disabled={submitting}
              >
                Cancelar
              </Button>
            )}
          </ButtonGroup>
        </Form>
      </FormSection>

      {/* Tabla de roles */}
      <TableSection>
        <TableHeader>
          <TableTitle>Lista de Roles ({roles.length})</TableTitle>
        </TableHeader>
        
        {loading ? (
          <LoadingState>Cargando roles...</LoadingState>
        ) : roles.length === 0 ? (
          <EmptyState>
            <p>No hay roles registrados</p>
            <p>Crea el primer rol usando el formulario de arriba</p>
          </EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>ID</Th>
                <Th>Nombre</Th>
                <Th>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id}>
                  <Td>{role.id}</Td>
                  <Td>{role.name}</Td>
                  <Td>
                    <ActionButton
                      variant="edit"
                      onClick={() => handleEdit(role)}
                      disabled={submitting}
                    >
                      Editar
                    </ActionButton>
                    <ActionButton
                      variant="delete"
                      onClick={() => handleDelete(role.id)}
                      disabled={submitting}
                    >
                      Eliminar
                    </ActionButton>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </TableSection>
    </Container>
  );
};

export default Roles;