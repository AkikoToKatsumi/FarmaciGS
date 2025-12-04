// src/pages/Admin.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useUserStore } from '../store/User';
import { employeeService } from '../services/employees.service';
import { BarChart2, ShoppingCart, Users, Package, ClipboardList, FileText, Shield, Truck, Layers, LogOut, User } from 'lucide-react';

// Add Sidebar components
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

// Update Container to accommodate sidebar and center content
const Container = styled.div`
  background-color: #f8f9fa;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  margin-left: auto;
  margin-right: auto;
  transform: translateX(30px);
  transition: transform 0.3s ease;

  @media (max-width: 768px) {
    transform: translateX(0);
    margin-left: 0;
    margin-right: 0;
    padding: 1rem;
  }
`;

// Interfaces
interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  salary: number;
  contractType: 'full-time' | 'part-time' | 'contract' | 'intern';
  schedule: string;
  startDate: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  tempPassword?: string; // Add optional tempPassword property
}

// Styled Components
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
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

const Title = styled.h1`
  color: #333;
  margin: 0;
`;

const ActionBar = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background-color: #007bff;
          color: white;
          &:hover { background-color: #0056b3; }
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

const SearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 300px;
`;

const EmployeeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const EmployeeCard = styled.div`
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

const EmployeeName = styled.h3`
  margin: 0 0 10px 0;
  color: #333;
`;

const EmployeeInfo = styled.p`
  margin: 5px 0;
  color: #666;
  font-size: 14px;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  ${props => props.status === 'active' 
    ? 'background-color: #d4edda; color: #155724;'
    : 'background-color: #f8d7da; color: #721c24;'
  }
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

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
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

const Notification = styled.div<{ type: 'success' | 'error' }>`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 8px;
  color: white;
  background-color: ${props => props.type === 'success' ? '#28a745' : '#dc3545'};
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 300px;
  animation: slideIn 0.5s ease-out;

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const NotificationCloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  margin-left: 15px;
  line-height: 1;
`;

const Admin = () => {
  const { user, clearUser } = useUserStore();
  const navigate = useNavigate();

  // Add debugging for user role
  useEffect(() => {
    console.log('Current user in Admin:', user);
    console.log('User role:', user?.role_name);
  }, [user]);

  // Estados
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showInactive, setShowInactive] = useState(true); // New state for toggle
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '',
    email: '',
    position: '',
    department: '',
    salary: undefined,
    contractType: 'full-time',
    schedule: '',
    phone: '',
    address: '',
    status: 'active'
  });
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Datos de ejemplo
 useEffect(() => {
  const fetchEmployees = async () => {
    try {
      console.log('=== FETCHING EMPLOYEES ===');
      const employeesData = await employeeService.getAllEmployees();
      console.log('Raw employees data received:', employeesData);
      console.log('Number of employees:', employeesData.length);
      
      if (employeesData.length === 0) {
        console.warn('No employees found in database');
        setEmployees([]);
        setNotification({ message: 'No se encontraron empleados en la base de datos', type: 'error' });
        return;
      }
      
      // Transformar los datos para que coincidan con la interfaz del frontend
      const transformedEmployees = employeesData.map((emp, index) => {
        console.log(`Transforming employee ${index}:`, emp);
        const employeeId = emp.user_id?.toString() || `temp-${Date.now()}-${index}`;
        return {
          id: employeeId,
          name: emp.name || '',
          email: emp.email || '',
          position: emp.position || '',
          department: emp.department || '',
          salary: emp.salary || 0,
          contractType: emp.contracttype as Employee['contractType'] || 'full-time',
          schedule: emp.schedule || '',
          startDate: emp.startdate || emp.hire_date || '',
          phone: emp.phone || '',
          address: emp.address || '',
          status: emp.status as Employee['status'] || 'active'
        };
      }).filter(emp => {
        // Filtrar solo empleados que tengan datos mínimos válidos
        const isValid = emp.name && emp.name.trim() !== '' && emp.email && emp.email.trim() !== '';
        console.log(`Employee ${emp.name || 'unnamed'} is valid:`, isValid);
        return isValid;
      });
      
      console.log('Transformed employees:', transformedEmployees);
      console.log('Final employee count:', transformedEmployees.length);
      setEmployees(transformedEmployees);
      console.log('=== END FETCHING EMPLOYEES ===');
    } catch (error) {
      console.error('Error fetching employees:', error);
      setNotification({ message: 'Error al cargar empleados: ' + (error instanceof Error ? error.message : 'Error desconocido'), type: 'error' });
    }
  };

  fetchEmployees();
}, []);

  // Función para resetear el formulario
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      position: '',
      department: '',
      salary: undefined,
      contractType: 'full-time',
      schedule: '',
      phone: '',
      address: '',
      status: 'active'
    });
    setEditingId(null);
  };

  // Actualizar la función handleAddEmployee para soportar edición y guardar salario correctamente:
  const handleAddOrUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!formData.name || !formData.email) {
      setNotification({ message: 'Nombre y email son campos obligatorios', type: 'error' });
      return;
    }

    // Validar salario si se proporciona
    if (formData.salary !== undefined && formData.salary !== null && formData.salary <= 0) {
      setNotification({ message: 'El salario debe ser un número válido mayor a 0', type: 'error' });
      return;
    }

    try {
      const employeeData = {
        name: formData.name!,
        email: formData.email!,
        position: formData.position || '',
        department: formData.department || '',
        salary: formData.salary ? Number(formData.salary) : undefined,
        contractType: formData.contractType || 'full-time',
        schedule: formData.schedule || '',
        phone: formData.phone || '',
        address: formData.address || '',
        status: formData.status || 'active'
      };

      console.log('Sending employee data:', employeeData);

      if (editingId) {
        // Editar empleado existente
        console.log('Updating employee with ID:', editingId);
        const updated = await employeeService.updateEmployee(Number(editingId), employeeData);
        console.log('Employee updated:', updated);
        
        setEmployees(prev =>
          prev.map(emp =>
            emp.id === editingId
              ? {
                  id: editingId,
                  name: updated.name,
                  email: updated.email,
                  position: updated.position || '',
                  department: updated.department || '',
                  salary: Number(updated.salary) || 0,
                  contractType: updated.contracttype as Employee['contractType'] || 'full-time',
                  schedule: updated.schedule || '',
                  startDate: updated.startdate || updated.hire_date || emp.startDate,
                  phone: updated.phone || '',
                  address: updated.address || '',
                  status: updated.status as Employee['status'] || 'active'
                }
              : emp
          )
        );
        setNotification({ message: 'Empleado actualizado exitosamente', type: 'success' });
      } else {
        // Crear nuevo empleado
        console.log('Creating new employee');
        const newEmployeeResponse = await employeeService.createEmployee(employeeData);
        console.log('Employee created:', newEmployeeResponse);
        
        const transformedEmployee = {
          id: newEmployeeResponse.user_id?.toString() || Date.now().toString(),
          name: newEmployeeResponse.name,
          email: newEmployeeResponse.email,
          position: newEmployeeResponse.position || '',
          department: newEmployeeResponse.department || '',
          salary: Number(newEmployeeResponse.salary) || 0,
          contractType: newEmployeeResponse.contracttype as Employee['contractType'] || 'full-time',
          schedule: newEmployeeResponse.schedule || '',
          startDate: newEmployeeResponse.startdate || newEmployeeResponse.hire_date || '',
          phone: newEmployeeResponse.phone || '',
          address: newEmployeeResponse.address || '',
          status: newEmployeeResponse.status as Employee['status'] || 'active'
        };
        setEmployees(prev => [...prev, transformedEmployee]);
        
        // Mostrar mensaje con contraseña temporal si está disponible
        const message = (newEmployeeResponse as any).tempPassword 
          ? `Empleado agregado exitosamente. Contraseña temporal: ${(newEmployeeResponse as any).tempPassword}`
          : 'Empleado agregado exitosamente';
        setNotification({ message, type: 'success' });
      }

      // Resetear formulario y cerrar modal
      resetForm();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error creando/actualizando empleado:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setNotification({ message: `Error al guardar empleado: ${errorMessage}`, type: 'error' });
    }
  };

  // Botón para editar empleado
  const handleEditEmployee = (employee: Employee) => {
    // Solo validar que el empleado tenga un nombre válido
    if (!employee.name || employee.name.trim() === '') {
      setNotification({ message: 'No se puede editar este empleado: datos inválidos', type: 'error' });
      return;
    }

    setFormData({
      name: employee.name,
      email: employee.email,
      position: employee.position,
      department: employee.department,
      salary: employee.salary,
      contractType: employee.contractType,
      schedule: employee.schedule,
      phone: employee.phone,
      address: employee.address,
      status: employee.status
    });
    setEditingId(employee.id);
    setIsAddModalOpen(true);
  };

  // Actualizar la función handleDeleteEmployee:
  const handleDeleteEmployee = async (id: string) => {
    console.log('=== DELETE EMPLOYEE FRONTEND ===');
    console.log('Employee ID to delete:', id);
    
    // Validar que no sea un ID temporal
    if (id.startsWith('temp-') || id.startsWith('search-')) {
      console.log('❌ Cannot delete temporary employee');
      setNotification({ message: 'No se puede eliminar este empleado: es un registro temporal', type: 'error' });
      return;
    }

    if (window.confirm('¿Estás seguro de que deseas eliminar este empleado? (Se desactivará el empleado)')) {
      try {
        console.log('Calling delete service...');
        await employeeService.deleteEmployee(Number(id));
        console.log('✅ Delete service completed successfully');
        
        // Refresh the employee list instead of just filtering
        const employeesData = await employeeService.getAllEmployees();
        const transformedEmployees = employeesData.map((emp, index) => ({
          id: emp.user_id?.toString() || `temp-${index}`,
          name: emp.name || '',
          email: emp.email || '',
          position: emp.position || '',
          department: emp.department || '',
          salary: emp.salary || 0,
          contractType: emp.contracttype as Employee['contractType'] || 'full-time',
          schedule: emp.schedule || '',
          startDate: emp.startdate || emp.hire_date || '',
          phone: emp.phone || '',
          address: emp.address || '',
          status: emp.status as Employee['status'] || 'active'
        })).filter(emp => emp.name && emp.name.trim() !== '' && emp.email && emp.email.trim() !== '');
        
        setEmployees(transformedEmployees);
        setNotification({ message: 'Empleado desactivado exitosamente', type: 'success' });
        console.log('=== END DELETE EMPLOYEE FRONTEND ===');
      } catch (error) {
        console.error('❌ Error deleting employee:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        setNotification({ message: `Error al eliminar empleado: ${errorMessage}`, type: 'error' });
        console.log('=== END DELETE EMPLOYEE FRONTEND ===');
      }
    } else {
      console.log('Delete cancelled by user');
      console.log('=== END DELETE EMPLOYEE FRONTEND ===');
    }
  };

  // Para la búsqueda en tiempo real, puedes usar:
  useEffect(() => {
    const performSearch = async () => {
      if (searchTerm.trim() === '') {
        // Si no hay término de búsqueda, cargar todos los empleados
        try {
          const employeesData = await employeeService.getAllEmployees();
          const transformedEmployees = employeesData.map((emp, index) => ({
            id: emp.user_id?.toString() || `temp-${index}`,
            name: emp.name || '',
            email: emp.email || '',
            position: emp.position || '',
            department: emp.department || '',
            salary: emp.salary || 0,
            contractType: emp.contracttype as Employee['contractType'] || 'full-time',
            schedule: emp.schedule || '',
            startDate: emp.startdate || emp.hire_date || '',
            phone: emp.phone || '',
            address: emp.address || '',
            status: emp.status as Employee['status'] || 'active'
          })).filter(emp => emp.name && emp.name.trim() !== '' && emp.email && emp.email.trim() !== '');
          setEmployees(transformedEmployees);
        } catch (error) {
          console.error('Error fetching employees:', error);
        }
      } else {
        // Buscar empleados
        try {
          const searchResults = await employeeService.searchEmployees(searchTerm);
          const transformedResults = searchResults.map((emp, index) => ({
            id: emp.user_id?.toString() || `search-${index}`,
            name: emp.name || '',
            email: emp.email || '',
            position: emp.position || '',
            department: emp.department || '',
            salary: emp.salary || 0,
            contractType: emp.contracttype as Employee['contractType'] || 'full-time',
            schedule: emp.schedule || '',
            startDate: emp.startdate || emp.hire_date || '',
            phone: emp.phone || '',
            address: emp.address || '',
            status: emp.status as Employee['status'] || 'active'
          })).filter(emp => emp.name && emp.name.trim() !== '' && emp.email && emp.email.trim() !== '');
          setEmployees(transformedResults);
        } catch (error) {
          console.error('Error searching employees:', error);
        }
      }
    };

    const timeoutId = setTimeout(performSearch, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  if (user?.role_name !== 'admin') {
    return (
      <Container>
        <h1>Acceso Denegado</h1>
        <p>No tienes permisos para acceder a esta página</p>
        <p>Tu rol actual: {user?.role_name || 'No definido'}</p>
        <BackButton onClick={() => navigate('/dashboard')}>
          <span style={{ fontSize: '1.2rem' }}>←</span> Volver a inicio
        </BackButton>
      </Container>
    );
  }

  // Filtrar empleados
  const filteredEmployees = employees.filter(employee => {
    // Filter by search term
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by status visibility
    const matchesStatus = showInactive || employee.status === 'active';
    
    return matchesSearch && matchesStatus;
  });

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'salary' ? (value === '' ? undefined : Number(value)) : value
    }));
  };

  // Ver detalles del empleado
  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDetailModalOpen(true);
  };

  

  return (
    <>
      {/* Add Sidebar */}
      <Sidebar>
        <SidebarLogo onClick={() => navigate('/dashboard')}>
          <img src="/imagenes/logo.png" alt="Logo" />
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
              <SidebarMenuItem active={true}>
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
        {notification && (
          <Notification type={notification.type}>
            <span>{notification.message}</span>
            <NotificationCloseButton onClick={() => setNotification(null)}>
              ×
            </NotificationCloseButton>
          </Notification>
        )}
        <Header>
          <BackButton onClick={() => navigate('/dashboard')}>
            <span style={{ fontSize: '1.2rem' }}>←</span> Volver a inicio
          </BackButton>
          <Title>Panel de Administración de Empleados</Title>
        </Header>

        <ActionBar>
          <Button variant="primary" onClick={() => { 
            resetForm(); 
            setIsAddModalOpen(true); 
          }}>
            + Agregar Empleado
          </Button>
          <Button 
            variant={showInactive ? 'secondary' : 'primary'}
            onClick={() => setShowInactive(!showInactive)}
          >
            {showInactive ? 'Ocultar Inactivos' : 'Mostrar Inactivos'}
          </Button>
          <SearchInput
            type="text"
            placeholder="Buscar empleados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </ActionBar>

        <EmployeeGrid>
          {filteredEmployees.map(employee => (
            <EmployeeCard key={`employee-${employee.id}`}>
              <EmployeeName>{employee.name}</EmployeeName>
              <EmployeeInfo><strong>Puesto:</strong> {employee.position || 'No especificado'}</EmployeeInfo>
              <EmployeeInfo><strong>Departamento:</strong> {employee.department || 'No especificado'}</EmployeeInfo>
              <EmployeeInfo><strong>Salario:</strong> ${Number(employee.salary).toLocaleString()}</EmployeeInfo>
              <EmployeeInfo><strong>Contrato:</strong> {employee.contractType}</EmployeeInfo>
              <EmployeeInfo>
                <strong>Estado:</strong> <StatusBadge status={employee.status}>{employee.status}</StatusBadge>
              </EmployeeInfo>
              <ButtonGroup>
                <Button onClick={() => handleViewEmployee(employee)}>
                  Ver Detalles
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => handleEditEmployee(employee)}
                  disabled={!employee.name || employee.name.trim() === ''}
                >
                  Editar
                </Button>
                <Button 
                  variant={employee.status === 'active' ? 'danger' : 'primary'}
                  onClick={() => handleDeleteEmployee(employee.id)}
                  disabled={employee.id.startsWith('temp-') || employee.id.startsWith('search-')}
                >
                  {employee.status === 'active' ? 'Desactivar' : 'Activar'}
                </Button>
              </ButtonGroup>
            </EmployeeCard>
          ))}
        </EmployeeGrid>

        {filteredEmployees.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            {employees.length === 0 
              ? 'No hay empleados registrados' 
              : searchTerm 
                ? 'No se encontraron empleados que coincidan con la búsqueda'
                : 'No hay empleados activos para mostrar'
            }
          </div>
        )}

        {/* Modal para agregar/editar empleado */}
        <Modal isOpen={isAddModalOpen}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>{editingId ? 'Editar Empleado' : 'Agregar Nuevo Empleado'}</ModalTitle>
              <CloseButton onClick={() => { 
                setIsAddModalOpen(false); 
                resetForm(); 
              }}>×</CloseButton>
            </ModalHeader>
            <Form onSubmit={handleAddOrUpdateEmployee}>
              <FormGroup>
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="position">Puesto</Label>
                <Input
                  type="text"
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="department">Departamento</Label>
                <Input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="salary">Salario Mensual</Label>
                <Input
                  type="number"
                  id="salary"
                  name="salary"
                  value={formData.salary === undefined ? '' : formData.salary}
                  onChange={e => {
                    const val = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      salary: val === '' ? undefined : Number(val)
                    }));
                  }}
                  min="0"
                  step="0.01"
                  placeholder="Ingrese el salario mensual"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="contractType">Tipo de Contrato</Label>
                <Select
                  id="contractType"
                  name="contractType"
                  value={formData.contractType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="full-time">Tiempo Completo</option>
                  <option value="part-time">Medio Tiempo</option>
                  <option value="contract">Por Contrato</option>
                  <option value="intern">Practicante</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label htmlFor="schedule">Horario</Label>
                <Input
                  type="text"
                  id="schedule"
                  name="schedule"
                  value={formData.schedule}
                  onChange={handleInputChange}
                  placeholder="Ej: Lunes a Viernes 9:00 AM - 6:00 PM"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="address">Dirección</Label>
                <TextArea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="status">Estado</Label>
                <Select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </Select>
              </FormGroup>
              <ButtonGroup>
                <Button type="button" onClick={() => { 
                  setIsAddModalOpen(false); 
                  resetForm(); 
                }}>
                  Cancelar
                </Button>
                {editingId ? (
                  <Button type="submit" variant="primary">
                    Actualizar Empleado
                  </Button>
                ) : (
                  <Button type="submit" variant="primary">
                    Agregar Empleado
                  </Button>
                )}
              </ButtonGroup>
            </Form>
          </ModalContent>
        </Modal>

        {/* Modal para ver detalles del empleado */}
        <Modal isOpen={isDetailModalOpen}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Detalles del Empleado</ModalTitle>
              <CloseButton onClick={() => setIsDetailModalOpen(false)}>×</CloseButton>
            </ModalHeader>
            {selectedEmployee && (
              <div>
                <EmployeeInfo><strong>Nombre:</strong> {selectedEmployee.name}</EmployeeInfo>
                <EmployeeInfo><strong>Email:</strong> {selectedEmployee.email}</EmployeeInfo>
                <EmployeeInfo><strong>Puesto:</strong> {selectedEmployee.position}</EmployeeInfo>
                <EmployeeInfo><strong>Departamento:</strong> {selectedEmployee.department}</EmployeeInfo>
                <EmployeeInfo><strong>Salario:</strong> ${Number(selectedEmployee.salary).toLocaleString()}</EmployeeInfo>
                <EmployeeInfo><strong>Tipo de Contrato:</strong> {selectedEmployee.contractType}</EmployeeInfo>
                <EmployeeInfo><strong>Horario:</strong> {selectedEmployee.schedule}</EmployeeInfo>
                <EmployeeInfo><strong>Fecha de Inicio:</strong> {selectedEmployee.startDate}</EmployeeInfo>
                <EmployeeInfo><strong>Teléfono:</strong> {selectedEmployee.phone}</EmployeeInfo>
                <EmployeeInfo><strong>Dirección:</strong> {selectedEmployee.address}</EmployeeInfo>
                <EmployeeInfo>
                  <strong>Estado:</strong> <StatusBadge status={selectedEmployee.status}>{selectedEmployee.status}</StatusBadge>
                </EmployeeInfo>
              </div>
            )}
            <ButtonGroup>
              <Button onClick={() => setIsDetailModalOpen(false)}>
                Cerrar
              </Button>
            </ButtonGroup>
          </ModalContent>
        </Modal>
      </Container>
    </>
  );
};

export default Admin;