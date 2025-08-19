import React, { useState, useEffect } from 'react';
import { getCategories, createCategory, deleteCategory, Category } from '../services/category.service';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Layers, Trash2, Plus } from 'lucide-react';
import { useUserStore } from '../store/User';

const Container = styled.div`
  max-width: 480px;
  margin: 2.5rem auto;
  padding: 32px 28px 28px 28px;
  background: linear-gradient(120deg, #f7fafc 0%, #e3e9f7 100%);
  border-radius: 18px;
  box-shadow: 0 6px 32px rgba(37, 99, 235, 0.08);
  position: relative;
`;

const Title = styled.h2`
  margin-bottom: 18px;
  color: #2563eb;
  font-weight: 700;
  font-size: 1.7rem;
  text-align: center;
  letter-spacing: 0.5px;
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
  margin-bottom: 18px;

  &:hover {
    background: linear-gradient(90deg, #2563eb 0%, #60a5fa 100%);
    color: #fff;
    box-shadow: 0 4px 16px rgba(37, 99, 235, 0.15);
    transform: translateY(-2px) scale(1.03);
  }
`;

const Form = styled.form`
  display: flex;
  gap: 10px;
  margin-bottom: 22px;
  align-items: center;
  justify-content: center;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  font-size: 15px;
  background: #fff;
  transition: border-color 0.15s;
  &:focus {
    outline: none;
    border-color: #2563eb;
  }
`;

const Button = styled.button`
  padding: 10px 18px;
  border-radius: 8px;
  background: #2563eb;
  color: #fff;
  font-weight: 600;
  border: none;
  font-size: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.18s;
  &:hover {
    background: #1746a0;
  }
`;

const Error = styled.div`
  color: #e74c3c;
  background: #ffeaea;
  border-radius: 6px;
  padding: 8px 12px;
  margin-bottom: 10px;
  text-align: center;
  font-size: 14px;
  border-left: 4px solid #e74c3c;
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 18px;
  margin-top: 10px;
`;

const CategoryCard = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(37, 99, 235, 0.07);
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 18px 12px 14px 12px;
  position: relative;
  transition: box-shadow 0.18s, border-color 0.18s;
  &:hover {
    box-shadow: 0 6px 24px rgba(37, 99, 235, 0.13);
    border-color: #2563eb;
  }
`;

const CategoryIcon = styled(Layers)`
  color: #2563eb;
  background: #f3f4f6;
  border-radius: 50%;
  padding: 8px;
  width: 38px;
  height: 38px;
  margin-bottom: 8px;
`;

const CategoryName = styled.span`
  font-size: 1.08rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
  text-align: center;
  word-break: break-word;
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  color: #e74c3c;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: background 0.15s;
  &:hover {
    background: #ffeaea;
  }
`;

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { token } = useUserStore();

  const fetchCategories = async () => {
    try {
      const cats = await getCategories(token ?? '');
      console.log('Categorías recibidas en fetchCategories:', cats);
      // Normalizar: si es array de strings, convertir a objetos
      let normalized: Category[] = [];
      if (Array.isArray(cats)) {
        if (cats.length > 0 && typeof cats[0] === 'string') {
          normalized = cats.map((name, idx) => ({ id: idx + 1, name: String(name) }));
        } else if (typeof cats[0] === 'object' && cats[0] !== null) {
          normalized = cats.map((cat, idx) => ({ id: typeof cat.id === 'number' ? cat.id : idx + 1, name: cat.name ?? String(cat) }));
        }
      }
      setCategories(normalized);
      setError(null);
    } catch (err: any) {
      setCategories([]);
      setError('Error al cargar categorías');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      await createCategory(newCategory.trim(), token ?? '');
      setNewCategory('');
      fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al agregar categoría');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar esta categoría?')) return;
    try {
      await deleteCategory(id, token ?? '');
      fetchCategories();
    } catch (err: any) {
      const backendMsg = err?.response?.data?.error || err?.response?.data?.message;
      if (backendMsg) {
        setError(backendMsg);
      } else {
        setError('Error al eliminar categoría');
      }
    }
  };

  console.log('Estructura categories en render:', categories);
  return (
    <Container>
      <BackButton onClick={() => navigate('/dashboard')}>← Volver atrás</BackButton>
      <Title>Categorías</Title>
      <Form onSubmit={handleAdd}>
        <Input
          type="text"
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
          placeholder="Nueva categoría"
          required
        />
        <Button type="submit">
          <Plus size={18} />
          Agregar
        </Button>
      </Form>
      {error && <Error>{error}</Error>}
      <CategoryGrid>
        {categories.length === 0 && !error ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#6b7280', fontSize: '1rem', marginTop: '18px' }}>
            No hay categorías registradas.
          </div>
        ) : null}
        {categories.length > 0 && categories.map(cat => (
          <CategoryCard key={cat.id}>
            <CategoryIcon />
            <CategoryName>
              {cat.name && String(cat.name).trim() ? String(cat.name) : <span style={{color:'#e74c3c'}}>Sin nombre</span>}
            </CategoryName>
            <DeleteButton onClick={() => handleDelete(cat.id)} title="Eliminar">
              <Trash2 size={18} />
            </DeleteButton>
          </CategoryCard>
        ))}
      </CategoryGrid>
    </Container>
  );
};

export default CategoryManager;
