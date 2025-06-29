import { create } from 'zustand';

interface User {
  id: number;
  name: string;
  email: string;
  role: { name: string };
}

interface UserStore {
  user: User | null;
  token: string | null;
  setUser: (user: User, token: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  token: null,
  setUser: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));
const user = useUserStore((s) => s.user);
