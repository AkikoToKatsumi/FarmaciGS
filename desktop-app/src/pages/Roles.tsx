import React, { useEffect, useState } from 'react';
import { getRoles, createRole, updateRole, deleteRole } from '../services/role.service';
import { useUserStore } from '../store/user';

const Roles = () => {
  const token = useUserStore((s) => s.token);
  const [roles, setRoles] = useState([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    const res = await getRoles(token!);
    setRoles(res);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.name.trim()) newErrors.name = 'El nombre es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (editingId) {
      await updateRole(editingId, form, token!);
    } else {
      await createRole(form, token!);
    }
    setForm({ name: '' });
    setEditingId(null);
    setErrors({});
    loadRoles();
  };

  const handleEdit = (role: any) => {
    setForm({ name: role.name });
    setEditingId(role.id);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Eliminar este rol?')) {
      await deleteRole(id, token!);
      loadRoles();
    }
  };

  // Estilos en línea adicionales
  const styles = {
    volverBtn: {
      marginBottom: '20px',
      padding: '8px 16px',
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    formInput: {
      marginBottom: '8px',
      padding: '8px',
      borderRadius: '6px',
      border: '1px solid #d1d5db',
      width: '100%'
    },
    table: {
      background: '#fff',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
      marginTop: '24px'
    },
    th: {
      background: '#f3f4f6',
      fontWeight: 700,
      padding: '10px'
    },
    td: {
      padding: '10px',
      borderBottom: '1px solid #e5e7eb'
    },
    actionBtn: {
      marginRight: '8px',
      padding: '6px 12px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer'
    },
    editBtn: {
      background: '#facc15',
      color: '#fff'
    },
    deleteBtn: {
      background: '#ef4444',
      color: '#fff'
    }
  };

  return (
    <div className="p-6">
      <button
        onClick={() => window.history.back()}
        style={styles.volverBtn}
      >
        ← Volver
      </button>
      <h1 className="text-xl font-bold mb-4">Roles</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Nombre del rol"
          value={form.name}
          onChange={e => {
            setForm({ ...form, name: e.target.value });
            if (errors.name) validateForm();
          }}
          style={styles.formInput}
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded mt-2">
          {editingId ? 'Actualizar' : 'Crear'} rol
        </button>
      </div>
      <table className="w-full border" style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Nombre</th>
            <th style={styles.th}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role: any) => (
            <tr key={role.id}>
              <td style={styles.td}>{role.id}</td>
              <td style={styles.td}>{role.name}</td>
              <td style={styles.td}>
                <button
                  onClick={() => handleEdit(role)}
                  style={{ ...styles.actionBtn, ...styles.editBtn }}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(role.id)}
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
  );
};

export default Roles;
