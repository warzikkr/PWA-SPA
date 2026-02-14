import type { ClientChangeRequest } from '../types';
import { getItem, setItem, uid } from './storage';

const KEY = 'change_requests';

function getAll(): ClientChangeRequest[] {
  return getItem<ClientChangeRequest[]>(KEY, []);
}

/** TODO: replace with real API calls */
export const changeRequestService = {
  async list(): Promise<ClientChangeRequest[]> {
    return getAll();
  },

  async getPending(): Promise<ClientChangeRequest[]> {
    return getAll().filter((r) => r.status === 'pending');
  },

  async create(data: Omit<ClientChangeRequest, 'id' | 'createdAt' | 'status'>): Promise<ClientChangeRequest> {
    const all = getAll();
    const request: ClientChangeRequest = {
      ...data,
      id: uid(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    all.push(request);
    setItem(KEY, all);
    return request;
  },

  async update(id: string, data: Partial<ClientChangeRequest>): Promise<ClientChangeRequest | undefined> {
    const all = getAll();
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    all[idx] = { ...all[idx], ...data };
    setItem(KEY, all);
    return all[idx];
  },
};
