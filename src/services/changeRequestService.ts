import { supabase } from '../lib/supabaseClient';
import type { ClientChangeRequest } from '../types';

/* ── snake_case DB row ↔ camelCase TS mapping ── */

interface CRRow {
  id: string;
  client_id: string;
  client_name: string;
  requested_by_user_id: string;
  requested_by_name: string;
  type: string;
  description: string;
  payload: Record<string, unknown>;
  status: string;
  reviewed_by_user_id: string | null;
  reviewed_by_name: string | null;
  reviewed_at: string | null;
  created_at: string;
}

function rowToCR(r: CRRow): ClientChangeRequest {
  return {
    id: r.id,
    clientId: r.client_id,
    clientName: r.client_name,
    requestedByUserId: r.requested_by_user_id,
    requestedByName: r.requested_by_name,
    type: r.type as ClientChangeRequest['type'],
    description: r.description,
    payload: r.payload,
    status: r.status as ClientChangeRequest['status'],
    reviewedByUserId: r.reviewed_by_user_id ?? undefined,
    reviewedByName: r.reviewed_by_name ?? undefined,
    reviewedAt: r.reviewed_at ?? undefined,
    createdAt: r.created_at,
  };
}

function crToRow(c: Partial<ClientChangeRequest>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (c.clientId !== undefined) row.client_id = c.clientId;
  if (c.clientName !== undefined) row.client_name = c.clientName;
  if (c.requestedByUserId !== undefined) row.requested_by_user_id = c.requestedByUserId;
  if (c.requestedByName !== undefined) row.requested_by_name = c.requestedByName;
  if (c.type !== undefined) row.type = c.type;
  if (c.description !== undefined) row.description = c.description;
  if (c.payload !== undefined) row.payload = c.payload;
  if (c.status !== undefined) row.status = c.status;
  if (c.reviewedByUserId !== undefined) row.reviewed_by_user_id = c.reviewedByUserId;
  if (c.reviewedByName !== undefined) row.reviewed_by_name = c.reviewedByName;
  if (c.reviewedAt !== undefined) row.reviewed_at = c.reviewedAt;
  return row;
}

export const changeRequestService = {
  async list(): Promise<ClientChangeRequest[]> {
    const { data, error } = await supabase
      .from('change_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(`changeRequestService.list: ${error.message}`);
    return (data as CRRow[]).map(rowToCR);
  },

  async getPending(): Promise<ClientChangeRequest[]> {
    const { data, error } = await supabase
      .from('change_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (error) throw new Error(`changeRequestService.getPending: ${error.message}`);
    return (data as CRRow[]).map(rowToCR);
  },

  async create(input: Omit<ClientChangeRequest, 'id' | 'createdAt' | 'status'>): Promise<ClientChangeRequest> {
    const row = crToRow({ ...input, status: 'pending' });
    const { data, error } = await supabase
      .from('change_requests')
      .insert(row)
      .select()
      .single();
    if (error) throw new Error(`changeRequestService.create: ${error.message}`);
    return rowToCR(data as CRRow);
  },

  async update(id: string, patch: Partial<ClientChangeRequest>): Promise<ClientChangeRequest | undefined> {
    const row = crToRow(patch);
    const { data, error } = await supabase
      .from('change_requests')
      .update(row)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(`changeRequestService.update: ${error.message}`);
    return data ? rowToCR(data as CRRow) : undefined;
  },
};
