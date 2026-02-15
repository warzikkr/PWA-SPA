/**
 * intakeStore — Zustand store for intakes.
 *
 * SOURCE OF TRUTH: intakeService (localStorage via spa_intakes).
 * No Zustand persist — eliminates dual-persistence / stale-hydration bugs.
 */
import { create } from 'zustand';
import type { Intake } from '../types';
import { intakeService } from '../services/intakeService';

interface IntakeState {
  intakes: Intake[];
  loading: boolean;
  loadIntakes: () => Promise<void>;
  addIntake: (data: Omit<Intake, 'id' | 'completedAt'>) => Promise<Intake>;
  getByBookingId: (bookingId: string) => Promise<Intake | undefined>;
}

export const useIntakeStore = create<IntakeState>()((set) => ({
  intakes: [],
  loading: true,

  loadIntakes: async () => {
    const intakes = await intakeService.list();
    set({ intakes, loading: false });
  },

  addIntake: async (data) => {
    const intake = await intakeService.create(data);
    const intakes = await intakeService.list();
    set({ intakes });
    return intake;
  },

  getByBookingId: async (bookingId) => {
    return intakeService.getByBookingId(bookingId);
  },
}));
