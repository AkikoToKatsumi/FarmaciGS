import React, { useEffect, useState } from 'react';
import { getClients, createClient, updateClient, deleteClient } from '../services/client.service';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/user';

const Clients = () => {
  const token = useUserStore((s) => s.token);
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    const res = await getClients(token!);
    setClients(res);
  };

  const validateForm = () => {
    const e: { [key: string]: string } = {};
    if (!form.name.trim()) e.name = 'El nombre es obligatorio';
    if (form.email && !form.email.includes('@')) e.email = 'Email inválido';
    if (form.phone && form.phone.length < 7) e.phone = 'Teléfono inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (editingId) {
      await updateClient(editingId, form, token!);
    } else {
      await createClient(form, token!);
    }

    setForm({ name: '', email: '', phone: '' });
    setEditingId(null);
    setErrors({});
    loadClients();
  };

  const handleEdit = (c: any) => {
    setForm({ name: c.name, email: c.email || '', phone: c.phone || '' });
    setEditingId(c.id);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar este cliente?')) {
      await deleteClient(id, token!);
      loadClients();
    }
  };

  // Estilos en línea optimizados tipo "carta"
  const styles = {
    card: {
      background: '#fff',
      borderRadius: '16px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
      padding: '32px',
      maxWidth: '1100px',
      margin: '32px auto',
      minHeight: '400px'
    },
    formRow: {
      display: 'flex',
      gap: '16px',
      marginBottom: '24px',
      flexWrap: 'wrap' as 'wrap' // Corrige el tipo para React.CSSProperties
    },
    formInput: {
      flex: 1,
      minWidth: '200px',
      marginBottom: '0',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      fontSize: '1rem'
    },
    error: {
      color: '#ef4444',
      fontSize: '0.95rem',
      margin: '4px 0 0 4px'
    },
    actionBtn: {
      marginRight: '8px',
      padding: '8px 16px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: '0.95rem'
    },
    editBtn: {
      background: '#3b82f6',
      color: '#fff'
    },
    deleteBtn: {
      background: '#ef4444',
      color: '#fff'
    },
    submitBtn: {
      background: '#22c55e',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      padding: '12px 24px',
      fontWeight: 700,
      fontSize: '1rem',
      marginTop: '8px',
      marginBottom: '16px',
      cursor: 'pointer'
    },
    table: {
      width: '100%',
      borderCollapse: 'separate' as const,
      borderSpacing: '0 8px'
    },
    th: {
      background: '#f3f4f6',
      fontWeight: 700,
      padding: '12px',
      border: 'none'
    },
    td: {
      background: '#f9fafb',
      padding: '12px',
      border: 'none',
      borderRadius: '8px'
    },
    tableRow: {
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <button 
        onClick={() => navigate('/dashboard')} 
        style={{ 
          
          marginBottom: '20px', 
          padding: '8px 16px', 
          backgroundColor: '#ffffffff', 
          color: 'black', 
          border: 'none', 
          borderRadius: '4px' 
        }}
      >
        ← Volver
      </button>


      <div
        
      style={styles.card}>
      <h1 className="text-xl font-bold mb-4" style={{marginBottom: 24}}>Clientes</h1>
      <div style={styles.formRow}>
        <div style={{flex: 1}}>
          <input
            type="text"
            placeholder="Nombre"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={styles.formInput}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p style={styles.error}>{errors.name}</p>}
        </div>
        <div style={{flex: 1}}>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={styles.formInput}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && <p style={styles.error}>{errors.email}</p>}
        </div>
        <div style={{flex: 1}}>
          <input
            type="text"
            placeholder="Teléfono"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            style={styles.formInput}
            className={errors.phone ? 'border-red-500' : ''}
          />
          {errors.phone && <p style={styles.error}>{errors.phone}</p>}
        </div>
      </div>
      <button onClick={handleSubmit} style={styles.submitBtn}>
        {editingId ? 'Actualizar' : 'Crear'} Cliente
      </button>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Nombre</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Teléfono</th>
            <th style={styles.th}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c: any) => (
            <tr key={c.id} style={styles.tableRow}>
              <td style={styles.td}>{c.id}</td>
              <td style={styles.td}>{c.name}</td>
              <td style={styles.td}>{c.email}</td>
              <td style={styles.td}>{c.phone}</td>
              <td style={styles.td}>
                <button
                  onClick={() => handleEdit(c)}
                  style={{ ...styles.actionBtn, ...styles.editBtn }}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  style={{ ...styles.actionBtn, ...styles.deleteBtn }}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
};

export default Clients;
