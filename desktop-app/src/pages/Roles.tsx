import React, { useEffect, useState } from 'react';
import { getRoles, createRole, updateRole, deleteRole } from '../services/role.service';
import { useUserStore } from '../store/User';
import { useNavigate } from 'react-router-dom';
import { BarChart2, ShoppingCart, Users, Package, ClipboardList, FileText, Shield, Truck, Layers, LogOut, User } from 'lucide-react';
import styled from 'styled-components';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ElectronImage } from '../hooks/useElectronImage';

// Interfaces
interface Role {
  id: number;
  name: string;
}

interface FormData {
  name: string;
}

// Styled Components
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

const Container = styled.div`
  background: #fafafa;
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
  margin-left: 60px;
  transition: margin-left 0.3s ease;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const BackToHomeButton = styled.button`
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

const Notification = styled.div<{ type: 'success' | 'error' | 'info'; isVisible: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 6px;
  background: white;
  border: 1px solid ${props =>
    props.type === 'success' ? '#00cc66' :
      props.type === 'error' ? '#cc0000' : '#0066cc'
  };
  border-left: 4px solid ${props =>
    props.type === 'success' ? '#00cc66' :
      props.type === 'error' ? '#cc0000' : '#0066cc'
  };
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: fadein 0.3s;
`;

const NotificationIcon = styled.div<{ type: 'success' | 'error' | 'info' }>`
  color: ${props => {
    switch (props.type) {
      case 'success': return '#00cc66';
      case 'error': return '#cc0000';
      case 'info': return '#0066cc';
      default: return '#6b7280';
    }
  }};
  flex-shrink: 0;
`;

const NotificationContent = styled.div`
  flex: 1;
`;

const NotificationTitle = styled.h4<{ type: 'success' | 'error' | 'info' }>`
  font-size: 14px;
  font-weight: 500;
  color: ${props => {
    switch (props.type) {
      case 'success': return '#15803d';
      case 'error': return '#b91c1c';
      case 'info': return '#1d4ed8';
      default: return '#374151';
    }
  }};
  margin: 0 0 2px 0;
`;

const NotificationMessage = styled.p<{ type: 'success' | 'error' | 'info' }>`
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
  &:hover {
    background: #f5f5f5;
    color: #666;
  }
`;

type NotificationType = 'success' | 'error' | 'info';
interface NotificationState {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  isVisible: boolean;
}

const Roles = () => {
  const { user, clearUser } = useUserStore();
  const token = useUserStore((s) => s.token);
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>({ name: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [notifications, setNotifications] = useState<NotificationState[]>([]);

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

  const showNotification = (type: NotificationType, title: string, message: string) => {
    const id = Date.now();
    const newNotification: NotificationState = {
      id,
      type,
      title,
      message,
      isVisible: true
    };
    setNotifications(prev => [...prev, newNotification]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      if (editingId) {
        await updateRole(editingId, form, token!);
        showNotification('success', 'Rol actualizado', 'Rol actualizado correctamente.');
      } else {
        await createRole(form, token!);
        showNotification('success', 'Rol creado', 'Rol creado correctamente.');
      }

      setForm({ name: '' });
      setEditingId(null);
      setErrors({});
      await loadRoles();
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Error al guardar el rol. Inténtalo de nuevo.' });
      showNotification('error', 'Error', 'Error al guardar el rol. Inténtalo de nuevo.');
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
        showNotification('success', 'Rol eliminado', 'Rol eliminado correctamente.');
        await loadRoles();
      } catch (error) {
        console.error('Error deleting role:', error);
        showNotification('error', 'Error', 'Error al eliminar el rol. Inténtalo de nuevo.');
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
    <>
      {/* Add Sidebar */}
      <Sidebar>
        <SidebarLogo onClick={() => navigate('/dashboard')}>
          <img src="logo.png" alt="Logo" />
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
              <SidebarMenuItem>
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
              <SidebarMenuItem active={true}>
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
        <Header>
          <BackToHomeButton onClick={() => navigate('/dashboard')}>
            ← Volver a inicio
          </BackToHomeButton>
          <Title>Gestión de Roles</Title>
        </Header>

        {/* Notificaciones flotantes */}
        <NotificationsContainer>
          {notifications.map((notification) => (
            <Notification
              key={notification.id}
              type={notification.type}
              isVisible={notification.isVisible}
            >
              <NotificationIcon type={notification.type}>
                {notification.type === 'success' ? (
                  <CheckCircle2 size={20} />
                ) : notification.type === 'error' ? (
                  <AlertCircle size={20} />
                ) : (
                  <Info size={20} />
                )}
              </NotificationIcon>
              <NotificationContent>
                <NotificationTitle type={notification.type}>
                  {notification.title}
                </NotificationTitle>
                <NotificationMessage type={notification.type}>
                  {notification.message}
                </NotificationMessage>
              </NotificationContent>
              <NotificationCloseButton
                onClick={() => closeNotification(notification.id)}
              >
                <X size={16} />
              </NotificationCloseButton>
            </Notification>
          ))}
        </NotificationsContainer>

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
    </>
  );
};

export default Roles;