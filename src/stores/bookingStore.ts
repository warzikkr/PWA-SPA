/**
 * bookingStore — Zustand store for bookings.
 *
 * SOURCE OF TRUTH: bookingService (localStorage via spa_bookings).
 * No Zustand persist — eliminates dual-persistence / stale-hydration bugs.
 *
 * All consumers call loadBookings() to get the full list and filter in render.
 * loadToday / getByTherapistToday removed — they caused partial overwrites
 * and broke cross-role synchronization.
 *
 * Cross-tab sync: subscribeBookingSync() listens for localStorage changes
 * from other tabs (kiosk, reception, etc.) and reloads automatically.
 */
import { create } from 'zustand';
import type { Booking } from '../types';
import { bookingService } from '../services/bookingService';

const STORAGE_KEY = 'spa_bookings';

interface BookingState {
  bookings: Booking[];
  loading: boolean;
  loadBookings: () => Promise<void>;
  addBooking: (data: Omit<Booking, 'id' | 'createdAt'>) => Promise<Booking>;
  updateBooking: (id: string, data: Partial<Booking>) => Promise<void>;
  findByClientId: (clientId: string) => Promise<Booking[]>;
}

export const useBookingStore = create<BookingState>()((set) => ({
  bookings: [],
  loading: true,

  loadBookings: async () => {
    const bookings = await bookingService.list();
    set({ bookings, loading: false });
  },

  addBooking: async (data) => {
    const booking = await bookingService.create(data);
    const bookings = await bookingService.list();
    set({ bookings });
    return booking;
  },

  updateBooking: async (id, data) => {
    await bookingService.update(id, data);
    const bookings = await bookingService.list();
    set({ bookings });
  },

  findByClientId: async (clientId) => {
    return bookingService.findByClientId(clientId);
  },
}));

/**
 * Cross-tab sync: when another tab writes to spa_bookings in localStorage,
 * reload the in-memory store so all roles see updates immediately.
 * Returns cleanup function.
 */
export function subscribeBookingSync(): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      useBookingStore.getState().loadBookings();
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
