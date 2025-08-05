// src/pages/Admin.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useUserStore } from '../store/user';
import { employeeService } from '../services/employees.service';


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
}

// Styled Components
const Container = styled.div`
  background-color: #f8f9fa;
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
    background-color: #337ab1ff;
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
  const navigate = useNavigate();
  const { user } = useUserStore();

  // Estados
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '',
    email: '',
    position: '',
    department: '',
    salary: 0,
    contractType: 'full-time',
    schedule: '',
    phone: '',
    address: '',
    status: 'active'
  });
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null); // Nuevo estado para edición

  // Datos de ejemplo
 useEffect(() => {
  const fetchEmployees = async () => {
    try {
      const employeesData = await employeeService.getAllEmployees();
      // Transformar los datos para que coincidan con la interfaz del frontend
      const transformedEmployees = employeesData.map(emp => ({
        id: emp.user_id?.toString() || '',
        name: emp.name,
        email: emp.email,
        position: emp.position,
        department: emp.department,
        salary: emp.salary,
        contractType: emp.contracttype as Employee['contractType'],
        schedule: emp.schedule,
        startDate: emp.startdate || emp.hire_date || '',
        phone: emp.phone,
        address: emp.address,
        status: emp.status as Employee['status']
      }));
      setEmployees(transformedEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      // Aquí puedes mostrar un mensaje de error al usuario
    }
  };

  fetchEmployees();
}, []);

  // Actualizar la función handleAddEmployee para soportar edición y guardar salario correctamente:
  const handleAddOrUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const employeeData = {
        name: formData.name!,
        email: formData.email!,
        position: formData.position!,
        department: formData.department!,
        salary: Number(formData.salary), // Asegura que sea número
        contractType: formData.contractType!,
        schedule: formData.schedule!,
        phone: formData.phone!,
        address: formData.address!,
        status: formData.status!
      };

      if (editingId) {
        // Editar empleado existente
        const updated = await employeeService.updateEmployee(Number(editingId), employeeData);
        setEmployees(prev =>
          prev.map(emp =>
            emp.id === editingId
              ? {
                  ...emp,
                  ...employeeData,
                  salary: Number(employeeData.salary),
                  contractType: updated.contracttype as Employee['contractType'],
                  startDate: updated.startdate || updated.hire_date || emp.startDate
                }
              : emp
          )
        );
        setNotification({ message: 'Empleado actualizado exitosamente', type: 'success' });
      } else {
        // Crear nuevo empleado
        const newEmployee = await employeeService.createEmployee(employeeData);
        const transformedEmployee = {
          id: newEmployee.user_id?.toString() || Date.now().toString(),
          name: newEmployee.name,
          email: newEmployee.email,
          position: newEmployee.position,
          department: newEmployee.department,
          salary: Number(newEmployee.salary),
          contractType: newEmployee.contracttype as Employee['contractType'],
          schedule: newEmployee.schedule,
          startDate: newEmployee.startdate || newEmployee.hire_date || '',
          phone: newEmployee.phone,
          address: newEmployee.address,
          status: newEmployee.status as Employee['status']
        };
        setEmployees(prev => [...prev, transformedEmployee]);
        setNotification({ message: 'Empleado agregado exitosamente', type: 'success' });
      }

      // Resetear formulario y estado de edición
      setFormData({
        name: '',
        email: '',
        position: '',
        department: '',
        salary: 0,
        contractType: 'full-time',
        schedule: '',
        phone: '',
        address: '',
        status: 'active'
      });
      setEditingId(null);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error creando/actualizando empleado:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setNotification({ message: `Error al guardar empleado: ${errorMessage}`, type: 'error' });
    }
  };

  // Botón para editar empleado
  const handleEditEmployee = (employee: Employee) => {
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
    if (window.confirm('¿Estás seguro de que deseas eliminar este empleado?')) {
      try {
        await employeeService.deleteEmployee(Number(id));
        setEmployees(prev => prev.filter(emp => emp.id !== id));
        setNotification({ message: 'Empleado eliminado exitosamente', type: 'success' });
      } catch (error) {
        console.error('Error deleting employee:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        setNotification({ message: `Error al eliminar empleado: ${errorMessage}`, type: 'error' });
      }
    }
  };

  // Para la búsqueda en tiempo real, puedes usar:
  useEffect(() => {
    const performSearch = async () => {
      if (searchTerm.trim() === '') {
        // Si no hay término de búsqueda, cargar todos los empleados
        const employeesData = await employeeService.getAllEmployees();
        const transformedEmployees = employeesData.map(emp => ({
          id: emp.user_id?.toString() || '',
          name: emp.name,
          email: emp.email,
          position: emp.position,
          department: emp.department,
          salary: emp.salary,
          contractType: emp.contracttype as Employee['contractType'],
          schedule: emp.schedule,
          startDate: emp.startdate || emp.hire_date || '',
          phone: emp.phone,
          address: emp.address,
          status: emp.status as Employee['status']
        }));
        setEmployees(transformedEmployees);
      } else {
        // Buscar empleados
        try {
          const searchResults = await employeeService.searchEmployees(searchTerm);
          const transformedResults = searchResults.map(emp => ({
            id: emp.user_id?.toString() || '',
            name: emp.name,
            email: emp.email,
            position: emp.position,
            department: emp.department,
            salary: emp.salary,
            contractType: emp.contracttype as Employee['contractType'],
            schedule: emp.schedule,
            startDate: emp.startdate || emp.hire_date || '',
            phone: emp.phone,
            address: emp.address,
            status: emp.status as Employee['status']
          }));
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
        <BackButton onClick={() => navigate('/dashboard')}>
          Volver al Dashboard
        </BackButton>
      </Container>
    );
  }

  // Filtrar empleados
  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'salary' ? Number(value) : value
    }));
  };

  // Agregar empleado
  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const newEmployee: Employee = {
      ...formData as Employee,
      id: Date.now().toString(),
      startDate: new Date().toISOString().split('T')[0]
    };
    setEmployees(prev => [...prev, newEmployee]);
    setFormData({
      name: '',
      email: '',
      position: '',
      department: '',
      salary: 0,
      contractType: 'full-time',
      schedule: '',
      phone: '',
      address: '',
      status: 'active'
    });
    setIsAddModalOpen(false);
  };

  // Ver detalles del empleado
  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDetailModalOpen(true);
  };

  

  return (
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
          ← Volver al Dashboard
        </BackButton>
        <Title>Panel de Administración de Empleados</Title>
      </Header>

      <ActionBar>
        <Button variant="primary" onClick={() => { setIsAddModalOpen(true); setEditingId(null); }}>
          + Agregar Empleado
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
          <EmployeeCard key={employee.id}>
            <EmployeeName>{employee.name}</EmployeeName>
            <EmployeeInfo><strong>Puesto:</strong> {employee.position}</EmployeeInfo>
            <EmployeeInfo><strong>Departamento:</strong> {employee.department}</EmployeeInfo>
            <EmployeeInfo><strong>Salario:</strong> ${Number(employee.salary).toLocaleString()}</EmployeeInfo>
            <EmployeeInfo><strong>Contrato:</strong> {employee.contractType}</EmployeeInfo>
            <EmployeeInfo>
              <strong>Estado:</strong> <StatusBadge status={employee.status}>{employee.status}</StatusBadge>
            </EmployeeInfo>
            <ButtonGroup>
              <Button onClick={() => handleViewEmployee(employee)}>
                Ver Detalles
              </Button>
              <Button variant="primary" onClick={() => handleEditEmployee(employee)}>
                Editar
              </Button>
              <Button variant="danger" onClick={() => handleDeleteEmployee(employee.id)}>
                Eliminar
              </Button>
            </ButtonGroup>
          </EmployeeCard>
        ))}
      </EmployeeGrid>

      {/* Modal para agregar/editar empleado */}
      <Modal isOpen={isAddModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{editingId ? 'Editar Empleado' : 'Agregar Nuevo Empleado'}</ModalTitle>
            <CloseButton onClick={() => { setIsAddModalOpen(false); setEditingId(null); }}>×</CloseButton>
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
                value={formData.salary === 0 || formData.salary === undefined ? '' : formData.salary}
                onChange={e => {
                  // Permite borrar el campo y que quede vacío, y asegura que salary sea number | undefined
                  const val = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    salary: val === '' ? undefined : Number(val)
                  }));
                }}
                min="0"
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
              <Button type="button" onClick={() => { setIsAddModalOpen(false); setEditingId(null); }}>
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
  );
};

export default Admin;