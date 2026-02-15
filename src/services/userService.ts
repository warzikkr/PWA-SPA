import { supabase } from '../lib/supabaseClient';
import type { User } from '../types';

/* ── snake_case DB row ↔ camelCase TS mapping ── */

interface UserRow {
  id: string;
  auth_uid: string | null;
  full_name: string;
  username: string;
  role: string;
  therapist_id: string | null;
  enabled: boolean;
  created_at: string;
}

function rowToUser(r: UserRow): User {
  return {
    id: r.id,
    fullName: r.full_name,
    username: r.username,
    role: r.role as User['role'],
    therapistId: r.therapist_id ?? undefined,
    enabled: r.enabled,
  };
}

function userToRow(u: Partial<User> & { authUid?: string }): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (u.fullName !== undefined) row.full_name = u.fullName;
  if (u.username !== undefined) row.username = u.username;
  if (u.role !== undefined) row.role = u.role;
  if (u.therapistId !== undefined) row.therapist_id = u.therapistId;
  if (u.enabled !== undefined) row.enabled = u.enabled;
  if (u.authUid !== undefined) row.auth_uid = u.authUid;
  return row;
}

export const userService = {
  async list(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at');
    if (error) throw new Error(`userService.list: ${error.message}`);
    return (data as UserRow[]).map(rowToUser);
  },

  async getByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .maybeSingle();
    if (error) throw new Error(`userService.getByUsername: ${error.message}`);
    return data ? rowToUser(data as UserRow) : undefined;
  },

  async getById(id: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(`userService.getById: ${error.message}`);
    return data ? rowToUser(data as UserRow) : undefined;
  },

  async getByAuthUid(authUid: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_uid', authUid)
      .maybeSingle();
    if (error) throw new Error(`userService.getByAuthUid: ${error.message}`);
    return data ? rowToUser(data as UserRow) : undefined;
  },

  async create(input: Omit<User, 'id'> & { authUid?: string }): Promise<User> {
    const row = userToRow(input);
    const { data, error } = await supabase
      .from('users')
      .insert(row)
      .select()
      .single();
    if (error) throw new Error(`userService.create: ${error.message}`);
    return rowToUser(data as UserRow);
  },

  async update(id: string, patch: Partial<User>): Promise<User | undefined> {
    const row = userToRow(patch);
    const { data, error } = await supabase
      .from('users')
      .update(row)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(`userService.update: ${error.message}`);
    return data ? rowToUser(data as UserRow) : undefined;
  },

  async toggleEnabled(id: string): Promise<void> {
    // Fetch current, flip
    const current = await userService.getById(id);
    if (!current) return;
    await userService.update(id, { enabled: !current.enabled });
  },
};
