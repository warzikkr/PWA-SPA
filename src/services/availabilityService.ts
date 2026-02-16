import { supabase } from '../lib/supabaseClient';
import { useConfigStore } from '../stores/configStore';
import type { TherapistConfigOption } from '../types/config';

export interface TimeSlot {
  time: string;        // "10:00"
  availableCount: number; // how many therapists free
}

interface BookingRow {
  start_time: string | null;
  end_time: string | null;
  therapist_id: string | null;
  status: string;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

function generateSlots(start: string, end: string, duration: number, buffer: number): string[] {
  const startMin = timeToMinutes(start);
  const endMin = timeToMinutes(end);
  const slots: string[] = [];
  for (let t = startMin; t + duration <= endMin; t += duration + buffer) {
    slots.push(minutesToTime(t));
  }
  return slots;
}

function isSlotOccupied(
  slotTime: string,
  duration: number,
  bookings: BookingRow[],
  therapistId: string,
): boolean {
  const slotStart = timeToMinutes(slotTime);
  const slotEnd = slotStart + duration;

  return bookings.some((b) => {
    if (b.therapist_id !== therapistId || !b.start_time) return false;
    const bStart = timeToMinutes(b.start_time);
    const bEnd = b.end_time ? timeToMinutes(b.end_time) : bStart + duration;
    return slotStart < bEnd && slotEnd > bStart;
  });
}

export const availabilityService = {
  async getAvailableSlots(date: string): Promise<TimeSlot[]> {
    const config = useConfigStore.getState().config;
    const dayOfWeek = new Date(date + 'T12:00:00').getDay();
    const duration = config.slotDurationMinutes;
    const buffer = config.bookingBufferMinutes;

    const therapists = (config.therapists as TherapistConfigOption[]).filter((t) => t.enabled);

    // Collect all possible slots per therapist working that day
    const therapistSlots = new Map<string, string[]>();
    for (const th of therapists) {
      const daySchedule = th.schedule?.find((s) => s.dayOfWeek === dayOfWeek);
      if (!daySchedule) continue;
      therapistSlots.set(th.id, generateSlots(daySchedule.startTime, daySchedule.endTime, duration, buffer));
    }

    if (therapistSlots.size === 0) return [];

    // Fetch existing bookings for this date (not cancelled/done)
    const { data, error } = await supabase
      .from('bookings')
      .select('start_time, end_time, therapist_id, status')
      .eq('date', date)
      .not('status', 'in', '("cancelled","done")');

    if (error) throw new Error(`availabilityService.getAvailableSlots: ${error.message}`);
    const bookings = (data ?? []) as BookingRow[];

    // For each unique time slot, count how many therapists are available
    const slotMap = new Map<string, number>();
    for (const [therapistId, slots] of therapistSlots) {
      for (const slot of slots) {
        if (!isSlotOccupied(slot, duration, bookings, therapistId)) {
          slotMap.set(slot, (slotMap.get(slot) ?? 0) + 1);
        }
      }
    }

    // Also count unassigned bookings (therapist_id is null) as occupying a generic slot
    const unassignedBookings = bookings.filter((b) => !b.therapist_id && b.start_time);
    for (const b of unassignedBookings) {
      const bSlot = b.start_time!;
      const current = slotMap.get(bSlot);
      if (current !== undefined && current > 0) {
        slotMap.set(bSlot, current - 1);
      }
    }

    return Array.from(slotMap.entries())
      .filter(([, count]) => count > 0)
      .map(([time, availableCount]) => ({ time, availableCount }))
      .sort((a, b) => a.time.localeCompare(b.time));
  },

  async getAvailableDates(startDate: string, days: number): Promise<string[]> {
    const config = useConfigStore.getState().config;
    const therapists = (config.therapists as TherapistConfigOption[]).filter((t) => t.enabled);

    // Quick check: which dates have at least one therapist scheduled
    const available: string[] = [];
    const start = new Date(startDate + 'T12:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      if (d < today) continue;

      const dow = d.getDay();
      const hasTherapist = therapists.some(
        (t) => t.schedule?.some((s) => s.dayOfWeek === dow),
      );
      if (hasTherapist) {
        const iso = d.toISOString().split('T')[0];
        available.push(iso);
      }
    }

    return available;
  },
};
