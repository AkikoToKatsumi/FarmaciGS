import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getClients, createClient, updateClient, deleteClient } from '../services/client.service';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/User';
import { BarChart2, ShoppingCart, Users, Package, ClipboardList, FileText, Shield, Truck, Layers, LogOut, User } from 'lucide-react';

// Add Sidebar components from Sales.tsx
const Sidebar = styled.nav`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 60px;
  background: #1964aaff;
  color: #fff;
  z-index: 100;
  box-shadow: 2px 0 8px rgba(0,0,0,0.07);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 1rem;
  overflow-x: hidden;

  @media (max-width: 768px) {
    display: none;
  }
`;

const SidebarLogo = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.5rem 2rem 0.5rem;
  img {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    object-fit: contain;
    background: #fff;
    cursor: pointer;
  }
`;

const SidebarContent = styled.div`
  flex: 1 1 auto;
  width: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const SidebarMenu = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
`;

const SidebarMenuItem = styled.li<{ active?: boolean }>`
  width: 100%;
  margin-bottom: 8px;
  button {
    width: 100%;
    background: ${({ active }) => (active ? '#2563eb' : 'none')};
    color: #fff;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
    
    &:hover {
      background: #2563eb;
    }
    
    svg {
      min-width: 22px;
      flex-shrink: 0;
    }
  }
`;

const SidebarFooter = styled.div`
  width: 100%;
  padding: 1.5rem 0.5rem 2rem 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: 1px solid rgba(255,255,255,0.08);
  background: #1964aaff;
  min-height: 80px;
  box-sizing: border-box;
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  transition: color 0.15s;
  &:hover {
    color: #e74c3c;
    background: rgba(255, 255, 255, 0.1);
  }
`;

// Update Container to accommodate sidebar
const Container = styled.div`
  background-color: #fff;
  min-height: 100vh;
  padding: 20px;
  margin-left: 60px;
  transition: margin-left 0.3s ease;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const BackButton = styled.button`
  background-color: #f3f4f6;
  color: #374151;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.04);
  transition: background 0.25s, color 0.25s, box-shadow 0.25s, transform 0.15s;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  font-size: 0.875rem;

  &:hover {
    background: linear-gradient(90deg, #2563eb 0%, #60a5fa 100%);
    color: #fff;
    box-shadow: 0 4px 16px rgba(37, 99, 235, 0.15);
    transform: translateY(-2px) scale(1.03);
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-top: 32px;
`;

const ClientCard = styled.div`
  background: #f9fafb;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ClientName = styled.h3`
  margin: 0 0 8px 0;
  color: #2563eb;
  font-size: 1.1rem;
`;

const ClientInfo = styled.p`
  margin: 2px 0;
  color: #444;
  font-size: 0.98rem;
`;

const CardActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const ActionButton = styled.button<{ variant: 'edit' | 'delete' }>`
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

const PageSizeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

const Label = styled.label`
  font-weight: 600;
  font-size: 0.95rem;
  color: #374151;
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

const PaginationContainer = styled.div`
  margin-top: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
`;

const PageButton = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  background: #3b82f6;
  color: white;
  margin: 0 8px;
  
  &:hover {
    background: #2563eb;
  }
  
  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.span`
  font-size: 0.95rem;
  color: #6b7280;
`;

// Modal styles (igual que inventario)
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
`;

const ModalContent = styled.div`
  background-color: white;
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

const ModalLabel = styled.label`
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
`;

const Input = styled.input<{ hasError?: boolean }>`
  padding: 8px 12px;
  border: 1px solid ${props => props.hasError ? '#ef4444' : '#ddd'};
  border-radius: 4px;
  font-size: 14px;
`;

const TextArea = styled.textarea`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
`;

const Button = styled.button<{ variant?: 'primary' | 'danger' }>`
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
  background-color: ${props => props.variant === 'primary' ? '#007bff' : props.variant === 'danger' ? '#dc3545' : '#6c757d'};
  color: white;
  &:hover {
    background-color: ${props => props.variant === 'primary' ? '#0056b3' : props.variant === 'danger' ? '#c82333' : '#5a6268'};
  }
