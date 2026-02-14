import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import id from './id.json';
import es from './es.json';
import ja from './ja.json';
import zh from './zh.json';
import ru from './ru.json';

/**
 * i18n always initializes with English.
 *
 * MIGRATION NOTE: previously read "spa_language" from localStorage to set
 * the initial language. That caused admin/therapist pages to render in the
 * kiosk-selected language on refresh.
 *
 * Now:
 *   - Default language is always "en" (safe for admin/therapist)
 *   - KioskLayout applies the kiosk language on mount via the language store
 *   - Admin/TherapistLayout explicitly enforce "en" on mount
 */
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    id: { translation: id },
    es: { translation: es },
    ja: { translation: ja },
    zh: { translation: zh },
    ru: { translation: ru },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
