import { supabase } from '../lib/supabaseClient';
import type { Booking } from '../types';

/* ── snake_case DB row ↔ camelCase TS mapping ── */

interface BookingRow {
  id: string;
  client_id: string;
  therapist_id: string | null;
  room_id: string | null;
  intake_id: string | null;
  status: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  payment_status: string | null;
  payment_type: string | null;
  internal_note: string | null;
  source: string;
  created_at: string;
}

function rowToBooking(r: BookingRow): Booking {
  return {
    id: r.id,
    clientId: r.client_id,
    therapistId: r.therapist_id ?? undefined,
    roomId: r.room_id ?? undefined,
    intakeId: r.intake_id ?? undefined,
    status: r.status,
    date: r.date,
    startTime: r.start_time ?? undefined,
    endTime: r.end_time ?? undefined,
    paymentStatus: (r.payment_status as Booking['paymentStatus']) ?? undefined,
    paymentType: r.payment_type ?? undefined,
    internalNote: r.internal_note ?? undefined,
    source: r.source as Booking['source'],
    createdAt: r.created_at,
  };
}

function bookingToRow(b: Partial<Booking>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (b.clientId !== undefined) row.client_id = b.clientId;
  if (b.therapistId !== undefined) row.therapist_id = b.therapistId;
  if (b.roomId !== undefined) row.room_id = b.roomId;
  if (b.intakeId !== undefined) row.intake_id = b.intakeId;
  if (b.status !== undefined) row.status = b.status;
  if (b.date !== undefined) row.date = b.date;
  if (b.startTime !== undefined) row.start_time = b.startTime;
  if (b.endTime !== undefined) row.end_time = b.endTime;
  if (b.paymentStatus !== undefined) row.payment_status = b.paymentStatus;
  if (b.paymentType !== undefined) row.payment_type = b.paymentType;
  if (b.internalNote !== undefined) row.internal_note = b.internalNote;
  if (b.source !== undefined) row.source = b.source;
  return row;
}

export const bookingService = {
  async list(): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(`bookingService.list: ${error.message}`);
    return (data as BookingRow[]).map(rowToBooking);
  },

  async getById(id: string): Promise<Booking | undefined> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(`bookingService.getById: ${error.message}`);
    return data ? rowToBooking(data as BookingRow) : undefined;
  },

  async getToday(): Promise<Booking[]> {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('date', today)
      .order('start_time');
    if (error) throw new Error(`bookingService.getToday: ${error.message}`);
    return (data as BookingRow[]).map(rowToBooking);
  },

  async findByClientContact(query: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .or(`client_id.eq.${query},status.eq.pending`);
    if (error) throw new Error(`bookingService.findByClientContact: ${error.message}`);
    return (data as BookingRow[]).map(rowToBooking);
  },

  async findByClientId(clientId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(`bookingService.findByClientId: ${error.message}`);
    return (data as BookingRow[]).map(rowToBooking);
  },

  async create(input: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> {
    const row = bookingToRow(input);
    const { data, error } = await supabase
      .from('bookings')
      .insert(row)
      .select()
      .single();
    if (error) throw new Error(`bookingService.create: ${error.message}`);
    return rowToBooking(data as BookingRow);
  },

  async update(id: string, patch: Partial<Booking>): Promise<Booking | undefined> {
    const row = bookingToRow(patch);
    const { data, error } = await supabase
      .from('bookings')
      .update(row)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(`bookingService.update: ${error.message}`);
    return data ? rowToBooking(data as BookingRow) : undefined;
  },

  async getByTherapistToday(therapistId: string): Promise<Booking[]> {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('therapist_id', therapistId)
      .eq('date', today)
      .order('start_time');
    if (error) throw new Error(`bookingService.getByTherapistToday: ${error.message}`);
    return (data as BookingRow[]).map(rowToBooking);
  },
};
