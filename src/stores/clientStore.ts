/**
 * clientStore — Zustand store for clients.
 *
 * SOURCE OF TRUTH: clientService (localStorage via spa_clients).
 * No Zustand persist — eliminates dual-persistence / stale-hydration bugs.
 *
 * Cross-tab sync: subscribeClientSync() reloads when another tab writes.
 */
import { create } from 'zustand';
import type { Client, ClientPreferences, ClientAuditLog } from '../types';
import { clientService } from '../services/clientService';

interface ClientState {
  clients: Client[];
  loading: boolean;
  loadClients: () => Promise<void>;
  getById: (id: string) => Client | undefined;
  findOrCreate: (data: Omit<Client, 'id' | 'createdAt'>) => Promise<Client>;
  updatePreferences: (clientId: string, prefs: ClientPreferences) => Promise<void>;
  addVisit: (clientId: string, bookingId: string) => Promise<void>;
  updateClient: (id: string, data: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addAuditEntry: (clientId: string, entry: ClientAuditLog) => Promise<void>;
}

export const useClientStore = create<ClientState>()((set, get) => ({
  clients: [],
  loading: true,

  loadClients: async () => {
    const clients = await clientService.list();
    set({ clients, loading: false });
  },

  getById: (id) => get().clients.find((c) => c.id === id),

  findOrCreate: async (data) => {
    // Match by contactValue (primary identifier since email was removed from kiosk)
    const query = data.contactValue?.trim();
    if (query) {
      const existing = await clientService.findByContact(query);
      // Only match if contactMethod + contactValue both match exactly
      const exact = existing.find(
        (c) =>
          c.contactMethod === data.contactMethod &&
          c.contactValue.toLowerCase() === query.toLowerCase(),
      );
      if (exact) {
        // Update name/gender if changed
        await clientService.update(exact.id, {
          fullName: data.fullName,
          gender: data.gender,
        });
        const clients = await clientService.list();
        set({ clients });
        return { ...exact, fullName: data.fullName, gender: data.gender };
      }
    }
    // Create new
    const client = await clientService.create(data);
    const clients = await clientService.list();
    set({ clients });
    return client;
  },

  updatePreferences: async (clientId, prefs) => {
    const client = get().clients.find((c) => c.id === clientId);
    if (!client) return;
    const merged: ClientPreferences = { ...client.preferences, ...prefs };
    await clientService.update(clientId, { preferences: merged });
    const clients = await clientService.list();
    set({ clients });
  },

  addVisit: async (clientId, bookingId) => {
    const client = get().clients.find((c) => c.id === clientId);
    if (!client) return;
    const history = [...(client.visitHistory ?? []), bookingId];
    await clientService.update(clientId, { visitHistory: history });
    const clients = await clientService.list();
    set({ clients });
  },

  updateClient: async (id, data) => {
    await clientService.update(id, data);
    const clients = await clientService.list();
    set({ clients });
  },

  deleteClient: async (id) => {
    await clientService.delete(id);
    const clients = await clientService.list();
    set({ clients });
  },

  addAuditEntry: async (clientId, entry) => {
    await clientService.addAuditEntry(clientId, entry);
    const clients = await clientService.list();
    set({ clients });
  },
}));

const CLIENT_STORAGE_KEY = 'spa_clients';

/** Cross-tab sync for clients. Returns cleanup function. */
export function subscribeClientSync(): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key === CLIENT_STORAGE_KEY) {
      useClientStore.getState().loadClients();
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
