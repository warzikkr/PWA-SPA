import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '../i18n';

/**
 * Kiosk-scoped language store.
 *
 * ARCHITECTURE NOTE — language separation:
 *   - Kiosk: uses the language stored here (user-selectable)
 *   - Admin / Therapist: always English — enforced in their layouts
 *
 * The persist key is "kiosk_language" (NOT "spa_language") so it never
 * contaminates admin/therapist on page refresh. The old "spa_language"
 * key is no longer read.
 *
 * This store does NOT auto-apply its language on rehydration.
 * Instead, KioskLayout reads it and calls i18n.changeLanguage() on mount.
 */

interface KioskLanguageState {
  /** Currently selected kiosk language (e.g. "ja", "zh", "en") */
  kioskLanguage: string;
  /** Update kiosk language preference and apply to i18n immediately */
  setKioskLanguage: (lang: string) => void;
  /** Apply the stored kiosk language to i18n (called by KioskLayout on mount) */
  applyKioskLanguage: () => void;
}

export const useLanguageStore = create<KioskLanguageState>()(
  persist(
    (set, get) => ({
      kioskLanguage: 'en',

      setKioskLanguage: (lang) => {
        i18n.changeLanguage(lang);
        set({ kioskLanguage: lang });
      },

      applyKioskLanguage: () => {
        const { kioskLanguage } = get();
        i18n.changeLanguage(kioskLanguage);
      },
    }),
    {
      name: 'kiosk_language',
      // No onRehydrateStorage — language is applied only when entering kiosk routes
    },
  ),
);

/**
 * Force i18n to English. Called by Admin/Therapist layouts on mount.
 * Exported as a plain function so layouts don't need the store.
 */
export function forceEnglish() {
  i18n.changeLanguage('en');
}
