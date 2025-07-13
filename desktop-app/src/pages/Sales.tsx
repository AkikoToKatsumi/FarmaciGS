import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Search, ShoppingCart, Package, DollarSign, Hash, Plus, Trash2, CheckCircle } from 'lucide-react';
import { getMedicine, getMedicineByBarcode } from '../services/inventory.service';
import { createSale } from '../services/sales.service';
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
  width: 100%;
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
  padding: 0.5rem 1.5rem;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  
  &:hover {
    background-color: #1d4ed8;
  }
  
  &:disabled {
    background-color: #9ca3af;
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
  background-color: #f9fafb;
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
  width: 100%;
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
`;



// Styled Components
// ... (todo tu bloque de styled components queda igual, sin cambios)

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

const SalesPOS: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'barcode' | 'name'>('barcode');
  const [product, setProduct] = useState<Medicine | null>(null);
  const [searchResults, setSearchResults] = useState<Medicine[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState<(SaleItemInput & { productInfo: Medicine })[]>([]);
  const [userId] = useState(1);
  const [clientId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

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
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      if (searchType === 'barcode') {
        const result = await getMedicineByBarcode(searchTerm);
        setProduct(result);
        setSearchResults([]);
      } else {
        const results = await searchMedicineByName(searchTerm);
        setSearchResults(results);
        setProduct(null);
      }
    } catch (error) {
      alert('Producto no encontrado');
      setProduct(null);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFromResults = (selectedProduct: Medicine) => {
    setProduct(selectedProduct);
    setSearchResults([]);
  };

  const handleAddItem = () => {
    if (!product || quantity < 1 || quantity > product.stock) return;

    const existingItemIndex = items.findIndex(item => item.medicineId === product.id);

    if (existingItemIndex > -1) {
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += quantity;
      setItems(updatedItems);
    } else {
      setItems([...items, {
        medicineId: product.id,
        quantity,
        productInfo: product
      }]);
    }

    setProduct(null);
    setSearchTerm('');
    setQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleConfirmSale = async () => {
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
  };

  const getTotal = () => {
    return items.reduce((total, item) => total + (item.productInfo.price * item.quantity), 0);
  };

  return (
    <Container>
      <MaxWidthContainer>
        <Header>
          <Title>
            <ShoppingCart color="#2563eb" />
            POS - Sistema de Ventas
          </Title>
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
                          <Price>${medicine.price.toFixed(2)}</Price>
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
                        <ProductPriceValue>${product.price.toFixed(2)}</ProductPriceValue>
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
                          {item.quantity} × ${item.productInfo.price.toFixed(2)}
                        </CartItemDetails>
                      </CartItemInfo>
                      <CartItemActions>
                        <CartItemPrice>
                          ${(item.quantity * item.productInfo.price).toFixed(2)}
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

                  <ConfirmButton onClick={handleConfirmSale}>
                    <CheckCircle size={20} />
                    Confirmar Venta
                  </ConfirmButton>
                </CartTotal>
              </>
            )}
          </CartCard>
        </GridContainer>
      </MaxWidthContainer>
    </Container>
  );
};

export default SalesPOS;
