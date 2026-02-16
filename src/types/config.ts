/* ── Localization ── */
export type SupportedLang = 'en' | 'id' | 'es' | 'ja' | 'zh' | 'ru';

export type LocalizedString = Record<SupportedLang, string>;

/* ── Field types ── */
export type FieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'toggle'
  | 'slider'
  | 'bodymap'
  | 'signature'
  | 'segmented';

export interface FieldOption {
  id: string;
  label: string;
  localized?: LocalizedString;
  enabled: boolean;
}

export interface FieldDefinition {
  id: string;
  type: FieldType;
  label: string;
  localizedLabel?: LocalizedString;
  placeholder?: string;
  localizedPlaceholder?: LocalizedString;
  required: boolean;
  enabled: boolean;
  options?: FieldOption[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  order: number;
}

export interface StepDefinition {
  id: string;
  title: string;
  localizedTitle?: LocalizedString;
  description?: string;
  localizedDescription?: LocalizedString;
  fields: FieldDefinition[];
  enabled: boolean;
  order: number;
}

export interface ConfigOption {
  id: string;
  label: string;
  localized?: LocalizedString;
  enabled: boolean;
}

/* ── Therapist schedule ── */
export interface TherapistScheduleSlot {
  dayOfWeek: number; // 0=Sunday … 6=Saturday
  startTime: string; // "10:00"
  endTime: string;   // "18:00"
}

export interface TherapistConfigOption extends ConfigOption {
  schedule?: TherapistScheduleSlot[];
}

export interface AppConfig {
  intakeSchema: StepDefinition[];
  contactMethods: ConfigOption[];
  marketingSources: ConfigOption[];
  statuses: ConfigOption[];
  tags: ConfigOption[];
  rooms: ConfigOption[];
  therapists: TherapistConfigOption[];
  musicPresets: ConfigOption[];
  oilOptions: ConfigOption[];
  bodyZones: ConfigOption[];
  languages: ConfigOption[];
  inactivityTimeout: number;
  slotDurationMinutes: number;
  bookingBufferMinutes: number;
}

/* ── Localization helper ── */
export function getLocalized(
  localized: LocalizedString | undefined,
  fallback: string,
  lang: string,
): string {
  if (!localized) return fallback;
  return localized[lang as SupportedLang] || localized.en || fallback;
}
