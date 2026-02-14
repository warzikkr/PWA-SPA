import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '../types';
import { useUserStore } from './userStore';

interface AuthState {
  currentUser: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: () => boolean;
  hasRole: (...roles: UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,

      login: (username, password) => {
        const user = useUserStore.getState().getByUsername(username);
        if (!user || user.password !== password || !user.enabled) return false;
        set({ currentUser: user });
        return true;
      },

      logout: () => {
        set({ currentUser: null });
      },

      isAuthenticated: () => get().currentUser !== null,

      hasRole: (...roles) => {
        const user = get().currentUser;
        if (!user) return false;
        return roles.includes(user.role);
      },
    }),
    {
      name: 'spa_auth',
      partialize: (state) => ({ currentUser: state.currentUser }),
    },
  ),
);
