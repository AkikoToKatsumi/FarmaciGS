import React, { useEffect, useState } from 'react';
import { 
  getProviders, 
  createProvider, 
  updateProvider, 
  deleteProvider,
  Provider,
  CreateProviderData,
  UpdateProviderData
} from '../services/provider.service';
import { useUserStore } from '../store/user';
import styled from 'styled-components';

// Interfaces
interface FormData {
  name: string;
  email: string;
  phone: string;
  taxId: string;
}

// Styled Components
const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
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
    background-color: #16639eff;
  }
`;

const Title = styled.h1`
  color: #333;
  margin: 0;
  font-size: 28px;
`;

const ActionBar = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 20px;
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 300px;
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
          &:hover { background-color: #0da319ff; }
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

const ProvidersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const ProviderCard = styled.div`
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: box-shadow 0.2s;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }
`;

const ProviderName = styled.h3`
  margin: 0 0 10px 0;
  color: #333;
  font-size: 18px;
`;

const ProviderInfo = styled.p`
  margin: 5px 0;
  color: #666;
  font-size: 14px;
  
  strong {
    color: #333;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 15px;
`;

const ActionButton = styled.button<{ variant?: 'edit' | 'delete' | 'view' }>`
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
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
      case 'view':
        return `
          background-color: #17a2b8;
          color: white;
          &:hover { background-color: #138496; }
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

const Modal = styled.div<{ isOpen: boolean }>`
  display: ${props => props.isOpen ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 30px;
  width: 90%;
  max-width: 600px;
  max-height: 90%;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #333;
  }
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

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
`;

const Providers = () => {
  const token = useUserStore((s) => s.token);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    taxId: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const data = await getProviders(token!);
      setProviders(data);
    } catch (error) {
      console.error('Error loading providers:', error);
      alert('Error al cargar los proveedores');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar proveedores
  const filteredProviders = providers.filter(provider =>
    provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.tax_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!form.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    } else if (form.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }
    
    if (!form.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'El formato del email no es válido';
    }
    
    if (!form.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    } else if (!/^[+]?[\d\s\-\(\)]{7,20}$/.test(form.phone)) {
      newErrors.phone = 'El formato del teléfono no es válido';
    }
    
    if (!form.taxId.trim()) {
      newErrors.taxId = 'El número de identificación fiscal es obligatorio';
    } else if (form.taxId.trim().length < 5) {
      newErrors.taxId = 'El número de identificación fiscal debe tener al menos 5 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      
      const providerData = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        taxId: form.taxId.trim()
      };
      
      if (editingId) {
        await updateProvider(editingId, providerData, token!);
      } else {
        await createProvider(providerData, token!);
      }
      
      setForm({ name: '', email: '', phone: '', taxId: '' });
      setEditingId(null);
      setErrors({});
      setIsAddModalOpen(false);
      await loadProviders();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      setErrors({ submit: error.message || 'Error al guardar el proveedor' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (provider: Provider) => {
    setForm({
      name: provider.name,
      email: provider.email,
      phone: provider.phone,
      taxId: provider.tax_id
    });
    setEditingId(provider.id);
    setErrors({});
    setIsAddModalOpen(true);
  };

  const handleView = (provider: Provider) => {
    setSelectedProvider(provider);
    setIsDetailModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este proveedor?')) {
      try {
        await deleteProvider(id, token!);
        await loadProviders();
      } catch (error: any) {
        console.error('Error deleting provider:', error);
        alert(error.message || 'Error al eliminar el proveedor');
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

  const closeModal = () => {
    setIsAddModalOpen(false);
    setIsDetailModalOpen(false);
    setSelectedProvider(null);
    setEditingId(null);
    setForm({ name: '', email: '', phone: '', taxId: '' });
    setErrors({});
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={() => window.history.back()}>
          ← Volver
        </BackButton>
        <Title>Gestión de Proveedores</Title>
      </Header>

      <ActionBar>
        <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
          + Agregar Proveedor
        </Button>
        <SearchInput
          type="text"
          placeholder="Buscar proveedores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </ActionBar>

      {loading ? (
        <LoadingState>Cargando proveedores...</LoadingState>
      ) : filteredProviders.length === 0 ? (
        <EmptyState>
          <p>No hay proveedores registrados</p>
          <p>Agrega el primer proveedor usando el botón de arriba</p>
        </EmptyState>
      ) : (
        <ProvidersGrid>
          {filteredProviders.map(provider => (
            <ProviderCard key={provider.id}>
              <ProviderName>{provider.name}</ProviderName>
              <ProviderInfo><strong>Email:</strong> {provider.email}</ProviderInfo>
              <ProviderInfo><strong>Teléfono:</strong> {provider.phone}</ProviderInfo>
              <ProviderInfo><strong>ID Fiscal:</strong> {provider.tax_id}</ProviderInfo>
              <ButtonGroup>
                <ActionButton variant="view" onClick={() => handleView(provider)}>
                  Ver Detalles
                </ActionButton>
                <ActionButton variant="edit" onClick={() => handleEdit(provider)}>
                  Editar
                </ActionButton>
                <ActionButton variant="delete" onClick={() => handleDelete(provider.id)}>
                  Eliminar
                </ActionButton>
              </ButtonGroup>
            </ProviderCard>
          ))}
        </ProvidersGrid>
      )}

      {/* Modal para agregar/editar proveedor */}
      <Modal isOpen={isAddModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              {editingId ? 'Editar Proveedor' : 'Agregar Nuevo Proveedor'}
            </ModalTitle>
            <CloseButton onClick={closeModal}>×</CloseButton>
          </ModalHeader>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="name">Nombre del Proveedor</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                placeholder="Ingresa el nombre del proveedor"
                hasError={!!errors.name}
                disabled={submitting}
              />
              {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                placeholder="correo@ejemplo.com"
                hasError={!!errors.email}
                disabled={submitting}
              />
              {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleInputChange}
                placeholder="+1 234 567 8900"
                hasError={!!errors.phone}
                disabled={submitting}
              />
              {errors.phone && <ErrorMessage>{errors.phone}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="taxId">Número de Identificación Fiscal</Label>
              <Input
                type="text"
                id="taxId"
                name="taxId"
                value={form.taxId}
                onChange={handleInputChange}
                placeholder="RUC, RFC, NIT, etc."
                hasError={!!errors.taxId}
                disabled={submitting}
              />
              {errors.taxId && <ErrorMessage>{errors.taxId}</ErrorMessage>}
            </FormGroup>

            {errors.submit && <ErrorMessage>{errors.submit}</ErrorMessage>}

            <ButtonGroup>
              <Button type="button" onClick={closeModal} disabled={submitting}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Guardando...' : (editingId ? 'Actualizar Proveedor' : 'Crear Proveedor')}
              </Button>
            </ButtonGroup>
          </Form>
        </ModalContent>
      </Modal>

      {/* Modal para ver detalles del proveedor */}
      <Modal isOpen={isDetailModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Detalles del Proveedor</ModalTitle>
            <CloseButton onClick={closeModal}>×</CloseButton>
          </ModalHeader>
          {selectedProvider && (
            <div>
              <ProviderInfo><strong>ID:</strong> {selectedProvider.id}</ProviderInfo>
              <ProviderInfo><strong>Nombre:</strong> {selectedProvider.name}</ProviderInfo>
              <ProviderInfo><strong>Email:</strong> {selectedProvider.email}</ProviderInfo>
              <ProviderInfo><strong>Teléfono:</strong> {selectedProvider.phone}</ProviderInfo>
              <ProviderInfo><strong>ID Fiscal:</strong> {selectedProvider.tax_id}</ProviderInfo>
              {selectedProvider.created_at && (
                <ProviderInfo>
                  <strong>Fecha de Registro:</strong> {new Date(selectedProvider.created_at).toLocaleDateString()}
                </ProviderInfo>
              )}
              {selectedProvider.updated_at && (
                <ProviderInfo>
                  <strong>Última Actualización:</strong> {new Date(selectedProvider.updated_at).toLocaleDateString()}
                </ProviderInfo>
              )}
            </div>
          )}
          <ButtonGroup>
            <Button onClick={closeModal}>
              Cerrar
            </Button>
            {selectedProvider && (
              <Button variant="primary" onClick={() => {
                setIsDetailModalOpen(false);
                handleEdit(selectedProvider);
              }}>
                Editar Proveedor
              </Button>
            )}
          </ButtonGroup>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Providers;