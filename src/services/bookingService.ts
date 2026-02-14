import type { Booking } from '../types';
import { mockBookings } from '../data/mockData';
import { getItem, setItem, uid } from './storage';

const KEY = 'bookings';

function getAll(): Booking[] {
  return getItem<Booking[]>(KEY, mockBookings);
}

/** TODO: replace with real API calls */
export const bookingService = {
  async list(): Promise<Booking[]> {
    return getAll();
  },

  async getById(id: string): Promise<Booking | undefined> {
    return getAll().find((b) => b.id === id);
  },

  async getToday(): Promise<Booking[]> {
    const today = new Date().toISOString().split('T')[0];
    return getAll().filter((b) => b.date === today);
  },

  async findByClientContact(query: string): Promise<Booking[]> {
    // In a real app this would join with clients on backend
    // For now we search by clientId directly or return all pending
    return getAll().filter((b) => b.clientId.includes(query) || b.status === 'pending');
  },

  async findByClientId(clientId: string): Promise<Booking[]> {
    return getAll().filter((b) => b.clientId === clientId);
  },

  async create(data: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> {
    const all = getAll();
    const booking: Booking = { ...data, id: uid(), createdAt: new Date().toISOString() };
    all.push(booking);
    setItem(KEY, all);
    return booking;
  },

  async update(id: string, data: Partial<Booking>): Promise<Booking | undefined> {
    const all = getAll();
    const idx = all.findIndex((b) => b.id === id);
    if (idx === -1) return undefined;
    all[idx] = { ...all[idx], ...data };
    setItem(KEY, all);
    return all[idx];
  },

  async getByTherapistToday(therapistId: string): Promise<Booking[]> {
    const today = new Date().toISOString().split('T')[0];
    return getAll().filter((b) => b.therapistId === therapistId && b.date === today);
  },
};
