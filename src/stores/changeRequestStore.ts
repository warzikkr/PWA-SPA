/**
 * changeRequestStore — Zustand in-memory cache for change requests.
 * Source of truth: Supabase (via changeRequestService).
 * Realtime sync handled by realtimeSync.ts.
 */
import { create } from 'zustand';
import type { ClientChangeRequest, User } from '../types';
import { changeRequestService } from '../services/changeRequestService';
import { clientService } from '../services/clientService';

interface ChangeRequestState {
  requests: ClientChangeRequest[];
  loading: boolean;
  loadRequests: () => Promise<void>;
  pendingCount: () => number;
  createRequest: (data: Omit<ClientChangeRequest, 'id' | 'createdAt' | 'status'>) => Promise<ClientChangeRequest>;
  approveRequest: (id: string, reviewer: User) => Promise<void>;
  rejectRequest: (id: string, reviewer: User) => Promise<void>;
}

export const useChangeRequestStore = create<ChangeRequestState>()((set, get) => ({
  requests: [],
  loading: true,

  loadRequests: async () => {
    const requests = await changeRequestService.list();
    set({ requests, loading: false });
  },

  pendingCount: () =>
    get().requests.filter((r) => r.status === 'pending').length,

  createRequest: async (data) => {
    const request = await changeRequestService.create(data);
    const requests = await changeRequestService.list();
    set({ requests });
    return request;
  },

  approveRequest: async (id, reviewer) => {
    const req = get().requests.find((r) => r.id === id);
    if (!req || req.status !== 'pending') return;

    if (req.type === 'delete') {
      await clientService.delete(req.clientId);
    } else if (req.type === 'critical_update') {
      await clientService.update(req.clientId, req.payload);
    }

    if (req.type !== 'delete') {
      await clientService.addAuditEntry(req.clientId, {
        id: crypto.randomUUID(),
        action: `Change request approved: ${req.description}`,
        performedBy: reviewer.fullName,
        performedByUserId: reviewer.id,
        role: reviewer.role,
        timestamp: new Date().toISOString(),
      });
    }

    await changeRequestService.update(id, {
      status: 'approved',
      reviewedByUserId: reviewer.id,
      reviewedByName: reviewer.fullName,
      reviewedAt: new Date().toISOString(),
    });

    const requests = await changeRequestService.list();
    set({ requests });
  },

  rejectRequest: async (id, reviewer) => {
    const req = get().requests.find((r) => r.id === id);
    if (!req || req.status !== 'pending') return;

    await clientService.addAuditEntry(req.clientId, {
      id: crypto.randomUUID(),
      action: `Change request rejected: ${req.description}`,
      performedBy: reviewer.fullName,
      performedByUserId: reviewer.id,
      role: reviewer.role,
      timestamp: new Date().toISOString(),
    });

    await changeRequestService.update(id, {
      status: 'rejected',
      reviewedByUserId: reviewer.id,
      reviewedByName: reviewer.fullName,
      reviewedAt: new Date().toISOString(),
    });

    const requests = await changeRequestService.list();
    set({ requests });
  },
}));
