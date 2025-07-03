// src/pages/Inventory.tsx
import React, { useState, useEffect } from 'react';
import { useUserStore } from '../store/user';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  expiration_date: string;
  barcode: string;
}

const Inventory = () => {
  const { user, clearUser } = useUserStore();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    expiration_date: '',
    barcode: ''
  });

  useEffect(() => {
    // Simulación de carga de datos
    setTimeout(() => {
      setProducts([
        {
          id: 1,
          name: 'Paracetamol 500mg',
          description: 'Analgésico y antipirético',
          price: 5.50,
          stock: 150,
          category: 'Medicamentos',
          expiration_date: '2025-12-31',
          barcode: '1234567890123'
        },
        {
          id: 2,
          name: 'Ibuprofeno 400mg',
          description: 'Antiinflamatorio no esteroideo',
          price: 8.75,
          stock: 80,
          category: 'Medicamentos',
          expiration_date: '2025-11-30',
          barcode: '9876543210987'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingProduct) {
      setProducts(products.map(product => 
        product.id === editingProduct.id 
          ? { 
              ...product, 
              ...formData, 
              price: parseFloat(formData.price),
              stock: parseInt(formData.stock)
            }
          : product
      ));
    } else {
      const newProduct: Product = {
        id: Date.now(),
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
        expiration_date: formData.expiration_date,
        barcode: formData.barcode
      };
      setProducts([...products, newProduct]);
    }
    
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      expiration_date: '',
      barcode: ''
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
      expiration_date: product.expiration_date,
      barcode: product.barcode
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      setProducts(products.filter(product => product.id !== id));
    }
  };

  const handleLogout = () => {
    clearUser();
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Cargando inventario...</div>;
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Gestión de Inventario</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button onClick={handleLogout}>Cerrar Sesión</button>
        </div>
      </header>

      <div className="page-content">
        <div className="actions-bar">
          <button 
            className="btn-primary" 
            onClick={() => setShowForm(true)}
          >
            Nuevo Producto
          </button>
        </div>

        {showForm && (
          <div className="modal">
            <div className="modal-content">
              <h3>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nombre:</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Descripción:</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Precio:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Stock:</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Categoría:</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="Medicamentos">Medicamentos</option>
                    <option value="Cuidado Personal">Cuidado Personal</option>
                    <option value="Suplementos">Suplementos</option>
                    <option value="Bebé">Bebé</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Fecha de Expiración:</label>
                  <input
                    type="date"
                    value={formData.expiration_date}
                    onChange={(e) => setFormData({...formData, expiration_date: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Código de Barras:</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    {editingProduct ? 'Actualizar' : 'Crear'}
                  </button>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => {
                      setShowForm(false);
                      setEditingProduct(null);
                      setFormData({
                        name: '',
                        description: '',
                        price: '',
                        stock: '',
                        category: '',
                        expiration_date: '',
                        barcode: ''
                      });
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Categoría</th>
                <th>Expiración</th>
                <th>Código de Barras</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>{product.description}</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>{product.stock}</td>
                  <td>{product.category}</td>
                  <td>{product.expiration_date}</td>
                  <td>{product.barcode}</td>
                  <td>
                    <button onClick={() => handleEdit(product)}>Editar</button>
                    <button onClick={() => handleDelete(product.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;