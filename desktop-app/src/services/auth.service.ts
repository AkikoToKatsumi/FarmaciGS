// src/services/auth.service.ts
import API from './api';
import IPCApiService from './ipc-api';

const isElectron = () => {
  // Verificar si estamos en Electron de varias formas
  if (typeof window === 'undefined') return false;
  
  // Método 1: Check window.electron (preload script)
  if ((window as any).electron !== undefined) return true;
  if ((window as any).__ELECTRON_PRELOAD__ !== undefined) return true;
  
  // Método 2: Check for ipcRenderer
  if (typeof (window as any).ipcRenderer !== 'undefined') return true;
  
  // Método 3: Check navigator.userAgent
  if (navigator.userAgent && navigator.userAgent.includes('Electron')) return true;
  
  // Método 4: Check if process.type exists (Electron main/renderer process)
  if (typeof (window as any).process !== 'undefined' && (window as any).process.type) return true;
  
  // Método 5: Try requiring electron module
  if (typeof require !== 'undefined') {
    try {
      const electron = require('electron');
      return !!(electron.ipcRenderer || electron.remote);
    } catch (e) {
      return false;
    }
  }
  
  return false;
};

export const login = async (email: string, password: string) => {
  try {
    console.log('🔐 isElectron():', isElectron());
    // Si estamos en Electron, intentar login local primero
    if (isElectron()) {
      try {
        console.log('🔐 Intentando login local con SQLite...');
        const result = await IPCApiService.login(email, password);
        console.log('✅ Login local exitoso:', result);
        return result;
      } catch (localError: any) {
        console.log('⚠️ Login local falló:', localError.message);
        throw localError;
      }
    }
    // Si no es Electron, intentar con el backend remoto (opcional)
    console.log('🌐 Intentando login con backend remoto...');
    const res = await API.post('/auth/login', { email, password });
    console.log('Respuesta completa del servidor:', res.data);
    return res.data; // Retorna { user, accessToken }
  } catch (error: any) {
    console.error('Error en login:', error.response?.data || error.message);
    throw error;
  }
};

export const logout = async () => {
  try {
    // Si estamos en Electron, simplemente limpiar localStorage
    if (isElectron()) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { success: true };
    }

    const res = await API.post('/auth/logout');
    return res.data;
  } catch (error: any) {
    console.error('Error en logout:', error);
    // Limpiar de todas formas
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { success: true };
  }

};

export const refreshToken = async () => {
  try {
    // Si estamos en Electron, no necesitamos refresh
    if (isElectron()) {
      const token = localStorage.getItem('token');
      if (token) {
        return { accessToken: token };
      }
      throw new Error('Sin token');
    }

    const res = await API.post('/auth/refresh');
    return res.data;
  } catch (error: any) {
    console.error('Error en refresh token:', error);
    throw error;
  }

};