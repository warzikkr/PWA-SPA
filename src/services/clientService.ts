import { supabase } from '../lib/supabaseClient';
import type { Client, ClientAuditLog } from '../types';

/* ── snake_case DB row ↔ camelCase TS mapping ── */

interface ClientRow {
  id: string;
  full_name: string;
  email: string;
  contact_method: string;
  contact_value: string;
  marketing_source: string;
  consent_promotions: boolean;
  consent_privacy: boolean;
  gender: string | null;
  tags: string[];
  notes: string | null;
  preferences: Client['preferences'] | null;
  visit_history: string[] | null;
  audit_log: ClientAuditLog[] | null;
  created_at: string;
  updated_at: string;
}

function rowToClient(r: ClientRow): Client {
  return {
    id: r.id,
    fullName: r.full_name,
    email: r.email,
    contactMethod: r.contact_method,
    contactValue: r.contact_value,
    marketingSource: r.marketing_source,
    consentPromotions: r.consent_promotions,
    consentPrivacy: r.consent_privacy,
    gender: r.gender ?? undefined,
    tags: r.tags ?? [],
    notes: r.notes ?? undefined,
    preferences: r.preferences ?? undefined,
    visitHistory: r.visit_history ?? undefined,
    auditLog: r.audit_log ?? undefined,
    createdAt: r.created_at,
  };
}

function clientToRow(c: Partial<Client>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (c.fullName !== undefined) row.full_name = c.fullName;
  if (c.email !== undefined) row.email = c.email;
  if (c.contactMethod !== undefined) row.contact_method = c.contactMethod;
  if (c.contactValue !== undefined) row.contact_value = c.contactValue;
  if (c.marketingSource !== undefined) row.marketing_source = c.marketingSource;
  if (c.consentPromotions !== undefined) row.consent_promotions = c.consentPromotions;
  if (c.consentPrivacy !== undefined) row.consent_privacy = c.consentPrivacy;
  if (c.gender !== undefined) row.gender = c.gender;
  if (c.tags !== undefined) row.tags = c.tags;
  if (c.notes !== undefined) row.notes = c.notes;
  if (c.preferences !== undefined) row.preferences = c.preferences;
  if (c.visitHistory !== undefined) row.visit_history = c.visitHistory;
  if (c.auditLog !== undefined) row.audit_log = c.auditLog;
  row.updated_at = new Date().toISOString();
  return row;
}

export const clientService = {
  async list(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(`clientService.list: ${error.message}`);
    return (data as ClientRow[]).map(rowToClient);
  },

  async getById(id: string): Promise<Client | undefined> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(`clientService.getById: ${error.message}`);
    return data ? rowToClient(data as ClientRow) : undefined;
  },

  async findByContact(query: string): Promise<Client[]> {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .or(`email.ilike.%${q}%,contact_value.ilike.%${q}%,full_name.ilike.%${q}%`);
    if (error) throw new Error(`clientService.findByContact: ${error.message}`);
    return (data as ClientRow[]).map(rowToClient);
  },

  async searchByName(query: string): Promise<Client[]> {
    const q = query.trim();
    if (q.length < 2) return [];
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .ilike('full_name', `%${q}%`)
      .limit(8);
    if (error) throw new Error(`clientService.searchByName: ${error.message}`);
    return (data as ClientRow[]).map(rowToClient);
  },

  async create(input: Omit<Client, 'id' | 'createdAt'>): Promise<Client> {
    const row = clientToRow(input);
    delete row.updated_at; // let DB default handle it
    const { data, error } = await supabase
      .from('clients')
      .insert(row)
      .select()
      .single();
    if (error) throw new Error(`clientService.create: ${error.message}`);
    return rowToClient(data as ClientRow);
  },

  async update(id: string, patch: Partial<Client>): Promise<Client | undefined> {
    const row = clientToRow(patch);
    const { data, error } = await supabase
      .from('clients')
      .update(row)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(`clientService.update: ${error.message}`);
    return data ? rowToClient(data as ClientRow) : undefined;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) throw new Error(`clientService.delete: ${error.message}`);
  },

  async addAuditEntry(clientId: string, entry: ClientAuditLog): Promise<void> {
    // Fetch current audit_log, append, update
    const { data, error: fetchErr } = await supabase
      .from('clients')
      .select('audit_log')
      .eq('id', clientId)
      .single();
    if (fetchErr) throw new Error(`clientService.addAuditEntry fetch: ${fetchErr.message}`);
    const log: ClientAuditLog[] = (data?.audit_log as ClientAuditLog[]) ?? [];
    log.push(entry);
    const { error } = await supabase
      .from('clients')
      .update({ audit_log: log, updated_at: new Date().toISOString() })
      .eq('id', clientId);
    if (error) throw new Error(`clientService.addAuditEntry update: ${error.message}`);
  },

  async exportCSV(): Promise<string> {
    const clients = await clientService.list();
    const headers = ['Name', 'Email', 'Contact Method', 'Contact', 'Source', 'Tags', 'Created'];
    const rows = clients.map((c) => [
      c.fullName, c.email, c.contactMethod, c.contactValue,
      c.marketingSource, c.tags.join(';'), c.createdAt,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },
};
