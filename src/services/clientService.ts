import type { Client, ClientAuditLog } from '../types';
import { mockClients } from '../data/mockData';
import { getItem, setItem, uid } from './storage';

const KEY = 'clients';

function getAll(): Client[] {
  return getItem<Client[]>(KEY, mockClients);
}

/** TODO: replace with real API calls */
export const clientService = {
  async list(): Promise<Client[]> {
    return getAll();
  },

  async getById(id: string): Promise<Client | undefined> {
    return getAll().find((c) => c.id === id);
  },

  async findByContact(query: string): Promise<Client[]> {
    const q = query.toLowerCase().trim();
    return getAll().filter(
      (c) =>
        c.email.toLowerCase().includes(q) ||
        c.contactValue.toLowerCase().includes(q) ||
        c.fullName.toLowerCase().includes(q)
    );
  },

  async create(data: Omit<Client, 'id' | 'createdAt'>): Promise<Client> {
    const all = getAll();
    const client: Client = { ...data, id: uid(), createdAt: new Date().toISOString() };
    all.push(client);
    setItem(KEY, all);
    return client;
  },

  async update(id: string, data: Partial<Client>): Promise<Client | undefined> {
    const all = getAll();
    const idx = all.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    all[idx] = { ...all[idx], ...data };
    setItem(KEY, all);
    return all[idx];
  },

  async delete(id: string): Promise<void> {
    const all = getAll().filter((c) => c.id !== id);
    setItem(KEY, all);
  },

  async addAuditEntry(clientId: string, entry: ClientAuditLog): Promise<void> {
    const all = getAll();
    const idx = all.findIndex((c) => c.id === clientId);
    if (idx === -1) return;
    const log = all[idx].auditLog ?? [];
    log.push(entry);
    all[idx] = { ...all[idx], auditLog: log };
    setItem(KEY, all);
  },

  async exportCSV(): Promise<string> {
    const all = getAll();
    const headers = ['Name', 'Email', 'Contact Method', 'Contact', 'Source', 'Tags', 'Created'];
    const rows = all.map((c) => [
      c.fullName, c.email, c.contactMethod, c.contactValue,
      c.marketingSource, c.tags.join(';'), c.createdAt,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },
};
