import axios from 'axios';

const isElectron = () => {
  return typeof window !== 'undefined' && (window as any).electron !== undefined;
};

const API = axios.create({
  baseURL: 'http://localhost:4004/api',
});

// Interceptor para agregar el token de autorización a todas las peticiones
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de conexión en Electron
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Si hay error de conexión y estamos en Electron, intentar usar IPC
    if (isElectron() && (error.code === 'ECONNREFUSED' || error.code === 'ERR_CONNECTION_REFUSED')) {
      console.log('❌ Backend no disponible, intentando usar SQLite local...');
      
      // Por ahora, rechazamos el error, pero en el futuro podríamos implementar fallback
      // const ipcApi = (await import('./ipc-api')).default;
      // return ipcApi.handleRequest(error.config);
    }
    
    return Promise.reject(error);
  }
);

export default API;