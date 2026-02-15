import type { Intake, BodyZoneSelection } from '../../types';

export interface TherapistBrief {
  duration: string;
  pressure: string;
  deepTissue: boolean;
  goal: string[];
  focusZones: BodyZoneSelection[];
  /** @deprecated secondary zones removed; kept for legacy data compat */
  secondaryZones: BodyZoneSelection[];
  avoidZones: BodyZoneSelection[];
  sensitiveAreas: string[];
  allergies: string[];
  oilPreference: string;
  smellSensitivity: boolean;
  pregnancy: string;
  fever: boolean;
  bloodPressure: boolean;
  varicoseVeins: boolean;
  injuries: string;
  skinIssues: string;
  painScale: number;
  painLocation: string;
  atmosphere: {
    music: string;
    volume: string;
    light: string;
    temp: string;
  };
  additionalNotes: string;
}

/** Extract a complete therapist brief from intake data */
export function getTherapistBrief(intake: Intake): TherapistBrief {
  const d = intake.data as Record<string, unknown>;

  const asStringArr = (v: unknown): string[] =>
    Array.isArray(v) ? (v as string[]) : [];

  const asZoneArr = (v: unknown): BodyZoneSelection[] => {
    if (!Array.isArray(v)) return [];
    // Support both new BodyZoneSelection[] and legacy string[] formats
    if (v.length === 0) return [];
    if (typeof v[0] === 'string') {
      // Legacy: convert plain zone IDs to front/left selections
      return (v as string[]).map((region) => ({
        side: 'front' as const,
        half: 'left' as const,
        region: region as BodyZoneSelection['region'],
      }));
    }
    return v as BodyZoneSelection[];
  };

  return {
    duration: String(d.duration ?? ''),
    pressure: String(d.pressure ?? ''),
    deepTissue: Boolean(d.deep_tissue),
    goal: asStringArr(d.goal),
    focusZones: asZoneArr(d.focus_zones),
    secondaryZones: asZoneArr(d.secondary_zones),
    avoidZones: asZoneArr(d.avoid_zones),
    sensitiveAreas: asStringArr(d.sensitive_areas),
    allergies: asStringArr(d.allergies),
    oilPreference: String(d.oil_preference ?? ''),
    smellSensitivity: Boolean(d.smell_sensitivity),
    pregnancy: String(d.pregnancy ?? 'no'),
    fever: Boolean(d.fever),
    bloodPressure: Boolean(d.high_blood_pressure),
    varicoseVeins: Boolean(d.varicose_veins),
    injuries: String(d.injuries ?? ''),
    skinIssues: String(d.skin_issues ?? ''),
    painScale: typeof d.pain_scale === 'number' ? d.pain_scale : 0,
    painLocation: String(d.pain_location ?? ''),
    atmosphere: {
      music: String(d.music_preset ?? ''),
      volume: String(d.volume ?? ''),
      light: String(d.light_preference ?? ''),
      temp: String(d.temperature ?? ''),
    },
    additionalNotes: String(d.additional_notes ?? ''),
  };
}

/** Check if any medical risk flags are present */
export function hasMedicalRisks(brief: TherapistBrief): boolean {
  return (
    brief.pregnancy !== 'no' && brief.pregnancy !== '' ||
    brief.fever ||
    brief.bloodPressure ||
    brief.varicoseVeins ||
    brief.allergies.length > 0 ||
    brief.injuries !== '' ||
    brief.skinIssues !== '' ||
    (brief.painScale > 0)
  );
}
