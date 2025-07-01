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
    <div className="min-h-screen flex items-center justify-center bg-[#ece8ff] px-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl flex overflow-hidden">
        {/* Izquierda: Formulario */}
        <div className="w-full md:w-1/2 p-10 md:p-14 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">LOGIN</h2>
          <p className="text-center text-gray-500 mb-8">How to i get started lorem ipsum dolor at?</p>

          <div className="space-y-5">
            <input
              type="email"
              placeholder="Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
            <button
              onClick={handleLogin}
              className="w-full bg-violet-500 text-white py-3 rounded-lg hover:bg-violet-600 transition"
            >
              Login Now
            </button>
          </div>

          <div className="mt-8 text-center text-gray-400">Login with Others</div>

          
        </div>

        {/* Derecha: Imagen */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-violet-500 to-blue-400 items-center justify-center relative">
          <div className="rounded-xl p-6">
            <img
              src="imagenes/partes-de-una-farmacia.jpg"
              alt="login visual"
              className="object-cover w-[300px] h-[300px] rounded-2xl shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
