import { create } from 'zustand';
import type { UserEntity } from '@user-management/types';

interface AuthState {
  user: UserEntity | null;
  token: string | null;
  setUser: (user: UserEntity) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  logout: () => set({ user: null, token: null }),
}));
