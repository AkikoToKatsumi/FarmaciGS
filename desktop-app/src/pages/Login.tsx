import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth.service';
import { useUserStore } from '../store/user';
import './Login.css'; // Importamos el CSS

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bgError, setBgError] = useState(false);
  const setUser = useUserStore((s) => s.setUser);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await login(email, password);
      setUser(res.user, res.accessToken);
      navigate('/dashboard');
    } catch (error) {
      alert('Error de autenticación');
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
      {/* Imagen de fondo oculta, solo para comprobar si existe */}
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
          <div className="input-group">
            <input
              type="email"
              placeholder="Usuario"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="login-button" onClick={handleLogin}>
            Entrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
