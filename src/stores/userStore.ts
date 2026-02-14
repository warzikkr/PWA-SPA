import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
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
    }),
    {
      name: 'spa_user_store',
      partialize: (state) => ({ users: state.users }),
    },
  ),
);
