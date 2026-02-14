import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Booking } from '../types';
import { bookingService } from '../services/bookingService';

interface BookingState {
  bookings: Booking[];
  loading: boolean;
  loadBookings: () => Promise<void>;
  loadToday: () => Promise<void>;
  addBooking: (data: Omit<Booking, 'id' | 'createdAt'>) => Promise<Booking>;
  updateBooking: (id: string, data: Partial<Booking>) => Promise<void>;
  findByClientId: (clientId: string) => Promise<Booking[]>;
  getByTherapistToday: (therapistId: string) => Promise<Booking[]>;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      bookings: [],
      loading: true,

      loadBookings: async () => {
        const bookings = await bookingService.list();
        set({ bookings, loading: false });
      },

      loadToday: async () => {
        const bookings = await bookingService.getToday();
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

      getByTherapistToday: async (therapistId) => {
        return bookingService.getByTherapistToday(therapistId);
      },
    }),
    {
      name: 'spa_booking_store',
      partialize: (state) => ({ bookings: state.bookings }),
    },
  ),
);
