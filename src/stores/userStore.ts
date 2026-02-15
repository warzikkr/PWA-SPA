/**
 * userStore — Zustand store for users.
 *
 * SOURCE OF TRUTH: userService (localStorage via spa_users).
 * No Zustand persist — eliminates dual-persistence / stale-hydration bugs.
 *
 * Cross-tab sync: subscribeUserSync() reloads when another tab writes.
 */
import { create } from 'zustand';
import type { User } from '../types';
import { userService } from '../services/userService';

interface UserState {
  users: User[];
  loading: boolean;
  loadUsers: () => Promise<void>;
  createUser: (data: Omit<User, 'id'>) => Promise<User>;
  updateUser: (id: string, data: Partial<User>) => Promise<void>;
  toggleEnabled: (id: string) => Promise<void>;
  getByUsername: (username: string) => User | undefined;
}

export const useUserStore = create<UserState>()((set, get) => ({
  users: [],
  loading: true,

  loadUsers: async () => {
    const users = await userService.list();
    set({ users, loading: false });
  },

  createUser: async (data) => {
    const user = await userService.create(data);
    const users = await userService.list();
    set({ users });
    return user;
  },

  updateUser: async (id, data) => {
    await userService.update(id, data);
    const users = await userService.list();
    set({ users });
  },

  toggleEnabled: async (id) => {
    await userService.toggleEnabled(id);
    const users = await userService.list();
    set({ users });
  },

  getByUsername: (username) => get().users.find((u) => u.username === username),
}));

const USER_STORAGE_KEY = 'spa_users';

/** Cross-tab sync for users. Returns cleanup function. */
export function subscribeUserSync(): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key === USER_STORAGE_KEY) {
      useUserStore.getState().loadUsers();
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
