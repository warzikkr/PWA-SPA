import { supabase } from '../lib/supabaseClient';
import type { TherapistNote } from '../types';

/* ── snake_case DB row ↔ camelCase TS mapping ── */

interface NoteRow {
  id: string;
  booking_id: string;
  therapist_id: string;
  therapist_name: string | null;
  text: string;
  created_at: string;
}

function rowToNote(r: NoteRow): TherapistNote {
  return {
    id: r.id,
    bookingId: r.booking_id,
    therapistId: r.therapist_id,
    therapistName: r.therapist_name ?? undefined,
    text: r.text,
    createdAt: r.created_at,
  };
}

function noteToRow(n: Partial<TherapistNote>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (n.bookingId !== undefined) row.booking_id = n.bookingId;
  if (n.therapistId !== undefined) row.therapist_id = n.therapistId;
  if (n.therapistName !== undefined) row.therapist_name = n.therapistName;
  if (n.text !== undefined) row.text = n.text;
  return row;
}

export const therapistNoteService = {
  async list(): Promise<TherapistNote[]> {
    const { data, error } = await supabase
      .from('therapist_notes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(`therapistNoteService.list: ${error.message}`);
    return (data as NoteRow[]).map(rowToNote);
  },

  async getByBookingId(bookingId: string): Promise<TherapistNote[]> {
    const { data, error } = await supabase
      .from('therapist_notes')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at');
    if (error) throw new Error(`therapistNoteService.getByBookingId: ${error.message}`);
    return (data as NoteRow[]).map(rowToNote);
  },

  async getByBookingIds(ids: string[]): Promise<Record<string, TherapistNote[]>> {
    if (ids.length === 0) return {};
    const { data, error } = await supabase
      .from('therapist_notes')
      .select('*')
      .in('booking_id', ids)
      .order('created_at');
    if (error) throw new Error(`therapistNoteService.getByBookingIds: ${error.message}`);
    const all = (data as NoteRow[]).map(rowToNote);
    const map: Record<string, TherapistNote[]> = {};
    for (const id of ids) {
      map[id] = all.filter((n) => n.bookingId === id);
    }
    return map;
  },

  async create(input: Omit<TherapistNote, 'id' | 'createdAt'>): Promise<TherapistNote> {
    const row = noteToRow(input);
    const { data, error } = await supabase
      .from('therapist_notes')
      .insert(row)
      .select()
      .single();
    if (error) throw new Error(`therapistNoteService.create: ${error.message}`);
    return rowToNote(data as NoteRow);
  },

  async deleteNote(id: string): Promise<void> {
    const { error } = await supabase
      .from('therapist_notes')
      .delete()
      .eq('id', id);
    if (error) throw new Error(`therapistNoteService.deleteNote: ${error.message}`);
  },
};
