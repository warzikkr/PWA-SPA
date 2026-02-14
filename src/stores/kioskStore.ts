import { create } from 'zustand';

export type KioskMode = 'welcome' | 'find_booking' | 'contacts' | 'intake' | 'thank_you';

interface KioskState {
  mode: KioskMode;
  intakeStep: number;
  bookingId?: string;
  clientId?: string;
  formData: Record<string, unknown>;
  language: string;
  isWalkin: boolean;

  setMode: (mode: KioskMode) => void;
  setIntakeStep: (step: number) => void;
  setBookingId: (id: string) => void;
  setClientId: (id: string) => void;
  updateFormData: (data: Record<string, unknown>) => void;
  setLanguage: (lang: string) => void;
  setIsWalkin: (v: boolean) => void;
  reset: () => void;
}

const initialState = {
  mode: 'welcome' as KioskMode,
  intakeStep: 0,
  bookingId: undefined,
  clientId: undefined,
  formData: {},
  language: 'en',
  isWalkin: false,
};

export const useKioskStore = create<KioskState>((set) => ({
  ...initialState,

  setMode: (mode) => set({ mode }),
  setIntakeStep: (intakeStep) => set({ intakeStep }),
  setBookingId: (bookingId) => set({ bookingId }),
  setClientId: (clientId) => set({ clientId }),
  updateFormData: (data) => set((s) => ({ formData: { ...s.formData, ...data } })),
  setLanguage: (language) => set({ language }),
  setIsWalkin: (isWalkin) => set({ isWalkin }),
  reset: () => set(initialState),
}));
