/**
 * bookingStore — Zustand in-memory cache for bookings.
 * Source of truth: Supabase (via bookingService).
 * Realtime sync handled by realtimeSync.ts.
 */
import { create } from 'zustand';
import type { Booking } from '../types';
import { bookingService } from '../services/bookingService';

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
