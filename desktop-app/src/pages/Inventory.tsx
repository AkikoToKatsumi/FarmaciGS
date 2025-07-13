// src/pages/Inventory.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  getMedicine, 
  createMedicine, 
  updateMedicine, 
  deleteMedicine, 
  getStockAlerts,
  Medicine as MedicineType, 
  CreateMedicineData, 
  UpdateMedicineData 
} from '../services/inventory.service';

// --- Styled Components ---

const PageContainer = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem 1rem;
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
  transition: background-color 0.2s;
  font-size: 0.875rem;
`;

const PrimaryButton = styled(BaseButton)`
  background-color: #4299e1;
  color: white;
  &:hover {
    background-color: #3182ce;
  }
`;

const AlertButton = styled(BaseButton)<{ hasAlerts: boolean }>`
  background-color: ${props => props.hasAlerts ? '#f56565' : '#e2e8f0'};
  color: ${props => props.hasAlerts ? 'white' : '#4a5568'};
  &:hover {
    background-color: ${props => props.hasAlerts ? '#e53e3e' : '#cbd5e0'};
  }
`;

const ErrorMessage = styled.div`
  background-color: #fed7d7;
  border: 1px solid #f56565;
  color: #c53030;
  padding: 0.75rem 1rem;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
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
  color: #2563eb;
  
  &:hover {
    color: #1d4ed8;
    background-color: #dbeafe;
  }
`;

const DeleteButton = styled(ActionButton)`
  color: #dc2626;
  
  &:hover {
    color: #b91c1c;
    background-color: #fee2e2;
  }
`;

const ActionContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Price = styled.span`
  font-weight: 500;
  color: #111827;
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
  background-color: #fef3c7;
  border: 1px solid #fbbf24;
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

// Summary styles
const SummaryGrid = styled.div`
  margin-top: 1.5rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const SummaryCard = styled.div<{ color: 'blue' | 'green' | 'yellow' | 'purple' }>`
  padding: 1rem;
  border-radius: 0.5rem;
  
  ${props => {
    switch (props.color) {
      case 'blue':
        return 'background-color: #dbeafe;';
      case 'green':
        return 'background-color: #dcfce7;';
      case 'yellow':
        return 'background-color: #fef3c7;';
      case 'purple':
        return 'background-color: #f3e8ff;';
      default:
        return 'background-color: #f3f4f6;';
    }
  }}
`;

const SummaryValue = styled.div<{ color: 'blue' | 'green' | 'yellow' | 'purple' }>`
  font-size: 2rem;
  font-weight: 700;
  
  ${props => {
    switch (props.color) {
      case 'blue':
        return 'color: #2563eb;';
      case 'green':
        return 'color: #16a34a;';
      case 'yellow':
        return 'color: #d97706;';
      case 'purple':
        return 'color: #9333ea;';
      default:
        return 'color: #6b7280;';
    }
  }}
`;

const SummaryLabel = styled.div<{ color: 'blue' | 'green' | 'yellow' | 'purple' }>`
  font-size: 0.875rem;
  
  ${props => {
    switch (props.color) {
      case 'blue':
        return 'color: #2563eb;';
      case 'green':
        return 'color: #16a34a;';
      case 'yellow':
        return 'color: #d97706;';
      case 'purple':
        return 'color: #9333ea;';
      default:
        return 'color: #6b7280;';
    }
  }}
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
  font-size: 1.125rem;
  color: #6b7280;
`;

// Component
const Inventory = () => {
   const navigate = useNavigate();
  // Estados principales
  const [products, setProducts] = useState<MedicineType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MedicineType | null>(null);
  const [showAlerts, setShowAlerts] = useState(false);
  const [stockAlerts, setStockAlerts] = useState<MedicineType[]>([]);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    expirationDate: '',
    lot: '',
    supplier: '',
    barcode: ''
  });

  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'expiration_date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchProducts();
    fetchStockAlerts();
  }, []);

  // Funciones de carga de datos
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getMedicine();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar productos');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockAlerts = async () => {
    try {
      const alerts = await getStockAlerts();
      setStockAlerts(alerts);
    } catch (err) {
      console.error('Error fetching stock alerts:', err);
    }
  };

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
      supplier: '',
      barcode: ''
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const medicineData: CreateMedicineData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        expirationDate: formData.expirationDate,
        lot: formData.lot,
        category: formData.category || undefined,
        barcode: formData.barcode || generateProductCode()
      };

      if (editingProduct) {
        await updateMedicine(editingProduct.id, medicineData);
      } else {
        await createMedicine(medicineData);
      }

      await fetchProducts();
      await fetchStockAlerts();
      resetForm();
      setError(null);
    } catch (err) {
      setError(editingProduct ? 'Error al actualizar producto' : 'Error al crear producto');
      console.error('Error submitting form:', err);
    }
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
    supplier: '', // No tenemos supplier en el tipo Medicine
    barcode: product.barcode || ''
  });
  setShowForm(true);
};
 

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar este producto?')) {
      try {
        await deleteMedicine(id);
        await fetchProducts();
        await fetchStockAlerts();
        setError(null);
      } catch (err) {
        setError('Error al eliminar producto');
        console.error('Error deleting product:', err);
      }
    }
  };

  // Funciones de filtrado y ordenamiento
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

  // Obtener categorías únicas para el filtro
  const categories = useMemo(() => [...new Set(products.map(p => p.category).filter(Boolean))], [products]);

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

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          Cargando...
        </LoadingContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
               <Title>Gestión de Inventario</Title>
        <ButtonContainer>
          <AlertButton
            onClick={() => setShowAlerts(!showAlerts)}
            hasAlerts={stockAlerts.length > 0}
          >
            Alertas de Stock ({stockAlerts.length})
          </AlertButton>
          <PrimaryButton
            onClick={() => setShowForm(true)}
          >
            Agregar Producto
          </PrimaryButton>
          <BaseButton onClick={() => navigate('/dashboard')} style={{ backgroundColor: '#f3f4f6', color: '#374151' }}>
           volver a inicio
          </BaseButton>
        </ButtonContainer>
      </Header>

      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}

      {/* Alertas de Stock */}
      {showAlerts && stockAlerts.length > 0 && (
        <AlertContainer>
          <AlertTitle>Productos con Stock Bajo</AlertTitle>
          <AlertGrid>
            {stockAlerts.map(product => (
              <AlertCard key={product.id}>
                <AlertProductName>{product.name}</AlertProductName>
                <AlertText>Stock: {product.stock} unidades</AlertText>
                <AlertText>Lote: {product.lot}</AlertText>
              </AlertCard>
            ))}
          </AlertGrid>
        </AlertContainer>
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
              {categories.map(category => (
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
                  <Label>Categoría</Label>
                  <Input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="Ej: Analgésicos, Antibióticos..."
                  />
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
                    value={formData.barcode}
                    onChange={handleInputChange}
                    placeholder="Se genera automáticamente si se deja vacío"
                  />
                </FilterGroup>
              </FormGrid>
              
              <FilterGroup>
                <Label>Proveedor</Label>
                <Input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                />
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
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map((product) => (
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
                      {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(product.price)}
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
  );
};

export default Inventory;