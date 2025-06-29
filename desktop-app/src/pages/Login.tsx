import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth.service';
import { useUserStore } from '../store/user';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-xl font-bold">Iniciar Sesión</h1>
      <input
        className="border p-2 w-64"
        type="email"
        placeholder="Correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border p-2 w-64"
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleLogin}>
        Entrar
      </button>
    </div>
  );
};

export default Login;
