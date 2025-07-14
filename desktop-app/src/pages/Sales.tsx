import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Search, ShoppingCart, Package, DollarSign, Hash, Plus, Trash2, CheckCircle, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getMedicine, getMedicineByBarcode } from '../services/inventory.service';
import { createSale } from '../services/sales.service'; 
import { useNavigate } from 'react-router-dom';

// Animaciones para las notificaciones
const slideInRight = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOutRight = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background-color: #f9fafb;
  padding: 1.5rem;
`;

const MaxWidthContainer = styled.div`
  max-width: 72rem;
  margin: 0 auto;
`;

const Header = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media (min-width: 1024px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const SearchSection = styled.div`
  @media (min-width: 1024px) {
    grid-column: span 2 / span 2;
  }
`;

const Card = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const CardTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
`;

const RadioInput = styled.input`
  accent-color: #2563eb;
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const SearchInputContainer = styled.div`
  flex: 1;
  position: relative;
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 0.75rem;
  top: 0.75rem;
  width: 1rem;
  height: 1rem;
  color: #9ca3af;
`;

const SearchInput = styled.input`
  width: 80%;
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    ring: 2px solid #2563eb;
    border-color: transparent;
  }
`;

const SearchButton = styled.button`
  padding: 0.2rem 1.5rem;
  background-color: #2592ebff;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  display:flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 300;
  
  &:hover {
    background-color: #1d4ed8;
  }
  
  &:disabled {
    background-color: #404347ff;
    cursor: not-allowed;
  }
`;

const ResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ResultItem = styled.div`
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #eff6ff;
    border-color: #93c5fd;
  }
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
  font-weight: 500;
  color: #1f2937;
  margin: 0;
`;

const ResultItemDescription = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
`;

const ResultItemPrice = styled.div`
  text-align: right;
`;

const Price = styled.p`
  font-weight: 600;
  color: #16a34a;
  margin: 0;
`;

const Stock = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const ProductInfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ProductInfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ProductInfoLabel = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
`;

const ProductInfoValue = styled.p`
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const ProductPriceValue = styled.p`
  font-weight: 600;
  color: #16a34a;
  font-size: 1.125rem;
  margin: 0;
`;

const ProductStockValue = styled.p<{ low?: boolean }>`
  font-weight: 600;
  color: ${props => props.low ? '#dc2626' : '#1f2937'};
  margin: 0;
`;

const ProductDescription = styled.div`
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
`;

const QuantityContainer = styled.div`
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const QuantityInput = styled.input`
  width: 5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  
  &:focus {
    outline: none;
    ring: 2px solid #2563eb;
    border-color: transparent;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #16a34a;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  margin-top: 1.25rem;
  
  &:hover {
    background-color: #15803d;
  }
  
  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
`;

const CartCard = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
  position: sticky;
  top: 1.5rem;
  
  @media (min-width: 1024px) {
    grid-column: span 1 / span 1;
  }
`;

const CartTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const EmptyCart = styled.p`
  color: #6b7280;
  text-align: center;
  padding: 2rem 0;
  margin: 0;
`;

const CartItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 16rem;
  overflow-y: auto;
`;

const CartItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background-color: #5696d6ff;
  border-radius: 0.5rem;
`;

const CartItemInfo = styled.div`
  flex: 1;
`;

const CartItemName = styled.h4`
  font-weight: 500;
  color: #1f2937;
  font-size: 0.875rem;
  margin: 0;
`;

const CartItemDetails = styled.p`
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
`;

const CartItemActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CartItemPrice = styled.span`
  font-weight: 600;
  color: #16a34a;
`;

const RemoveButton = styled.button`
  color: #ef4444;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  
  &:hover {
    color: #dc2626;
  }
`;

const CartTotal = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const TotalLabel = styled.span`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
`;

const TotalAmount = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: #16a34a;
`;

const ConfirmButton = styled.button`
  width: 90%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background-color: #1d4ed8;
  }
  
  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
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

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

// Componentes de Notificación
const NotificationContainer = styled.div`
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 24rem;
`;

