import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';
import { Search, Info, ShoppingCart, Package, DollarSign, Hash, Plus, Trash2, CheckCircle, X, AlertCircle, CheckCircle2, User, Phone, Mail } from 'lucide-react';
import { getMedicine, getMedicineByBarcode, Medicine as MedicineType } from '../services/inventory.service';
import { createSale, getClientById } from '../services/sales.service';
import { getPrescriptionsByClient } from '../services/prescription.service';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/user';

// Animaciones suaves y minimalistas
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

// Contenedor principal
const Container = styled.div`
  min-height: 100vh;
  background: #fafafa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #1a1a1a;
`;

const MaxWidthContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
`;

// Header minimalista
const Header = styled.div`
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
  padding: 24px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
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

// Grid layout
const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;

  @media (min-width: 1024px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const SearchSection = styled.div`
  @media (min-width: 1024px) {
    grid-column: span 2 / span 2;
  }
`;

// Cards minimalistas
const Card = styled.div`
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
  padding: 24px;
  margin-bottom: 24px;
  animation: ${fadeIn} 0.3s ease;
  
  &:hover {
    border-color: #d0d0d0;
  }
`;

const CardTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 20px 0;
`;

// Controles de forma
const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;
`;

const Select = styled.select`
  width: 85%;
  padding: 12px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  color: #1a1a1a;
  transition: border-color 0.15s ease;
  
  &:focus {
    outline: none;
    border-color: #0066cc;
  }
`;

const Input = styled.input`
  width: 85%;
  padding: 12px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  color: #1a1a1a;
  transition: border-color 0.15s ease;
  
  &:focus {
    outline: none;
    border-color: #0066cc;
  }
  
  &::placeholder {
    color: #999;
  }
`;

// Radio buttons minimalistas
const RadioGroup = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  color: #666;
  transition: all 0.15s ease;
  
  &:hover {
    background: #f0f0f0;
    color: #333;
  }
`;

const RadioInput = styled.input`
  width: 16px;
  height: 16px;
  accent-color: #0066cc;
`;

// Búsqueda
const SearchContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
`;

const SearchInputContainer = styled.div`
  flex: 1;
  position: relative;
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #999;
`;

const SearchInput = styled.input`
  width: 85%;
  padding: 12px 12px 12px 40px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  color: #1a1a1a;
  transition: border-color 0.15s ease;
  
  &:focus {
    outline: none;
    border-color: #0066cc;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const SearchButton = styled.button`
  padding: 12px 24px;
  background: #0066cc;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease;
  
  &:hover {
    background: #0052a3;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

// Resultados de búsqueda
const ResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ResultItem = styled.div`
  padding: 16px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  background: white;
  
  &:hover {
    background: #f9f9f9;
    border-color: #0066cc;
  }
`;
const ResultItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ResultItemContent = styled.div`
  display: flex;
  justify-content: space-between; 
  align-items: flex-start;
`;

const ResultItemInfo = styled.div`
  flex: 1;
`;

const ResultItemName = styled.h4`
  font-size: 15px;
  font-weight: 500;
  color: #1a1a1a;
  margin: 0 0 4px 0;
`;

const ResultItemDescription = styled.p`
  font-size: 13px;
  color: #666;
  margin: 0;
`;

const ResultItemPrice = styled.div`
  text-align: right;
`;

const Price = styled.p`
  font-size: 16px;
  font-weight: 600;
  color: #0066cc;
  margin: 0;
`;

const Stock = styled.p`
  font-size: 12px;
  color: #666;
  margin: 4px 0 0 0;
`;

// Producto seleccionado
const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const ProductInfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ProductInfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
`;

const ProductInfoLabel = styled.p`
  font-size: 12px;
  color: #666;
  margin: 0 0 2px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ProductInfoValue = styled.p`
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  margin: 0;
`;

const ProductPriceValue = styled.p`
  font-size: 20px;
  font-weight: 600;
  color: #0066cc;
  margin: 0;
`;

const ProductStockValue = styled.p<{ low?: boolean }>`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.low ? '#cc0000' : '#1a1a1a'};
  margin: 0;
`;

const ProductDescription = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
`;

const QuantityContainer = styled.div`
  margin-top: 16px;
  display: flex;
  align-items: end;
  gap: 16px;
`;

const QuantityInput = styled.input`
  width: 80px;
  padding: 12px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #0066cc;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #00cc66;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease;
  
  &:hover {
    background: #00b359;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

// Carrito
const CartCard = styled.div`
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
  padding: 24px;
  position: sticky;
  top: 24px;
  height: fit-content;
  
  @media (min-width: 1024px) {
    grid-column: span 1 / span 1;
  }
`;

const CartTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const EmptyCart = styled.p`
  color: #999;
  text-align: center;
  padding: 40px 0;
  margin: 0;
  font-size: 14px;
`;

const CartItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 4px;
  margin-bottom: 16px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #f5f5f5;
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 2px;
  }
`;

const CartItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
`;

const CartItemInfo = styled.div`
  flex: 1;
`;

const CartItemName = styled.h4`
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  margin: 0 0 4px 0;
`;

const CartItemDetails = styled.p`
  font-size: 12px;
  color: #666;
  margin: 0;
`;

const CartItemActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CartItemPrice = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #0066cc;
`;

const RemoveButton = styled.button`
  color: #cc0000;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.15s ease;
  
  &:hover {
    background: #ffe6e6;
  }
`;

const CartTotal = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e5e5;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 4px 0;
`;

const TotalLabel = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
`;

const TotalAmount = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #0066cc;
`;

const ConfirmButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: #0066cc;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease;
  margin-top: 16px;
  
  &:hover {
    background: #0052a3;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

// Componentes de prescripción corregidos
const PrescriptionSection = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e5e5;
`;

const PrescriptionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PrescriptionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const PrescriptionItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #f0fdf4;
  border-radius: 6px;
  border: 1px solid #bbf7d0;
`;

const PrescriptionItemInfo = styled.div`
  flex: 1;
`;

const PrescriptionItemName = styled.h4`
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  margin: 0 0 4px 0;
`;

const PrescriptionItemDetails = styled.p`
  font-size: 12px;
  color: #16a34a;
  margin: 0;
`;

const PrescriptionItemActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PrescriptionItemPrice = styled.div`
  text-align: right;
`;

const PrescriptionPrice = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #16a34a;
`;

const PrescriptionTotalSection = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PrescriptionTotal = styled.div`
  display: flex;
  flex-direction: column;
`;

const PrescriptionTotalLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #16a34a;
`;

const AddPrescriptionButton = styled.button`
  background: #16a34a;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.2s;

  &:hover {
    background: #15803d;
  }

  &:active {
    transform: scale(0.95);
  }
`;

const AddAllPrescriptionButton = styled.button`
  background: #16a34a;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: #15803d;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ClientInfoSection = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e5e5;
`;

const ClientInfoTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px 0;
`;

const ClientInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
`;

const ClientInfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
`;

const ClientInfoLabel = styled.p`
  font-size: 12px;
  color: #666;
  margin: 0 0 2px 0;
  text-transform: uppercase;
`;

const ClientInfoValue = styled.p`
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  margin: 0;
`;

// Componentes de notificación corregidos
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
  animation: ${props => props.isVisible ? slideIn : slideOut} 0.3s ease;
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

// Función para búsqueda por nombre (usa API real)
async function searchMedicineByName(name: string) {
  const medicines = await getMedicine();
  return medicines.filter(med => med.name.toLowerCase().includes(name.toLowerCase()));
}
// src/types/sales.types.ts

export interface PrescriptionInfo {
  id: number;
  name: string;
  quantity: number;
  price: number;
  medicine_id: number;
}

export interface ClientWithDetails {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  rnc?: string;
  address?: string;
}

export interface PrescriptionWithMedicines {
  id: number;
  issued_at: string;
  medicines: PrescriptionInfo[];
}

export interface NotificationState {
  id: number;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  isVisible: boolean;
}

export interface SaleItemInput {
  medicineId: number;
  quantity: number;
}

export interface SaleResponse {
  sale: {
    id: number;
    total: number;
    created_at: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  pdf: string;
}

const SalesPOS: React.FC = () => {
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta' | 'transferencia'>('efectivo');
  const [rnc, setRnc] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<PrescriptionInfo[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientWithDetails | null>(null);
  const [clients, setClients] = useState<{ id: number; name: string }[]>([]);
  const [clientPrescriptions, setClientPrescriptions] = useState<PrescriptionWithMedicines[]>([]);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<number | null>(null);

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'barcode' | 'name'>('barcode');
  const [product, setProduct] = useState<MedicineType | null>(null);
  const [searchResults, setSearchResults] = useState<MedicineType[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState<(SaleItemInput & { productInfo: MedicineType })[]>([]);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationState[]>([]);
  const { user, token, clearUser } = useUserStore();

  // Cargar lista de clientes al inicio
  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      
      try {
        const response = await axios.get('http://localhost:4004/api/clients', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClients(response.data);
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [token]);

  // Cuando se selecciona un cliente, cargar su información completa y recetas
  useEffect(() => {
    const loadClientData = async () => {
      if (!selectedClientId) {
        setSelectedClient(null);
        setClientPrescriptions([]);
        setSelectedProducts([]);
        setRnc('');
        return;
      }

      try {
        setLoading(true);
        
        // Cargar información completa del cliente
        const clientData = await getClientById(selectedClientId, token!);
        setSelectedClient(clientData);
        
        // Llenar automáticamente el RNC si el cliente lo tiene
        if (clientData.rnc) {
          setRnc(clientData.rnc);
        }

        // Cargar todas las recetas del cliente usando prescription.service
        const prescriptions = await getPrescriptionsByClient(selectedClientId, token!);
        setClientPrescriptions(prescriptions);

        // Si hay recetas, seleccionar la más reciente por defecto
        // if (prescriptions.length > 0) {
        //   const latestPrescription = prescriptions[0]; // Ya están ordenadas por fecha DESC
        //   setSelectedPrescriptionId(latestPrescription.id); 
        //   setSelectedProducts(latestPrescription.medicines || []);
        // }
        setSelectedPrescriptionId(null);
        setSelectedProducts([]);
        
        showNotification('success', 'Cliente seleccionado', 
          `Se cargó la información de ${clientData.name}${prescriptions.length > 0 ? ` con ${prescriptions.length} receta(s)` : ''}`);
        
      } catch (error) {
        console.error('Error al cargar datos del cliente:', error);
        showNotification('error', 'Error', 'No se pudo cargar la información del cliente');
        setSelectedClient(null);
        setClientPrescriptions([]);
        setSelectedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadClientData();
  }, [selectedClientId, token]);

  // Cuando se selecciona una receta específica
  const handlePrescriptionSelect = (prescriptionId: number) => {
    const prescription = clientPrescriptions.find(p => p.id === prescriptionId);
    if (prescription) {
      setSelectedPrescriptionId(prescriptionId); 
      setSelectedProducts(prescription.medicines || []);
      showNotification('info', 'Receta seleccionada',
        `Se cargaron ${prescription.medicines?.length || 0} medicamentos de la receta #${prescriptionId}`);
    }
  };

  const handleAddPrescriptionItem = async (prescriptionItem: PrescriptionInfo) => {
    try {
      const medicines = await getMedicine();
      const fullMedicine = medicines.find(med => med.id === prescriptionItem.medicine_id);

      if (!fullMedicine) {
        showNotification('error', 'Error', 'No se encontró información completa del medicamento');
        return;
      }

      if (prescriptionItem.quantity > fullMedicine.stock) {
        showNotification('error', 'Stock insuficiente', `Solo hay ${fullMedicine.stock} unidades disponibles de ${prescriptionItem.name}`);
        return;
      } 

      const existingItemIndex = items.findIndex(item => item.medicineId === prescriptionItem.medicine_id);

      if (existingItemIndex > -1) {
        const existingQuantity = items[existingItemIndex].quantity;
        const newTotalQuantity = existingQuantity + prescriptionItem.quantity;

        if (newTotalQuantity > fullMedicine.stock) {
          showNotification('error', 'Stock insuficiente', `Ya tienes ${existingQuantity} unidades en el carrito. No puedes agregar ${prescriptionItem.quantity} más.`);
          return;
        }

        const updatedItems = [...items];
        updatedItems[existingItemIndex].quantity = newTotalQuantity;
        setItems(updatedItems);
      } else {
        setItems([...items, {
          medicineId: prescriptionItem.medicine_id,
          quantity: prescriptionItem.quantity,
          productInfo: fullMedicine
        }]);
      }

      showNotification('success', 'Medicamento agregado', `Se agregó ${prescriptionItem.name} de la receta al carrito`);

    } catch (error) {
      console.error('Error al agregar medicamento de receta:', error);
      showNotification('error', 'Error', 'No se pudo agregar el medicamento al carrito');
    }
  };

  // Función para mostrar notificaciones
  const showNotification = (type: 'success' | 'error' | 'info', title: string, message: string) => {
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
    }, 5000);
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

  // Búsqueda reactiva por nombre
  useEffect(() => {
    if (searchType === 'name' && searchTerm.trim().length > 1) {
      const delayDebounce = setTimeout(() => {
        handleSearch();
      }, 300);
      return () => clearTimeout(delayDebounce);
    }
  }, [searchTerm, searchType]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      showNotification('error', 'Error de búsqueda', 'Por favor ingresa un término de búsqueda');
      return;
    }

    setLoading(true);
    try {
      if (searchType === 'barcode') {
        const result = await getMedicineByBarcode(searchTerm);
        setProduct(result);
        setSearchResults([]);
        showNotification('success', 'Producto encontrado', `Se encontró: ${result.name}`);
      } else {
        const results = await searchMedicineByName(searchTerm);
        if (results.length === 0) {
          showNotification('error', 'Sin resultados', 'No se encontraron productos con ese nombre');
        } else {
          showNotification('success', 'Búsqueda exitosa', `Se encontraron ${results.length} producto(s)`);
        }
        setSearchResults(results);
        setProduct(null);
      }
    } catch (error) {
      showNotification('error', 'Producto no encontrado', 'No se pudo encontrar el producto solicitado');
      setProduct(null);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFromResults = (selectedProduct: MedicineType) => {
    setProduct(selectedProduct);
    setSearchResults([]);
    showNotification('success', 'Producto seleccionado', `Seleccionaste: ${selectedProduct.name}`);
  };

  const handleAddItem = () => {
    if (!product) {
      showNotification('error', 'Error', 'No hay producto seleccionado');
      return;
    }

    if (quantity < 1) {
      showNotification('error', 'Cantidad inválida', 'La cantidad debe ser mayor a 0');
      return;
    }

    if (quantity > product.stock) {
      showNotification('error', 'Stock insuficiente', `Solo hay ${product.stock} unidades disponibles`);
      return;
    }

    const existingItemIndex = items.findIndex(item => item.medicineId === product.id);

    if (existingItemIndex > -1) {
      const existingQuantity = items[existingItemIndex].quantity;
      const newTotalQuantity = existingQuantity + quantity;

      if (newTotalQuantity > product.stock) {
        showNotification('error', 'Stock insuficiente', `Ya tienes ${existingQuantity} unidades en el carrito. No puedes agregar ${quantity} más.`);
        return;
      }

      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity = newTotalQuantity;
      setItems(updatedItems);
      showNotification('success', 'Producto actualizado', `Se actualizó la cantidad de ${product.name} a ${newTotalQuantity} unidades`);
    } else {
      setItems([...items, {
        medicineId: product.id,
        quantity,
        productInfo: product
      }]);
      showNotification('success', 'Producto agregado', `Se agregó ${quantity} unidad(es) de ${product.name} al carrito`);
    }

    setProduct(null);
    setSearchTerm('');
    setQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    const removedItem = items[index];
    setItems(items.filter((_, i) => i !== index));
    showNotification('success', 'Producto removido', `Se removió ${removedItem.productInfo.name} del carrito`);
  };

  const handleConfirmSale = async () => {
    if (items.length === 0) {
      showNotification('error', 'Carrito vacío', 'No puedes confirmar una venta sin productos');
      return;
    }

    if (!token) {
      showNotification('error', 'Error de autenticación', 'No se encontró token de autenticación. Por favor inicia sesión.');
      navigate('/login');
      return;
    }

    if (!user || !user.id) {
      showNotification('error', 'Error de usuario', 'No se pudo identificar al usuario. Por favor, reinicia sesión.');
      return;
    }

    try {
      setLoading(true);
      console.log('Iniciando venta con items:', items);
      console.log('Token disponible:', token ? 'Sí' : 'No');

      const saleItems = items.map(item => ({
        medicineId: item.medicineId,
        quantity: item.quantity
      }));

      console.log('Datos enviados:', { userId: user.id, clientId: selectedClientId, saleItems });

      const result = await createSale(
        user.id,
        selectedClientId,
        saleItems,
        token,
        paymentMethod,
        rnc
      );

      console.log('Resultado de la API:', result);

      if (result?.pdf) {
        const blob = new Blob([Uint8Array.from(atob(result.pdf), c => c.charCodeAt(0))], {
          type: 'application/pdf',
        });
        const url = URL.createObjectURL(blob);
        window.open(url);

        setItems([]);
        showNotification('success', 'Venta confirmada', 'La venta se procesó exitosamente y se generó el PDF');
      }
    } catch (error: any) {
      console.error('Error completo:', error);
      console.error('Error response:', error.response);

      if (error.response?.status === 401) {
        showNotification('error', 'Error de autenticación', 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
        clearUser();
        navigate('/login');
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Error en los datos enviados';
        showNotification('error', 'Error de validación', errorMessage);
      } else if (error.response?.status === 500) {
        const errorMessage = error.response?.data?.message || 'Error interno del servidor';
        showNotification('error', 'Error del servidor', errorMessage);
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
        showNotification('error', 'Error en la venta', `No se pudo procesar la venta: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getSubtotal = () => {
    return items.reduce((sum, item) => sum + item.productInfo.price * item.quantity, 0);
  };

  const getItbis = () => { 
    const subtotal = getSubtotal();
    return subtotal * 0.18;
  };

  const getTotal = () => {
    return getSubtotal() + getItbis();
  };

  // Añadir función para cancelar factura
  const cancelSaleById = async (saleId: number, token: string): Promise<{ message: string }> => {
    const response = await axios.patch(
      `http://localhost:4004/api/sales/${saleId}/cancel`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  };

  const [cancelSaleId, setCancelSaleId] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  // Handler para cancelar factura
  const handleCancelSale = async () => {
    if (!cancelSaleId.trim()) {
      showNotification('error', 'Error', 'Debes ingresar un número de factura');
      return;
    }
    if (!token) {
      showNotification('error', 'Error de autenticación', 'No se encontró token de autenticación.');
      return;
    }
    setCancelLoading(true);
    try {
      const result = await cancelSaleById(Number(cancelSaleId), token);
      showNotification('success', 'Factura cancelada', result.message);
      setCancelSaleId('');
    } catch (error: any) {
      if (error.response?.status === 403) {
        showNotification('error', 'Acceso denegado', error.response?.data?.message || 'Solo el administrador puede cancelar facturas.');
      } else if (error.response?.data?.message) {
        showNotification('error', 'Error', error.response.data.message);
      } else {
        showNotification('error', 'Error', 'No se pudo cancelar la factura');
      }
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <Container>
      <MaxWidthContainer>
        <Header>
          <Title>
            <ShoppingCart color="#0066cc" size={24} />
            Ventas
          </Title>
          <BackButton onClick={() => navigate('/dashboard')}>
         ← Volver a inicio
          </BackButton>
        </Header>

        {/* Opción para cancelar factura solo para admin */}
        {user?.role_name === 'admin' && (
          <Card style={{ marginBottom: 32, border: '2px solid #f56565', background: '#fff5f5' }}>
            <CardTitle style={{ color: '#b91c1c' }}>Cancelar Factura</CardTitle>
            <FormGroup>
              <Label htmlFor="cancelSaleId">Número de Factura</Label>
              <Input
                id="cancelSaleId"
                type="number"
                placeholder="Ingrese el número de factura a cancelar"
                value={cancelSaleId}
                onChange={e => setCancelSaleId(e.target.value)}
                style={{ width: 200, marginRight: 12 }}
                min={1}
              />
              <SearchButton
                style={{ background: '#dc2626', marginLeft: 8 }}
                onClick={handleCancelSale}
                disabled={cancelLoading || !cancelSaleId.trim()}
                type="button"
              >
                {cancelLoading ? 'Cancelando...' : 'Cancelar Factura'}
              </SearchButton>
            </FormGroup>
            <p style={{ color: '#b91c1c', fontSize: 13, marginTop: 8 }}>
              Solo el administrador puede cancelar facturas. Esta acción es irreversible.
            </p>
          </Card>
        )}

        <GridContainer>
          <SearchSection>
            <Card>
              <CardTitle>Información del cliente</CardTitle>

              <FormGroup>
                <Label>Método de Pago</Label>
                <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as any)}>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Cliente existente (opcional)</Label>
                <Select value={selectedClientId ?? ''} onChange={(e) => setSelectedClientId(Number(e.target.value) || null)}>
                  <option value="">-- Ninguno --</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </Select>
              </FormGroup>

              {selectedClient && (
                <ClientInfoSection>
                  <ClientInfoTitle>Información del Cliente</ClientInfoTitle>
                  <ClientInfoGrid>
                    <ClientInfoItem>
                      <User size={16} color="#2563eb" />
                      <div>
                        <ClientInfoLabel>Nombre</ClientInfoLabel>
                        <ClientInfoValue>{selectedClient.name}</ClientInfoValue>
                      </div>
                    </ClientInfoItem>
                    {selectedClient.phone && (
                      <ClientInfoItem>
                        <Phone size={16} color="#2563eb" />
                        <div>
                          <ClientInfoLabel>Teléfono</ClientInfoLabel>
                          <ClientInfoValue>{selectedClient.phone}</ClientInfoValue>
                        </div>
                      </ClientInfoItem>
                    )}
                    {selectedClient.email && (
                      <ClientInfoItem>
                        <Mail size={16} color="#2563eb" />
                        <div>
                          <ClientInfoLabel>Email</ClientInfoLabel>
                          <ClientInfoValue>{selectedClient.email}</ClientInfoValue>
                        </div>
                      </ClientInfoItem>
                    )}
                  </ClientInfoGrid>
                </ClientInfoSection>
              )}

              <FormGroup>
                <Label>RNC (opcional)</Label>
                <Input type="text" value={rnc} onChange={(e) => setRnc(e.target.value)} placeholder="RNC del cliente" />
              </FormGroup>

              {/* Selector de recetas si el cliente tiene múltiples */}
              {clientPrescriptions.length > 1 && (
                <FormGroup>
                  <Label>Seleccionar Receta</Label>
                  <Select 
                    value={selectedPrescriptionId ?? ''} 
                    onChange={(e) => handlePrescriptionSelect(Number(e.target.value))}
                  >
                    <option value="">-- Selecciona una receta --</option>
                    {clientPrescriptions.map(prescription => (
                      <option key={prescription.id} value={prescription.id}>
                        Receta #{prescription.id} - {new Date(prescription.issued_at).toLocaleDateString('es-ES')} 
                        ({prescription.medicines?.length || 0} medicamentos)
                      </option>
                    ))}
                  </Select>
                </FormGroup>
              )}

              {selectedProducts.length > 0 && (
                <PrescriptionSection>
                  <PrescriptionTitle>
                    <Package size={18} color="#16a34a" />
                    Medicamentos Recetados - Receta #{selectedPrescriptionId} ({selectedProducts.length})
                  </PrescriptionTitle>

                  <PrescriptionList>
                    {selectedProducts.map((prod, index) => (
                      <PrescriptionItem key={index}>
                        <PrescriptionItemInfo>
                          <PrescriptionItemName>{prod.name}</PrescriptionItemName>
                          <PrescriptionItemDetails>
                            Cantidad: {prod.quantity} × RD${prod.price.toFixed(2)}
                          </PrescriptionItemDetails>
                        </PrescriptionItemInfo>
                        <PrescriptionItemActions>
                          <PrescriptionItemPrice>
                            <PrescriptionPrice>
                              RD${(prod.quantity * prod.price).toFixed(2)}
                            </PrescriptionPrice>
                          </PrescriptionItemPrice>
                          <AddPrescriptionButton
                            onClick={() => handleAddPrescriptionItem(prod)}
                            title="Agregar al carrito"
                          >
                            <Plus size={16} />
                          </AddPrescriptionButton>
                        </PrescriptionItemActions>
                      </PrescriptionItem>
                    ))}
                  </PrescriptionList>

                  <PrescriptionTotalSection>
                    <PrescriptionTotal>
                      <PrescriptionTotalLabel>
                        Total receta: RD${selectedProducts.reduce((sum, prod) => sum + (prod.quantity * prod.price), 0).toFixed(2)}
                      </PrescriptionTotalLabel>
                    </PrescriptionTotal>
                    <AddAllPrescriptionButton
                      onClick={() => {
                        selectedProducts.forEach(prod => handleAddPrescriptionItem(prod));
                      }}
                    >
                      <ShoppingCart size={16} />
                      Agregar todos al carrito
                    </AddAllPrescriptionButton>
                  </PrescriptionTotalSection>
                </PrescriptionSection>
              )}

              <CardTitle>Buscar Producto</CardTitle>
              <RadioGroup>
                <RadioLabel>
                  <RadioInput
                    type="radio"
                    name="searchType"
                    value="barcode"
                    checked={searchType === 'barcode'}
                    onChange={(e) => setSearchType(e.target.value as 'barcode' | 'name')}
                  />
                  <Hash size={16} />
                  Código de barras
                </RadioLabel>
                <RadioLabel>
                  <RadioInput
                    type="radio"
                    name="searchType"
                    value="name"
                    checked={searchType === 'name'}
                    onChange={(e) => setSearchType(e.target.value as 'barcode' | 'name')}
                  />
                  <Package size={16} />
                  Nombre del producto
                </RadioLabel>
              </RadioGroup>

              <SearchContainer>
                <SearchInputContainer>
                  <SearchIcon />
                  <SearchInput
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={searchType === 'barcode' ? 'Escanear o escribir código de barras' : 'Buscar por nombre del producto'}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </SearchInputContainer>
                <SearchButton
                  onClick={handleSearch}
                  disabled={loading || !searchTerm.trim()}
                >
                  {loading ? 'Buscando...' : 'Buscar'}
                </SearchButton>
              </SearchContainer>
            </Card>

            {searchResults.length > 0 && (
              <Card>
                <CardTitle>Resultados de búsqueda</CardTitle>
                <ResultsContainer>
                  {searchResults.map((medicine) => (
                    <ResultItem
                      key={medicine.id}
                      onClick={() => handleSelectFromResults(medicine)}
                    >
                      <ResultItemContent>
                        <ResultItemInfo>
                          <ResultItemName>{medicine.name}</ResultItemName>
                          <ResultItemDescription>{medicine.description}</ResultItemDescription>
                        </ResultItemInfo>
                        <ResultItemPrice>
                          <Price>${Number(medicine.price).toFixed(2)}</Price>
                          <Stock>Stock: {medicine.stock}</Stock>
                        </ResultItemPrice>
                      </ResultItemContent>
                    </ResultItem>
                  ))}
                </ResultsContainer>
              </Card>
            )}

            {product && (
              <Card>
                <CardTitle>Producto Seleccionado</CardTitle>
                <ProductGrid>
                  <ProductInfoSection>
                    <ProductInfoItem>
                      <Package size={20} color="#2563eb" />
                      <div>
                        <ProductInfoLabel>Nombre</ProductInfoLabel>
                        <ProductInfoValue>{product.name}</ProductInfoValue>
                      </div>
                    </ProductInfoItem>
                    <ProductInfoItem>
                      <Hash size={20} color="#2563eb" />
                      <div>
                        <ProductInfoLabel>Código de barras</ProductInfoLabel>
                        <ProductInfoValue style={{ fontFamily: 'monospace' }}>
                          {product.barcode || 'N/A'}
                        </ProductInfoValue>
                      </div>
                    </ProductInfoItem>
                  </ProductInfoSection>
                  <ProductInfoSection>
                    <ProductInfoItem>
                      <DollarSign size={20} color="#16a34a" />
                      <div>
                        <ProductInfoLabel>Precio</ProductInfoLabel>
                        <ProductPriceValue>${Number(product.price).toFixed(2)}</ProductPriceValue>
                      </div>
                    </ProductInfoItem>
                    <div>
                      <ProductInfoLabel>Stock disponible</ProductInfoLabel>
                      <ProductStockValue low={product.stock < 10}>
                        {product.stock} unidades
                      </ProductStockValue>
                    </div>
                  </ProductInfoSection>
                </ProductGrid>

                <ProductDescription>
                  <ProductInfoLabel>Descripción</ProductInfoLabel>
                  <ProductInfoValue>{product.description}</ProductInfoValue>
                </ProductDescription>

                <QuantityContainer>
                  <div>
                    <ProductInfoLabel>Cantidad</ProductInfoLabel>
                    <QuantityInput
                      type="number"
                      value={quantity}
                      min={1}
                      max={product.stock}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                  </div>
                  <AddButton
                    onClick={handleAddItem}
                    disabled={quantity < 1 || quantity > product.stock}
                  >
                    <Plus size={16} />
                    Agregar al carrito
                  </AddButton>
                </QuantityContainer>
              </Card>
            )}
          </SearchSection>

          <CartCard>
            <CartTitle>
              <ShoppingCart size={20} />
              Carrito ({items.length})
            </CartTitle>

            {items.length === 0 ? (
              <EmptyCart>El carrito está vacío</EmptyCart>
            ) : (
              <>
                <CartItems>
                  {items.map((item, index) => (
                    <CartItem key={index}>
                      <CartItemInfo>
                        <CartItemName>{item.productInfo.name}</CartItemName>
                        <CartItemDetails>
                          {item.quantity} × ${Number(item.productInfo.price).toFixed(2)}
                        </CartItemDetails>
                      </CartItemInfo>
                      <CartItemActions>
                        <CartItemPrice>
                          ${(item.quantity * Number(item.productInfo.price)).toFixed(2)}
                        </CartItemPrice>
                        <RemoveButton onClick={() => handleRemoveItem(index)}>
                          <Trash2 size={16} />
                        </RemoveButton>
                      </CartItemActions>
                    </CartItem>
                  ))}
                </CartItems>

                <CartTotal>
                  <TotalRow>
                    <TotalLabel>Subtotal:</TotalLabel>
                    <TotalAmount>${getSubtotal().toFixed(2)}</TotalAmount>
                  </TotalRow>
                  <TotalRow>
                    <TotalLabel>ITBIS (18%):</TotalLabel>
                    <TotalAmount>${getItbis().toFixed(2)}</TotalAmount>
                  </TotalRow>
                  <TotalRow>
                    <TotalLabel>Total a pagar:</TotalLabel>
                    <TotalAmount>${getTotal().toFixed(2)}</TotalAmount>
                  </TotalRow>

                  <ConfirmButton
                    onClick={handleConfirmSale}
                    disabled={loading || items.length === 0}
                  >
                    <CheckCircle size={20} />
                    {loading ? 'Procesando...' : 'Confirmar Venta'}
                  </ConfirmButton>
                </CartTotal>
              </>
            )}
          </CartCard>
        </GridContainer>
      </MaxWidthContainer>

      {/* Sistema de Notificaciones */}
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
              <NotificationTitle type={notification.type}>{notification.title}</NotificationTitle>
              <NotificationMessage type={notification.type}>{notification.message}</NotificationMessage>
            </NotificationContent>
            <NotificationCloseButton onClick={() => closeNotification(notification.id)}>
              <X size={18} />
            </NotificationCloseButton>
          </Notification>
        ))}
      </NotificationsContainer>
    </Container>
  );
};

export default SalesPOS;