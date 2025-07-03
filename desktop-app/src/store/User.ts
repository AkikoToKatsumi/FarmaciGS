// src/store/user.ts
import { create } from 'zustand';

interface UserState {
  token: string | null;
  user: any | null;
  setUser: (user: any, token: string) => void;
  clearUser: () => void;
  isAuthenticated: () => boolean;
}

export const useUserStore = create<UserState>((set, get) => ({
  token: null,
  user: null,
  setUser: (user, token) => {
    // Guardar en localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Actualizar el store
    set({ user, token });
  },
  clearUser: () => {
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Limpiar el store
    set({ user: null, token: null });
  },
  isAuthenticated: () => {
    const { user, token } = get();
    return !!(user && token);
  },
}));