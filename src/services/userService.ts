import type { User } from '../types';
import { mockUsers } from '../data/mockData';
import { getItem, setItem, uid } from './storage';

const KEY = 'users';

function getAll(): User[] {
  return getItem<User[]>(KEY, mockUsers);
}

/** TODO: replace with real API calls */
export const userService = {
  async list(): Promise<User[]> {
    return getAll();
  },

  async getByUsername(username: string): Promise<User | undefined> {
    return getAll().find((u) => u.username === username);
  },

  async getById(id: string): Promise<User | undefined> {
    return getAll().find((u) => u.id === id);
  },

  async create(data: Omit<User, 'id'>): Promise<User> {
    const all = getAll();
    const user: User = { ...data, id: uid() };
    all.push(user);
    setItem(KEY, all);
    return user;
  },

  async update(id: string, data: Partial<User>): Promise<User | undefined> {
    const all = getAll();
    const idx = all.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    all[idx] = { ...all[idx], ...data };
    setItem(KEY, all);
    return all[idx];
  },

  async toggleEnabled(id: string): Promise<void> {
    const all = getAll();
    const idx = all.findIndex((u) => u.id === id);
    if (idx === -1) return;
    all[idx] = { ...all[idx], enabled: !all[idx].enabled };
    setItem(KEY, all);
  },
};
