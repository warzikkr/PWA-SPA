import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

export const useTherapistNoteStore = create<TherapistNoteState>()(
  persist(
    (set, get) => ({
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
    }),
    {
      name: 'spa_therapist_note_store',
      partialize: (state) => ({ notes: state.notes }),
    },
  ),
);