const Notification = styled.div<{ type: 'success' | 'error'; isVisible: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  animation: ${props => props.isVisible ? slideInRight : slideOutRight} 0.3s ease-out;
  background-color: ${props => props.type === 'success' ? '#f0f9ff' : '#fef2f2'};
  border-left: 4px solid ${props => props.type === 'success' ? '#16a34a' : '#ef4444'};
`;

const NotificationIcon = styled.div<{ type: 'success' | 'error' }>`
  color: ${props => props.type === 'success' ? '#16a34a' : '#ef4444'};
  flex-shrink: 0;
`;

const NotificationContent = styled.div`
  flex: 1;
`;

const NotificationTitle = styled.h4<{ type: 'success' | 'error' }>`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.type === 'success' ? '#065f46' : '#991b1b'};
  margin: 0 0 0.25rem 0;
`;

const NotificationMessage = styled.p<{ type: 'success' | 'error' }>`
  font-size: 0.875rem;
  color: ${props => props.type === 'success' ? '#047857' : '#dc2626'};
  margin: 0;
`;

const NotificationCloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
  border-radius: 0.25rem;
  
  &:hover {
    color: #374151;
  }
`;

// Función para búsqueda por nombre (usa API real)
async function searchMedicineByName(name: string) {
  const medicines = await getMedicine();
  return medicines.filter(med => med.name.toLowerCase().includes(name.toLowerCase()));
}

interface SaleItemInput {
  medicineId: number;
  quantity: number;
}

interface Medicine {
  id: number;
  name: string;
  price: number;
  stock: number;
  barcode?: string;
  description: string;
}

interface NotificationState {
  id: number;
  type: 'success' | 'error';
  title: string;
  message: string;
  isVisible: boolean;
}

const SalesPOS: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'barcode' | 'name'>('barcode');
  const [product, setProduct] = useState<Medicine | null>(null);
  const [searchResults, setSearchResults] = useState<Medicine[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState<(SaleItemInput & { productInfo: Medicine })[]>([]);
  const [userId] = useState(1);
  const [clientId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationState[]>([]);

  // Función para mostrar notificaciones
  const showNotification = (type: 'success' | 'error', title: string, message: string) => {
    const id = Date.now();
    const newNotification: NotificationState = {
      id,
      type,
      title,
      message,
      isVisible: true
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, isVisible: false } : notif
        )
      );
      // Remove from array after animation completes
      setTimeout(() => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
      }, 300);
    }, 5000);
  };

  // Función para cerrar notificación manualmente
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

  // ✅ Búsqueda reactiva por nombre
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

  const handleSelectFromResults = (selectedProduct: Medicine) => {
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

    try {
      setLoading(true);
      const saleItems = items.map(item => ({
        medicineId: item.medicineId,
        quantity: item.quantity
      }));

      const result = await createSale(userId, clientId, saleItems);
      const blob = new Blob([Uint8Array.from(atob(result.pdf), c => c.charCodeAt(0))], {
        type: 'application/pdf',
      });

      const url = URL.createObjectURL(blob);
      window.open(url);

      setItems([]);
      showNotification('success', 'Venta confirmada', 'La venta se procesó exitosamente y se generó el PDF');
    } catch (error) {
      showNotification('error', 'Error en la venta', 'No se pudo procesar la venta. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const getTotal = () => {
    return items.reduce((total, item) => total + (Number(item.productInfo.price) * item.quantity), 0);
  };

  return (
    <Container>
      <MaxWidthContainer>
        <Header>
          <Title>
            <ShoppingCart color="#2563eb" />
            POS - Sistema de Ventas
          </Title>
           <ButtonContainer>
          <BaseButton onClick={() => navigate('/dashboard')} style={{ backgroundColor: '#bbbdc0ff', color: '#1e1f22ff',  }}>
            Volver a inicio
          </BaseButton>
           </ButtonContainer>
        </Header>

        <GridContainer>
          <SearchSection>
            <Card>
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
                          {product.barcode}
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
                    <TotalLabel>Total:</TotalLabel>
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
      <NotificationContainer>
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            type={notification.type}
            isVisible={notification.isVisible}
          >
            <NotificationIcon type={notification.type}>
              {notification.type === 'success' ? (
                <CheckCircle2 size={20} />
              ) : (
                <AlertCircle size={20} />
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
      </NotificationContainer>
    </Container>
  );
};

export default SalesPOS;