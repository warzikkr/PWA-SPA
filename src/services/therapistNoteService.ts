import type { TherapistNote } from '../types';
import { mockTherapistNotes } from '../data/mockData';
import { getItem, setItem, uid } from './storage';

const KEY = 'therapist_notes';

function getAll(): TherapistNote[] {
  return getItem<TherapistNote[]>(KEY, mockTherapistNotes);
}

/** TODO: replace with real API calls */
export const therapistNoteService = {
  async list(): Promise<TherapistNote[]> {
    return getAll();
  },

  async getByBookingId(bookingId: string): Promise<TherapistNote[]> {
    return getAll().filter((n) => n.bookingId === bookingId);
  },

  async getByBookingIds(ids: string[]): Promise<Record<string, TherapistNote[]>> {
    const all = getAll();
    const map: Record<string, TherapistNote[]> = {};
    for (const id of ids) {
      map[id] = all.filter((n) => n.bookingId === id);
    }
    return map;
  },

  async create(data: Omit<TherapistNote, 'id' | 'createdAt'>): Promise<TherapistNote> {
    const all = getAll();
    const note: TherapistNote = { ...data, id: uid(), createdAt: new Date().toISOString() };
    all.push(note);
    setItem(KEY, all);
    return note;
  },

  async deleteNote(id: string): Promise<void> {
    const all = getAll().filter((n) => n.id !== id);
    setItem(KEY, all);
  },
};
