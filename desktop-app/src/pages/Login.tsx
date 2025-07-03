// src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth.service';
import { useUserStore } from '../store/user';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [bgError, setBgError] = useState(false);
  const { setUser } = useUserStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await login(email, password);
      console.log('Respuesta del login:', response);
      
      // El servicio ya maneja el localStorage, solo necesitamos actualizar el store
      setUser(response.user, response.accessToken);
      
      console.log('Usuario logueado:', response.user);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error de autenticación:', error);
      setError(error.response?.data?.message || 'Error de autenticación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="login-container"
      style={
        bgError
          ? { background: 'linear-gradient(120deg, #e0d7fa 0%, #b5c6e0 100%)' }
          : {}
      }
    >
      <img
        src="imagenes/partes-de-una-farmacia.jpg"
        alt=""
        style={{ display: 'none' }}
        onError={() => setBgError(true)}
        onLoad={() => setBgError(false)}
      />
      <div className="login-card">
        <div className="login-image-section">
          <img
            src="imagenes/Logo-Farmacia-Sencillo-Azul.gif"
            alt="login"
            className="login-image"
          />
        </div>
        <div className="login-form-section">
          <h2 className="login-title">INICIAR SESIÓN</h2>
          <p className="login-subtitle">¿Con qué perfil quieres iniciar?</p>
          
          {error && (
            <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <input
                type="email"
                placeholder="Usuario"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <button 
              type="submit" 
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;