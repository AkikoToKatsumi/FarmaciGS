// src/pages/Inventory.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '../store/User';
import { BarChart2, ShoppingCart, Users, Package, ClipboardList, FileText, Shield, Truck, Layers, LogOut, User } from 'lucide-react';

import {
  getMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getStockAlerts,
  getProviders, // <-- nuevo import
  getExpiringSoonReport, // <-- importar el servicio
  Medicine as MedicineType,
  CreateMedicineData,
  UpdateMedicineData
} from '../services/inventory.service';
import { getCategories as getCategoryList } from '../services/category.service';

// --- Styled Components ---

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

const PageContainer = styled.div`
  background-color: #f0f4f8;
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem 1rem;
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
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  color: #2d3748;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

const BaseButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s, box-shadow 0.2s, transform 0.15s;
  font-size: 0.875rem;
`;

const PrimaryButton = styled(BaseButton)`
  background-color: #4299e1;
  color: white;
  &:hover {
    background-color: #0840daff;
  }
`;

const AlertButton = styled(BaseButton) <{ hasAlerts: boolean }>`
  background-color: ${props => props.hasAlerts ? '#f56565' : '#e2e8f0'};
  color: ${props => props.hasAlerts ? 'white' : '#4a5568'};
  &:hover {
    background-color: ${props => props.hasAlerts ? '#e53e3e' : '#cbd5e0'};
  }
`;

const Card = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 2.5rem;
  margin-bottom: 1.5rem;
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd5e0;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #63b3ed;
    border-color: #4299e1;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd5e0;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #63b3ed;
    border-color: #4299e1;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.7rem 0.75rem;
  border: 1px solid #cbd5e0;
  border-radius: 0.500rem;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 80px;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #63b3ed;
    border-color: #4299e1;
  }
`;

const StyledTable = styled.table`
  min-width: 100%;
  border-collapse: collapse;
  
  thead {
    background-color: #f7fafc;
  }
  
  th, td {
    padding: 0.75rem 1.5rem;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
  }
  
  th {
    font-size: 0.75rem;
    font-weight: 500;
    color: #718096;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  tbody tr:hover {
    background-color: #f7fafc;
  }
`;

const TableContainer = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
`;

const TableScrollContainer = styled.div`
  overflow-x: auto;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #9ca3af;
`;

const StockBadge = styled.span<{ stockLevel: 'low' | 'medium' | 'high' }>`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
  
  ${props => {
    switch (props.stockLevel) {
      case 'low':
        return `
          background-color: #fee2e2;
          color: #dc2626;
        `;
      case 'medium':
        return `
          background-color: #fef3c7;
          color: #d97706;
        `;
      case 'high':
        return `
          background-color: #dcfce7;
          color: #16a34a;
        `;
      default:
        return `
          background-color: #f3f4f6;
          color: #6b7280;
        `;
    }
  }}
`;

const ProductName = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.25rem;
`;

const ProductDescription = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  max-width: 250px;
  white-space: normal;
  line-height: 1.4;
`;

const ActionButton = styled.button`
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 0.375rem;
  
  &:hover {
    background-color: #f3f4f6;
  }
`;

const EditButton = styled(ActionButton)`
 background: #3b82f6;
    color: #fff;
    
    &:hover {
      background: #2563eb;
    }
`;

const DeleteButton = styled(ActionButton)`
  background: #ef4444;
    color: #fff;
    
    &:hover {
      background: #dc2626;
    
  }
`;

const ActionContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Price = styled.span`
  font-weight: 500;
  color: #07690fff;
`;

const ExpirationDate = styled.span<{ isExpiringSoon: boolean }>`
  color: ${props => props.isExpiringSoon ? '#dc2626' : '#111827'};
  font-weight: ${props => props.isExpiringSoon ? '600' : '400'};
`;

// Modal styles
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
  border-radius: 0.5rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 42rem;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  
  &:hover {
    color: #374151;
  }
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const FormGrid3 = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
`;

const CancelButton = styled.button`
  padding: 0.5rem 1rem;
  color: #6b7280;
  background-color: #f3f4f6;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background-color: #e5e7eb;
  }
`;

const SubmitButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background-color: #338f3bff;
  }
`;

// Alert styles
const AlertContainer = styled.div`
  background-color: #c7b497ff;
  border: 1px solid #ec8a09ff;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
`;

const AlertTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 0.75rem;
`;

const AlertGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const AlertCard = styled.div`
  background-color: white;
  padding: 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #fbbf24;
`;

const AlertProductName = styled.h4`
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.25rem;
`;

const AlertText = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.125rem 0;
`;

// Nuevo: estilos para alertas separadas
const StockAlertContainer = styled(AlertContainer)`
  background-color: #fee2e2;
  border-color: #f87171;
`;

const StockAlertTitle = styled(AlertTitle)`
  color: #b91c1c;
`;

const ExpiringAlertContainer = styled(AlertContainer)`
  background-color: #fef3c7;
  border-color: #fbbf24;
`;

const ExpiringAlertTitle = styled(AlertTitle)`
  color: #d97706;
`;

const StockAlertButton = styled(AlertButton)`
  background-color: ${props => props.hasAlerts ? '#f87171' : '#e2e8f0'};
  color: ${props => props.hasAlerts ? '#fff' : '#4a5568'};
  &:hover {
    background-color: ${props => props.hasAlerts ? '#ef4444' : '#cbd5e0'};
  }
`;

const ExpiringAlertButton = styled(AlertButton)`
  background-color: ${props => props.hasAlerts ? '#fbbf24' : '#e2e8f0'};
  color: ${props => props.hasAlerts ? '#92400e' : '#4a5568'};
  &:hover {
    background-color: ${props => props.hasAlerts ? '#f59e42' : '#cbd5e0'};
  }
`;

// Componentes de mensajes modernos
const MessageContainer = styled.div<{ type: 'success' | 'error' }>`
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
  border: 1px solid;
  position: relative;
  animation: slideIn 0.3s ease-out;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  
  ${props => props.type === 'success' ? `
    background-color: #f0fdf4;
    border-color: #22c55e;
    color: #15803d;
  ` : `
    background-color: #fef2f2;
    border-color: #ef4444;
    color: #dc2626;
  `}
  
  @keyframes slideIn {
    from {
      transform: translateY(-10px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const MessageIcon = styled.div<{ type: 'success' | 'error' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  margin-right: 1rem;
  flex-shrink: 0;
  font-size: 1rem;
  font-weight: 700;
  
  ${props => props.type === 'success' ? `
    background-color: #22c55e;
    color: white;
  ` : `
    background-color: #ef4444;
    color: white;
  `}
`;

const MessageContent = styled.div`
  flex: 1;
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.5;
`;

const MessageCloseButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  margin-left: 1rem;
  cursor: pointer;
  opacity: 0.7;
  border-radius: 0.375rem;
  transition: all 0.2s;
  font-size: 1.125rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.1);
    transform: scale(1.1);
  }
`;

// Botón "Volver a inicio" con animación azul al hacer hover
const BackToHomeButton = styled(BaseButton)`
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

// Contenedor para posicionar notificaciones
const NotificationContainer = styled.div`
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  max-width: 400px;
  
  @media (max-width: 768px) {
    left: 1rem;
    right: 1rem;
    max-width: none;
  }
`;
// --- Summary & Loading Components ---

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  font-size: 1.25rem;
  color: #4299e1;
  font-weight: 600;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin: 2rem 0 0 0;
  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const SummaryCard = styled.div<{ color: string }>`
  background-color: ${({ color }) => {
    switch (color) {
      case 'blue': return '#ebf8ff';
      case 'green': return '#f0fdf4';
      case 'yellow': return '#fef9c3';
      case 'purple': return '#f3e8ff';
      default: return '#f7fafc';
    }
  }};
  border-radius: 0.75rem;
  padding: 1.5rem 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SummaryValue = styled.div<{ color: string }>`
  font-size: 2.25rem;
  font-weight: 700;
  color: ${({ color }) => {
    switch (color) {
      case 'blue': return '#2563eb';
      case 'green': return '#22c55e';
      case 'yellow': return '#eab308';
      case 'purple': return '#a21caf';
      default: return '#374151';
    }
  }};
  margin-bottom: 0.5rem;
`;

const SummaryLabel = styled.div<{ color: string }>`
  font-size: 1rem;
  font-weight: 500;
  color: ${({ color }) => {
    switch (color) {
      case 'blue': return '#2563eb';
      case 'green': return '#22c55e';
      case 'yellow': return '#eab308';
      case 'purple': return '#a21caf';
      default: return '#374151';
    }
  }};