`;

// Mensajes tipo Sales.tsx
const NotificationsContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
`;

const Notification = styled.div<{ type: 'success' | 'error'; isVisible: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 6px;
  background: white;
  border: 1px solid ${props =>
    props.type === 'success' ? '#00cc66' : '#cc0000'};
  border-left: 4px solid ${props =>
    props.type === 'success' ? '#00cc66' : '#cc0000'};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: ${props => props.isVisible ? 'slideIn' : 'slideOut'} 0.3s ease;
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;

const NotificationIcon = styled.div<{ type: 'success' | 'error' }>`
  color: ${props => props.type === 'success' ? '#00cc66' : '#cc0000'};
  flex-shrink: 0;
  font-size: 20px;
`;

const NotificationContent = styled.div`
  flex: 1;
`;

const NotificationTitle = styled.h4<{ type: 'success' | 'error' }>`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.type === 'success' ? '#15803d' : '#b91c1c'};
  margin: 0 0 2px 0;
`;

const NotificationMessage = styled.p<{ type: 'success' | 'error' }>`
  font-size: 12px;
  color: #666;
  margin: 0;
  line-height: 1.4;
`;

const NotificationCloseButton = styled.button`
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.15s ease;
  font-size: 16px;
  &:hover {
    background: #f5f5f5;
    color: #666;
  }
`;

const Clients = () => {
  const { user, clearUser } = useUserStore();
  const token = useUserStore((s) => s.token);
  const navigate = useNavigate();
  
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', rnc: '', cedula: '', address: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<
    { id: number; type: 'success' | 'error'; title: string; message: string; isVisible: boolean }[]
  >([]);

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

  // Función para mostrar notificaciones
  const showNotification = (type: 'success' | 'error', title: string, message: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, title, message, isVisible: true }]);
    setTimeout(() => {
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, isVisible: false } : notif
        )
      );
      setTimeout(() => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
      }, 300);
    }, 4000);
  };

  const closeNotification = (id: number) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isVisible: false } : notif
      )
    );
    setTimeout(() => {
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    }, 300);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (editingId) {
        await updateClient(editingId, form, token!);
        showNotification('success', 'Cliente actualizado', 'El cliente fue actualizado correctamente.');
      } else {
        await createClient(form, token!);
        showNotification('success', 'Cliente creado', 'El cliente fue agregado correctamente.');
      }
      setForm({ name: '', email: '', phone: '', rnc: '', cedula: '', address: '' });
      setEditingId(null);
      setErrors({});
      setIsModalOpen(false);
      loadClients();
    } catch (error) {
      showNotification('error', 'Error', 'Error al guardar el cliente. Intenta de nuevo.');
      setErrors({ name: 'Error al guardar el cliente. Intenta de nuevo.' });
    }
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
    setIsModalOpen(true); // <-- asegúrate de abrir el modal al editar
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar este cliente?')) {
      try {
        await deleteClient(id, token!);
        showNotification('success', 'Cliente eliminado', 'El cliente fue eliminado correctamente.');
        loadClients();
      } catch {
        showNotification('error', 'Error', 'No se pudo eliminar el cliente.');
      }
    }
  };

  // Abrir modal para agregar o editar
  const openModal = (client?: any) => {
    if (client) {
      setForm({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        rnc: client.rnc || '',
        cedula: client.cedula || '',
        address: client.address || ''
      });
      setEditingId(client.id);
    } else {
      setForm({ name: '', email: '', phone: '', rnc: '', cedula: '', address: '' });
      setEditingId(null);
    }
    setErrors({});
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Add Sidebar */}
      <Sidebar>
        <SidebarLogo onClick={() => navigate('/dashboard')}>
          <img src="imagenes/logo.png" alt="Logo" />
        </SidebarLogo>
        
        <SidebarContent>
          <SidebarMenu>
            {/* Overview */}
            <SidebarMenuItem>
              <button onClick={() => navigate('/dashboard')} title="Overview">
                <BarChart2 />
              </button>
            </SidebarMenuItem>
            
            {/* Ventas */}
            {(user?.role_name === 'admin' || user?.role_name === 'cashier' || user?.role_name === 'pharmacist') && (
              <SidebarMenuItem>
                <button onClick={() => navigate('/sales')} title="Ventas">
                  <ShoppingCart />
                </button>
              </SidebarMenuItem>
            )}
            
            {/* Clientes */}
            {(user?.role_name === 'admin' || user?.role_name === 'cashier' || user?.role_name === 'pharmacist') && (
              <SidebarMenuItem active={true}>
                <button onClick={() => navigate('/clients')} title="Clientes">
                  <Users />
                </button>
              </SidebarMenuItem>
            )}
            
            {/* Inventario */}
            {(user?.role_name === 'admin' || user?.role_name === 'pharmacist') && (
              <SidebarMenuItem>
                <button onClick={() => navigate('/inventory')} title="Inventario">
                  <Package />
                </button>
              </SidebarMenuItem>
            )}
            
            {/* Prescripciones */}
            {(user?.role_name === 'admin' || user?.role_name === 'pharmacist') && (
              <SidebarMenuItem>
                <button onClick={() => navigate('/prescriptions')} title="Prescripciones">
                  <ClipboardList />
                </button>
              </SidebarMenuItem>
            )}
            
            {/* Usuarios */}
            {user?.role_name === 'admin' && (
              <SidebarMenuItem>
                <button onClick={() => navigate('/Users')} title="Usuarios">
                  <User />
                </button>
              </SidebarMenuItem>
            )}
            
            {/* Reportes */}
            {(user?.role_name === 'admin' || user?.role_name === 'pharmacist' || user?.role_name === 'cashier') && (
              <SidebarMenuItem>
                <button onClick={() => navigate('/reports')} title="Reportes">
                  <FileText />
                </button>
              </SidebarMenuItem>
            )}
            
            {/* Administración */}
            {user?.role_name === 'admin' && (
              <SidebarMenuItem>
                <button onClick={() => navigate('/admin')} title="Administración">
                  <Shield />
                </button>
              </SidebarMenuItem>
            )}
            
            {/* Roles */}
            {user?.role_name === 'admin' && (
              <SidebarMenuItem>
                <button onClick={() => navigate('/roles')} title="Roles">
                  <Layers />
                </button>
              </SidebarMenuItem>
            )}
            
            {/* Proveedores */}
            {user?.role_name === 'admin' && (
              <SidebarMenuItem>
                <button onClick={() => navigate('/providers')} title="Proveedores">
                  <Truck />
                </button>
              </SidebarMenuItem>
            )}
            
            {/* Categorías */}
            {user?.role_name === 'admin' && (
              <SidebarMenuItem>
                <button onClick={() => navigate('/categories')} title="Categorías">
                  <Layers />
                </button>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarContent>
        
        <SidebarFooter>
          <LogoutButton onClick={() => {
            clearUser();
            navigate('/login');
          }} title="Cerrar Sesión">
            <LogOut size={20} />
          </LogoutButton>
        </SidebarFooter>
      </Sidebar>

      <Container>
        <NotificationsContainer>
          {notifications.map(notification => (
            <Notification
              key={notification.id}
              type={notification.type}
              isVisible={notification.isVisible}
            >
              <NotificationIcon type={notification.type}>
                {notification.type === 'success' ? '✓' : '✕'}
              </NotificationIcon>
              <NotificationContent>
                <NotificationTitle type={notification.type}>{notification.title}</NotificationTitle>
                <NotificationMessage type={notification.type}>{notification.message}</NotificationMessage>
              </NotificationContent>
              <NotificationCloseButton onClick={() => closeNotification(notification.id)}>
                ×
              </NotificationCloseButton>
            </Notification>
          ))}
        </NotificationsContainer>
        <BackButton onClick={() => navigate('/dashboard')}>
          ← Volver a Inicio
        </BackButton>
        <Card>
          <Title>Clientes</Title>
          <Button variant="primary" style={{ marginBottom: 20 }} onClick={() => openModal()}>
            + Agregar Cliente
          </Button>
          
          <PageSizeContainer>
            <Label htmlFor="pageSize">Clientes por página:</Label>
            <Select id="pageSize" value={pageSize} onChange={handlePageSizeChange} style={{width: 100}}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </Select>
          </PageSizeContainer>

          <Grid>
            {currentClients.length > 0 ? currentClients.map((c: any) => (
              <ClientCard key={c.id}>
                <ClientName>{c.name}</ClientName>
                <ClientInfo><strong>Email:</strong> {c.email || <span style={{ color: '#aaa' }}>No especificado</span>}</ClientInfo>
                <ClientInfo><strong>Teléfono:</strong> {c.phone || <span style={{ color: '#aaa' }}>No especificado</span>}</ClientInfo>
                <ClientInfo><strong>RNC:</strong> {c.rnc || <span style={{ color: '#aaa' }}>No especificado</span>}</ClientInfo>
                <ClientInfo><strong>Cédula:</strong> {c.cedula || <span style={{ color: '#aaa' }}>No especificado</span>}</ClientInfo>
                <ClientInfo><strong>Dirección:</strong> {c.address || <span style={{ color: '#aaa' }}>No especificado</span>}</ClientInfo>
                <CardActions>
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
                </CardActions>
              </ClientCard>
            )) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888' }}>
                No hay clientes registrados.
              </div>
            )}
          </Grid>
            
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

        {/* Modal para agregar/editar cliente */}
        {isModalOpen && (
          <ModalOverlay>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>{editingId ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}</ModalTitle>
                <CloseButton onClick={() => setIsModalOpen(false)}>×</CloseButton>
              </ModalHeader>
              <Form onSubmit={e => { e.preventDefault(); handleSubmit(); setIsModalOpen(false); }}>
                <FormGroup>
                  <ModalLabel htmlFor="name">Nombre Completo</ModalLabel>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    hasError={!!errors.name}
                    required
                  />
                  {errors.name && <ErrorText>{errors.name}</ErrorText>}
                </FormGroup>
                <FormGroup>
                  <ModalLabel htmlFor="email">Email</ModalLabel>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    hasError={!!errors.email}
                  />
                  {errors.email && <ErrorText>{errors.email}</ErrorText>}
                </FormGroup>
                <FormGroup>
                  <ModalLabel htmlFor="phone">Teléfono</ModalLabel>
                  <Input
                    type="text"
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    hasError={!!errors.phone}
                  />
                  {errors.phone && <ErrorText>{errors.phone}</ErrorText>}
                </FormGroup>
                <FormGroup>
                  <ModalLabel htmlFor="rnc">RNC</ModalLabel>
                  <Input
                    type="text"
                    id="rnc"
                    name="rnc"
                    value={form.rnc}
                    onChange={e => setForm({ ...form, rnc: e.target.value })}
                  />
                </FormGroup>
                <FormGroup>
                  <ModalLabel htmlFor="cedula">Cédula</ModalLabel>
                  <Input
                    type="text"
                    id="cedula"
                    name="cedula"
                    value={form.cedula}
                    onChange={e => setForm({ ...form, cedula: e.target.value })}
                  />
                </FormGroup>
                <FormGroup>
                  <ModalLabel htmlFor="address">Dirección</ModalLabel>
                  <TextArea
                    id="address"
                    name="address"
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                  />
                </FormGroup>
                <ButtonGroup>
                  <Button type="button" onClick={() => setIsModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary">
                    {editingId ? 'Actualizar Cliente' : 'Agregar Cliente'}
                  </Button>
                </ButtonGroup>
              </Form>
            </ModalContent>
          </ModalOverlay>
        )}
      </Container>
    </>
  );
};

export default Clients;