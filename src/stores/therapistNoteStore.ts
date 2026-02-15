/**
 * therapistNoteStore — Zustand store for therapist notes.
 *
 * SOURCE OF TRUTH: therapistNoteService (localStorage via spa_therapist_notes).
 * No Zustand persist — eliminates dual-persistence / stale-hydration bugs.
 *
 * Cross-tab sync: subscribeNoteSync() reloads when another tab writes.
 */
import { create } from 'zustand';
import type { TherapistNote } from '../types';
import { therapistNoteService } from '../services/therapistNoteService';

interface TherapistNoteState {
  notes: TherapistNote[];
  loading: boolean;
  loadNotes: () => Promise<void>;
  getByBookingId: (bookingId: string) => TherapistNote[];
  getByBookingIds: (ids: string[]) => Record<string, TherapistNote[]>;
  addNote: (data: Omit<TherapistNote, 'id' | 'createdAt'>) => Promise<TherapistNote>;
  deleteNote: (id: string) => Promise<void>;
}

export const useTherapistNoteStore = create<TherapistNoteState>()((set, get) => ({
  notes: [],
  loading: true,

  loadNotes: async () => {
    const notes = await therapistNoteService.list();
    set({ notes, loading: false });
  },

  getByBookingId: (bookingId) =>
    get().notes.filter((n) => n.bookingId === bookingId),

  getByBookingIds: (ids) => {
    const all = get().notes;
    const map: Record<string, TherapistNote[]> = {};
    for (const id of ids) {
      map[id] = all.filter((n) => n.bookingId === id);
    }
    return map;
  },

  addNote: async (data) => {
    const note = await therapistNoteService.create(data);
    const notes = await therapistNoteService.list();
    set({ notes });
    return note;
  },

  deleteNote: async (id) => {
    await therapistNoteService.deleteNote(id);
    const notes = await therapistNoteService.list();
    set({ notes });
  },
}));

const NOTE_STORAGE_KEY = 'spa_therapist_notes';

/** Cross-tab sync for therapist notes. Returns cleanup function. */
export function subscribeNoteSync(): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key === NOTE_STORAGE_KEY) {
      useTherapistNoteStore.getState().loadNotes();
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