`;

// Componente de notificación reutilizable
interface NotificationProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({
  type,
  message,
  onClose,
  autoClose = true,
  duration = 5000
}) => {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  return (
    <MessageContainer type={type}>
      <MessageIcon type={type}>
        {type === 'success' ? '✓' : '✕'}
      </MessageIcon>
      <MessageContent>
        {message}
      </MessageContent>
      <MessageCloseButton onClick={onClose}>
        ✕
      </MessageCloseButton>
    </MessageContainer>
  );
};

// Component
const Inventory = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, clearUser } = useUserStore();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { token } = useUserStore(); // <-- usar token del store

  // Estados principales
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MedicineType | null>(null);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showStockAlerts, setShowStockAlerts] = useState(false);
  const [showExpiringAlerts, setShowExpiringAlerts] = useState(false);

  // Nuevo estado para productos por vencer
  const [expiringAlerts, setExpiringAlerts] = useState<MedicineType[]>([]);
  const [expiringLoading, setExpiringLoading] = useState(false);

  const [providers, setProviders] = useState<{ id: number; name: string }[]>([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    expirationDate: '',
    lot: '',
    barcode: '',
    provider_id: '',
  });

  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'expiration_date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Items per page

  // Funciones de filtrado y ordenamiento
  const { data: products = [], isLoading: loading, error: fetchError } = useQuery<MedicineType[]>({
    queryKey: ['products'],
    queryFn: getMedicine
  });

  const { data: stockAlerts = [] } = useQuery<MedicineType[]>({
    queryKey: ['stockAlerts'],
    queryFn: getStockAlerts
  });

  const sortedProducts = useMemo(() => {
    return products
      .filter(product => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const matchesSearch = product.name.toLowerCase().includes(lowerSearchTerm) ||
          product.description.toLowerCase().includes(lowerSearchTerm) ||
          (product.barcode && product.barcode.toLowerCase().includes(lowerSearchTerm));

        const matchesCategory = !filterCategory || product.category === filterCategory;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        let aValue: any = a[sortBy];
        let bValue: any = b[sortBy];

        if (sortBy === 'price' || sortBy === 'stock') {
          aValue = Number(aValue);
          bValue = Number(bValue);
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [products, searchTerm, filterCategory, sortBy, sortOrder]);

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when page size changes
  };

  // Calculate total pages
  const totalPages = useMemo(() => Math.ceil(sortedProducts.length / pageSize), [sortedProducts.length, pageSize]);

  // Get current page items
  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedProducts.slice(startIndex, endIndex);
  }, [sortedProducts, currentPage, pageSize]);


  // Funciones de carga de datos
  useEffect(() => {
    if (fetchError) {
      setErrorMessage('Error al cargar productos. Por favor, intenta de nuevo.');
    }
  }, [fetchError]);

  // Obtener proveedores al montar
  useEffect(() => {
    const fetchProviders = async () => {
      setProvidersLoading(true);
      try {
        const data = await getProviders(token ?? undefined); // pasar undefined si token es null
        setProviders(data);
      } catch (error) {
        setErrorMessage('Error al cargar proveedores. Por favor, intenta de nuevo.');
        setProviders([]);
      } finally {
        setProvidersLoading(false);
      }
    };
    fetchProviders();
  }, [token]);

  // Obtener categorías desde la base de datos
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const data = await getCategoryList(token ?? undefined); // data: Category[]
        // Mapea a string[] (por ejemplo, usando data.map(c => c.name))
        setCategories(data.map((c: any) => c.name));
      } catch (error) {
        setErrorMessage('Error al cargar categorías. Por favor, intenta de nuevo.');
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, [token]);

  // Obtener productos por vencer al montar
  useEffect(() => {
    const fetchExpiring = async () => {
      setExpiringLoading(true);
      try {
        const data = await getExpiringSoonReport(token ?? undefined);
        setExpiringAlerts(data);
      } catch (error) {
        setExpiringAlerts([]);
      } finally {
        setExpiringLoading(false);
      }
    };
    fetchExpiring();
  }, [token]);

  // Generador automático de código de producto
  const generateProductCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `MED-${timestamp}-${random}`;
  };

  // Manejo del formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      expirationDate: '',
      lot: '',
      barcode: '',
      provider_id: '',
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const mutation = useMutation({
    mutationFn: (medicineData: CreateMedicineData) => {
      return editingProduct
        ? updateMedicine(editingProduct.id, medicineData)
        : createMedicine(medicineData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stockAlerts'] });
      setSuccessMessage(editingProduct ? 'Producto actualizado correctamente.' : 'Producto agregado correctamente.');
      resetForm();
    },
    onError: (err) => {
      setErrorMessage(editingProduct ? 'Error al actualizar el producto.' : 'Error al crear el producto.');
      console.error('Error submitting form:', err);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validación de campos obligatorios
    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.price ||
      !formData.stock ||
      !formData.lot.trim() ||
      !formData.expirationDate ||
      !formData.provider_id
    ) {
      setErrorMessage('Por favor, complete todos los campos obligatorios.');
      return;
    }
    const medicineData: CreateMedicineData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      expirationDate: formData.expirationDate,
      lot: formData.lot,
      category: formData.category || undefined,
      barcode: formData.barcode || generateProductCode(),
      provider_id: Number(formData.provider_id),
    };
    mutation.mutate(medicineData);
  };

  const handleEdit = (product: MedicineType) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price ? product.price.toString() : '',
      stock: product.stock ? product.stock.toString() : '',
      category: product.category || '',
      expirationDate: product.expiration_date ? product.expiration_date.split('T')[0] : '',
      lot: product.lot || '',
      barcode: product.barcode || '',
      provider_id: product.provider_id ? String(product.provider_id) : '',
    });
    setShowForm(true);
  };

  const deleteMutation = useMutation({
    mutationFn: deleteMedicine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stockAlerts'] });
      setSuccessMessage('Producto eliminado correctamente.');
    },
    onError: (err) => {
      setErrorMessage('Error al eliminar el producto.');
      console.error('Error deleting product:', err);
    }
  });

  const handleDelete = (id: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar este producto?')) {
      deleteMutation.mutate(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getStockLevel = (stock: number): 'low' | 'medium' | 'high' => {
    if (stock <= 10) return 'low';
    if (stock <= 50) return 'medium';
    return 'high';
  };

  const isExpiringSoon = (expirationDate: string) => {
    const expDate = new Date(expirationDate);
    const thirtyDaysFromNow = new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000);
    return expDate <= thirtyDaysFromNow;
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
              <SidebarMenuItem active={true}>
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

      <PageContainer>
        {/* Contenedor de notificaciones */}
        <NotificationContainer>
          {successMessage && (
            <Notification
              type="success"
              message={successMessage}
              onClose={() => setSuccessMessage(null)}
              autoClose={true}
              duration={4000}
            />
          )}
          {errorMessage && (
            <Notification
              type="error"
              message={errorMessage}
              onClose={() => setErrorMessage(null)}
              autoClose={true}
              duration={6000}
            />
          )}
        </NotificationContainer>

        <Header>
          <Title>Gestión de Inventario</Title>
          <ButtonContainer>
            <StockAlertButton
              onClick={() => setShowStockAlerts(!showStockAlerts)}
              hasAlerts={stockAlerts.length > 0}
            >
              Alertas de Stock ({stockAlerts.length})
            </StockAlertButton>
            <ExpiringAlertButton
              onClick={() => setShowExpiringAlerts(!showExpiringAlerts)}
              hasAlerts={expiringAlerts.length > 0}
            >
              Alertas de Vencimiento ({expiringAlerts.length})
            </ExpiringAlertButton>
            <PrimaryButton
              onClick={() => setShowForm(true)}
            >
              Agregar Producto
            </PrimaryButton>
            <BackToHomeButton onClick={() => navigate('/dashboard')}>
              Volver a inicio
            </BackToHomeButton>
          </ButtonContainer>
        </Header>

        {/* Alertas de Stock */}
        {showStockAlerts && (
          <StockAlertContainer>
            <StockAlertTitle>Productos con Stock Bajo</StockAlertTitle>
            {stockAlerts.length === 0 && (
              <span style={{ color: '#b91c1c', fontSize: '0.85rem' }}>No hay productos con stock bajo.</span>
            )}
            {stockAlerts.length > 0 && (
              <AlertGrid>
                {stockAlerts.map(product => (
                  <AlertCard key={product.id}>
                    <AlertProductName>{product.name}</AlertProductName>
                    <AlertText>Stock: {product.stock} unidades</AlertText>
                    <AlertText>Lote: {product.lot}</AlertText>
                  </AlertCard>
                ))}
              </AlertGrid>
            )}
          </StockAlertContainer>
        )}

        {/* Alertas de productos por vencer */}
        {showExpiringAlerts && (
          <ExpiringAlertContainer>
            <ExpiringAlertTitle>Productos por vencer</ExpiringAlertTitle>
            {expiringLoading && <span style={{ color: '#d97706', fontSize: '0.85rem' }}>Cargando productos por vencer...</span>}
            {!expiringLoading && expiringAlerts.length === 0 && (
              <span style={{ color: '#d97706', fontSize: '0.85rem' }}>No hay productos próximos a vencer.</span>
            )}
            {!expiringLoading && expiringAlerts.length > 0 && (
              <AlertGrid>
                {expiringAlerts.map(product => (
                  <AlertCard key={product.id}>
                    <AlertProductName>{product.name}</AlertProductName>
                    <AlertText>Vence: {formatDate(product.expiration_date)}</AlertText>
                    <AlertText>
                      Estado: {new Date(product.expiration_date) < new Date() ? 'Vencido' : 'Por vencer'}
                    </AlertText>
                    <AlertText>Lote: {product.lot}</AlertText>
                  </AlertCard>
                ))}
              </AlertGrid>
            )}
          </ExpiringAlertContainer>
        )}

        {/* Filtros y Búsqueda */}
        <Card>
          <FilterGrid>
            <FilterGroup>
              <Label>Buscar</Label>
              <Input
                type="text"
                placeholder="Buscar por nombre, descripción o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </FilterGroup>

            <FilterGroup>
              <Label>Categoría</Label>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Select>
            </FilterGroup>

            <FilterGroup>
              <Label>Ordenar por</Label>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="name">Nombre</option>
                <option value="price">Precio</option>
                <option value="stock">Stock</option>
                <option value="expiration_date">Fecha de vencimiento</option>
              </Select>
            </FilterGroup>

            <FilterGroup>
              <Label>Orden</Label>
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
              >
                <option value="asc">Ascendente</option>
                <option value="desc">Descendente</option>
              </Select>
            </FilterGroup>
          </FilterGrid>
        </Card>

        {/* Formulario de Producto */}
        {showForm && (
          <ModalOverlay>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>
                  {editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
                </ModalTitle>
                <CloseButton onClick={resetForm}>
                  ✕
                </CloseButton>
              </ModalHeader>

              <FormContainer onSubmit={handleSubmit}>
                <FormGrid>
                  <FilterGroup>
                    <Label>Nombre del Producto *</Label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </FilterGroup>

                  <FilterGroup>
                    <Label>Categoría *</Label>
                    <Select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      disabled={categoriesLoading}
                    >
                      <option value="">Seleccione categoría</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </Select>
                    {categoriesLoading && <span style={{ color: '#888', fontSize: '0.85rem' }}>Cargando categorías...</span>}
                    {!categoriesLoading && categories.length === 0 && (
                      <span style={{ color: '#dc2626', fontSize: '0.85rem' }}>No hay categorías disponibles.</span>
                    )}
                  </FilterGroup>
                </FormGrid>

                <FilterGroup>
                  <Label>Descripción *</Label>
                  <TextArea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                  />
                </FilterGroup>

                <FormGrid3>
                  <FilterGroup>
                    <Label>Precio *</Label>
                    <Input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      step="0.01"
                      min="0"
                    />
                  </FilterGroup>

                  <FilterGroup>
                    <Label>Stock *</Label>
                    <Input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                      min="0"
                    />
                  </FilterGroup>

                  <FilterGroup>
                    <Label>Lote *</Label>
                    <Input
                      type="text"
                      name="lot"
                      value={formData.lot}
                      onChange={handleInputChange}
                      required
                    />
                  </FilterGroup>
                </FormGrid3>

                <FormGrid>
                  <FilterGroup>
                    <Label>Fecha de Vencimiento *</Label>
                    <Input
                      type="date"
                      name="expirationDate"
                      value={formData.expirationDate}
                      onChange={handleInputChange}
                      required
                    />
                  </FilterGroup>

                  <FilterGroup>
                    <Label>Código de Barras</Label>
                    <Input
                      type="text"
                      name="barcode"
                      value={formData.barcode ?? ''}
                      onChange={handleInputChange}
                      placeholder="Se genera automáticamente si se deja vacío"
                    />
                  </FilterGroup>
                </FormGrid>

                <FilterGroup>
                  <Label>Proveedor *</Label>
                  <Select
                    name="provider_id"
                    value={formData.provider_id}
                    onChange={handleInputChange}
                    required
                    disabled={providersLoading}
                  >
                    <option value="">Seleccione proveedor</option>
                    {providers.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </Select>
                  {providersLoading && <span style={{ color: '#888', fontSize: '0.85rem' }}>Cargando proveedores...</span>}
                  {!providersLoading && providers.length === 0 && (
                    <span style={{ color: '#dc2626', fontSize: '0.85rem' }}>No hay proveedores disponibles.</span>
                  )}
                </FilterGroup>

                <FormActions>
                  <CancelButton
                    type="button"
                    onClick={resetForm}
                  >
                    Cancelar
                  </CancelButton>
                  <SubmitButton type="submit">
                    {editingProduct ? 'Actualizar' : 'Guardar'}
                  </SubmitButton>
                </FormActions>
              </FormContainer>
            </ModalContent>
          </ModalOverlay>
        )}

        {/* Tabla de Productos */}
        <TableContainer>
          <TableScrollContainer>
            <StyledTable>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Lote</th>
                  <th>Vencimiento</th>
                  <th>Código</th>
                  <th>Proveedor</th> {/* <-- nueva columna */}
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div>
                        <ProductName>{product.name}</ProductName>
                        <ProductDescription>{product.description}</ProductDescription>
                      </div>
                    </td>
                    <td>
                      {product.category || 'Sin categoría'}
                    </td>
                    <td>
                      <Price>
                        {new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(product.price)}
                      </Price>
                    </td>
                    <td>
                      <StockBadge stockLevel={getStockLevel(product.stock)}>
                        {product.stock} unidades
                      </StockBadge>
                    </td>
                    <td>
                      {product.lot}
                    </td>
                    <td>
                      <ExpirationDate isExpiringSoon={isExpiringSoon(product.expiration_date)}>
                        {formatDate(product.expiration_date)}
                      </ExpirationDate>
                    </td>
                    <td>
                      {product.barcode || 'N/A'}
                    </td>
                    <td>
                      {product.provider_name || 'Sin proveedor'}
                    </td>
                    <td>
                      <ActionContainer>
                        <EditButton onClick={() => handleEdit(product)}>
                          Editar
                        </EditButton>
                        <DeleteButton onClick={() => handleDelete(product.id)}>
                          Eliminar
                        </DeleteButton>
                      </ActionContainer>
                    </td>
                  </tr>
                ))}
              </tbody>
            </StyledTable>
          </TableScrollContainer>

          {sortedProducts.length === 0 && (
            <EmptyState>
              <p>No se encontraron productos</p>
            </EmptyState>
          )}
        </TableContainer>

        {/* Pagination Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', background: '#f9fafb', padding: '12px 16px', borderRadius: '8px' }}>
          <div>
            <Label htmlFor="pageSize">Productos por página:</Label>
            <Select id="pageSize" value={pageSize} onChange={handlePageSizeChange}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </Select>
          </div>

          {sortedProducts.length > pageSize && (
            <div>
              <BaseButton onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
                Anterior
              </BaseButton>
              <span style={{ margin: '0 1rem' }}>Página {currentPage} de {totalPages}</span>
              <BaseButton onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
                Siguiente
              </BaseButton>
            </div>
          )}
        </div>

        {/* Resumen */}
        <SummaryGrid>
          <SummaryCard color="blue">
            <SummaryValue color="blue">{products.length}</SummaryValue>
            <SummaryLabel color="blue">Total de Productos</SummaryLabel>
          </SummaryCard>
          <SummaryCard color="green">
            <SummaryValue color="green">
              {products.reduce((sum, p) => sum + p.stock, 0)}
            </SummaryValue>
            <SummaryLabel color="green">Total en Stock</SummaryLabel>
          </SummaryCard>
          <SummaryCard color="yellow">
            <SummaryValue color="yellow">{stockAlerts.length}</SummaryValue>
            <SummaryLabel color="yellow">Alertas de Stock</SummaryLabel>
          </SummaryCard>
          <SummaryCard color="purple">
            <SummaryValue color="purple">{categories.length}</SummaryValue>
            <SummaryLabel color="purple">Categorías</SummaryLabel>
          </SummaryCard>
        </SummaryGrid>
      </PageContainer>
    </>
  );
};

export default Inventory;