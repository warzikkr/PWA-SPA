import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

export const useClientStore = create<ClientState>()(
  persist(
    (set, get) => ({
      clients: [],
      loading: true,

      loadClients: async () => {
        const clients = await clientService.list();
        set({ clients, loading: false });
      },

      getById: (id) => get().clients.find((c) => c.id === id),

      findOrCreate: async (data) => {
        // Try to find existing client by email
        const existing = await clientService.findByContact(data.email);
        if (existing.length > 0) {
          const client = existing[0];
          // Refresh store
          const clients = await clientService.list();
          set({ clients });
          return client;
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
    }),
    {
      name: 'spa_client_store',
      partialize: (state) => ({ clients: state.clients }),
    },
  ),
);
