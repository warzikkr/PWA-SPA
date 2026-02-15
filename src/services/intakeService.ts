import { supabase } from '../lib/supabaseClient';
import type { Intake } from '../types';

/* ── snake_case DB row ↔ camelCase TS mapping ── */

interface IntakeRow {
  id: string;
  client_id: string;
  booking_id: string | null;
  data: Record<string, unknown>;
  signature: string | null;
  completed_at: string;
}

function rowToIntake(r: IntakeRow): Intake {
  return {
    id: r.id,
    clientId: r.client_id,
    bookingId: r.booking_id ?? undefined,
    data: r.data,
    signature: r.signature ?? undefined,
    completedAt: r.completed_at,
  };
}

function intakeToRow(i: Partial<Intake>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (i.clientId !== undefined) row.client_id = i.clientId;
  if (i.bookingId !== undefined) row.booking_id = i.bookingId;
  if (i.data !== undefined) row.data = i.data;
  if (i.signature !== undefined) row.signature = i.signature;
  return row;
}

export const intakeService = {
  async list(): Promise<Intake[]> {
    const { data, error } = await supabase
      .from('intakes')
      .select('*')
      .order('completed_at', { ascending: false });
    if (error) throw new Error(`intakeService.list: ${error.message}`);
    return (data as IntakeRow[]).map(rowToIntake);
  },

  async getById(id: string): Promise<Intake | undefined> {
    const { data, error } = await supabase
      .from('intakes')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(`intakeService.getById: ${error.message}`);
    return data ? rowToIntake(data as IntakeRow) : undefined;
  },

  async getByBookingId(bookingId: string): Promise<Intake | undefined> {
    const { data, error } = await supabase
      .from('intakes')
      .select('*')
      .eq('booking_id', bookingId)
      .maybeSingle();
    if (error) throw new Error(`intakeService.getByBookingId: ${error.message}`);
    return data ? rowToIntake(data as IntakeRow) : undefined;
  },

  async getByClientId(clientId: string): Promise<Intake[]> {
    const { data, error } = await supabase
      .from('intakes')
      .select('*')
      .eq('client_id', clientId)
      .order('completed_at', { ascending: false });
    if (error) throw new Error(`intakeService.getByClientId: ${error.message}`);
    return (data as IntakeRow[]).map(rowToIntake);
  },

  async create(input: Omit<Intake, 'id' | 'completedAt'>): Promise<Intake> {
    const row = intakeToRow(input);
    const { data, error } = await supabase
      .from('intakes')
      .insert(row)
      .select()
      .single();
    if (error) throw new Error(`intakeService.create: ${error.message}`);
    return rowToIntake(data as IntakeRow);
  },
};
