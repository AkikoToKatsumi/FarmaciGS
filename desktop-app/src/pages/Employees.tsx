import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useUserStore } from '../store/user';
import { getRoles } from '../services/role.service';
import bcrypt from 'bcryptjs'; // Instala con: npm install bcryptjs
import { useNavigate } from 'react-router-dom';

// Styled Components
const Container = styled.div`
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
  font-size: 1.8rem;
  font-weight: 600;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #555;
  font-size: 0.9rem;
`;

const Input = styled.input<{ hasError?: boolean }>`
  padding: 0.75rem;
  border: 2px solid ${props => props.hasError ? '#e74c3c' : '#e1e8ed'};
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#e74c3c' : '#3498db'};
    box-shadow: 0 0 0 3px ${props => props.hasError ? 'rgba(231, 76, 60, 0.1)' : 'rgba(52, 152, 219, 0.1)'};
  }

  &::placeholder {
    color: #aaa;
  }
`;

const Select = styled.select<{ hasError?: boolean }>`
  padding: 0.75rem;
  border: 2px solid ${props => props.hasError ? '#e74c3c' : '#e1e8ed'};
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#e74c3c' : '#3498db'};
    box-shadow: 0 0 0 3px ${props => props.hasError ? 'rgba(231, 76, 60, 0.1)' : 'rgba(52, 152, 219, 0.1)'};
  }
`;

const ErrorMessage = styled.span`
  color: #e74c3c;
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const PasswordStrength = styled.div<{ strength: number }>`
  height: 4px;
  border-radius: 2px;
  margin-top: 0.5rem;
  background: ${props => {
    if (props.strength < 2) return '#e74c3c';
    if (props.strength < 3) return '#f39c12';
    if (props.strength < 4) return '#f1c40f';
    return '#27ae60';
  }};
  width: ${props => (props.strength / 4) * 100}%;
  transition: all 0.3s ease;
`;

const PasswordStrengthText = styled.span<{ strength: number }>`
  font-size: 0.8rem;
  color: ${props => {
    if (props.strength < 2) return '#e74c3c';
    if (props.strength < 3) return '#f39c12';
    if (props.strength < 4) return '#f1c40f';
    return '#27ae60';
  }};
  margin-top: 0.25rem;
`;

const Button = styled.button<{ disabled?: boolean }>`
  background: ${props => props.disabled ? '#bdc3c7' : 'linear-gradient(135deg, #3498db, #2980b9)'};
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  margin-top: 1rem;

  &:hover {
    background: ${props => props.disabled ? '#bdc3c7' : 'linear-gradient(135deg, #2980b9, #3498db)'};
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.disabled ? 'none' : '0 4px 15px rgba(52, 152, 219, 0.3)'};
  }

  &:active {
    transform: ${props => props.disabled ? 'none' : 'translateY(0)'};
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #c3e6cb;
  margin-top: 1rem;
  text-align: center;
  &:before {
    content: '✓';
    display: inline-block;
    margin-right: 0.5rem;
  }
`;
const ButtonStyled = styled.button`
  background-color: #b9bcbeff;
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-radius: 8px;
  color: #333;
  font-weight: bold;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: #4375dfff;
    transition: all 0.3s ease;
    transform: translateY(-2px);
    }

  &:active {
    transform: translateY(0);
  }
`;

// Interfaces
interface Role {
  id: number;
  name: string;
}

interface User {
  name: string;
  email: string;
  password: string;
  role_id: number;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  role_id?: string;
}

// Main Component
const UserRegistration: React.FC = () => {
  const [formData, setFormData] = useState<User>({
    name: '',
    email: '',
    password: '',
    role_id: 0
  });

  const [roles, setRoles] = useState<Role[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { token } = useUserStore();
  const navigate = useNavigate();

  // Fetch roles from backend
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      if (!token) return;
      const data = await getRoles(token);
      setRoles(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setRoles([]);
    }
  };

  // Password strength calculator
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const getPasswordStrengthText = (strength: number): string => {
    switch (strength) {
      case 0:
      case 1: return 'Muy débil';
      case 2: return 'Débil';
      case 3: return 'Buena';
      case 4: return 'Muy fuerte';
      default: return '';
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.length > 100) {
      newErrors.name = 'El nombre no puede exceder 100 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    } else if (formData.email.length > 100) {
      newErrors.email = 'El email no puede exceder 100 caracteres';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (formData.password.length > 255) {
      newErrors.password = 'La contraseña no puede exceder 255 caracteres';
    }

    if (!formData.role_id) {
      newErrors.role_id = 'Debe seleccionar un rol';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'role_id' ? parseInt(value) : value
    }));

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setSuccess(false);

    try {
      // Hashea la contraseña antes de enviar
      const hashedPassword = await bcrypt.hash(formData.password, 10);

      // Enviar al backend
      const response = await fetch('http://localhost:4004/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          password: hashedPassword,
        })
      });

      if (!response.ok) {
        throw new Error('Error al crear el usuario');
      }

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        password: '',
        role_id: 0
      });
      setPasswordStrength(0);

    } catch (error) {
      console.error('Error:', error);
      setErrors({ password: 'Error al crear el usuario. Intenta de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <ButtonStyled
        onClick={() => navigate('/dashboard')}
      >
        Volver al Inicio
      </ButtonStyled>
      <Title>Registro de Empleado</Title>
      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Ingresa el nombre completo"
            hasError={!!errors.name}
            maxLength={100}
          />
          {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
        </InputGroup>

        <InputGroup>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="ejemplo@correo.com"
            hasError={!!errors.email}
            maxLength={100}
          />
          {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
        </InputGroup>

        <InputGroup>
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Mínimo 8 caracteres"
            hasError={!!errors.password}
            maxLength={255}
          />
          {formData.password && (
            <>
              <PasswordStrength strength={passwordStrength} />
              <PasswordStrengthText strength={passwordStrength}>
                {getPasswordStrengthText(passwordStrength)}
              </PasswordStrengthText>
            </>
          )}
          {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
        </InputGroup>

        <InputGroup>
          <Label htmlFor="role_id">Rol</Label>
          <Select
            id="role_id"
            name="role_id"
            value={formData.role_id}
            onChange={handleInputChange}
            hasError={!!errors.role_id}
          >
            <option value={0}>Selecciona un rol</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </Select>
          {errors.role_id && <ErrorMessage>{errors.role_id}</ErrorMessage>}
        </InputGroup>

        <Button type="submit" disabled={loading}>
          {loading && <LoadingSpinner />}
          {loading ? 'Creando empleado...' : 'Registrar Empleado'}
        </Button>

        {success && (
          <SuccessMessage>
            ¡Empleado registrado exitosamente!
          </SuccessMessage>
        )}
      </Form>
    </Container>
  );
};

export default UserRegistration;