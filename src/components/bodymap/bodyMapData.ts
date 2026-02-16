/**
 * bodyMapData.ts — Single source of truth for body-map region data,
 * hitbox positions, and shared helpers. Used by UnifiedBodyMap.
 *
 * Coordinate system:
 *   x, w — percentage of viewBox width  (0–100)
 *   y, h — absolute viewBox units        (0–200)
 *         rendered as  top: y/2 %  height: h/2 %
 */
import type { BodySide, BodyHalf, BodyRegion, BodyZoneSelection } from '../../types';

/* ── Region lists ── */

export const REGIONS: BodyRegion[] = [
  'scalp', 'face', 'jaw', 'neck',
  'chest', 'abdomen',
  'upper_back', 'mid_back', 'lower_back',
  'shoulder', 'upper_arm', 'elbow', 'forearm', 'hand',
  'hip', 'glute',
  'thigh', 'knee', 'calf', 'ankle', 'foot',
];

/** Regions that have left/right variants */
export const BILATERAL: BodyRegion[] = [
  'jaw', 'chest',
  'shoulder', 'upper_arm', 'elbow', 'forearm', 'hand',
  'hip', 'glute',
  'thigh', 'knee', 'calf', 'ankle', 'foot',
];

/** Regions visible on front */
export const FRONT_REGIONS: BodyRegion[] = [
  'scalp', 'face', 'jaw', 'neck',
  'chest', 'abdomen',
  'shoulder', 'upper_arm', 'elbow', 'forearm', 'hand',
  'hip',
  'thigh', 'knee', 'calf', 'ankle', 'foot',
];

/** Regions visible on back */
export const BACK_REGIONS: BodyRegion[] = [
  'scalp', 'neck',
  'upper_back', 'mid_back', 'lower_back',
  'shoulder', 'upper_arm', 'elbow', 'forearm', 'hand',
  'glute',
  'thigh', 'knee', 'calf', 'ankle', 'foot',
];

/* ── Hitbox positions  (x,w in 0-100%;  y,h in viewBox 0-200 units) ── */

export type ZonePos = { x: number; y: number; w: number; h: number };

export const FRONT_POSITIONS: Record<string, ZonePos> = {
  /* Head  (ellipse cy=16 ry=11.5 → y 4.5–27.5) */
  scalp:            { x: 38, y: 4,   w: 24, h: 10 },
  face:             { x: 39, y: 12,  w: 22, h: 10 },
  jaw_left:         { x: 36, y: 20,  w: 14, h: 8 },
  jaw_right:        { x: 50, y: 20,  w: 14, h: 8 },

  /* Neck  (y 28–36) */
  neck:             { x: 40, y: 28,  w: 20, h: 8 },

  /* Shoulders  (y 36–46) */
  shoulder_left:    { x: 16, y: 36,  w: 18, h: 10 },
  shoulder_right:   { x: 66, y: 36,  w: 18, h: 10 },

  /* Chest  (y 36–52) */
  chest_left:       { x: 34, y: 36,  w: 16, h: 16 },
  chest_right:      { x: 50, y: 36,  w: 16, h: 16 },

  /* Upper arms  (y 46–64) */
  upper_arm_left:   { x: 6,  y: 46,  w: 16, h: 18 },
  upper_arm_right:  { x: 78, y: 46,  w: 16, h: 18 },

  /* Abdomen  (y 52–70) */
  abdomen:          { x: 32, y: 52,  w: 36, h: 18 },

  /* Elbows  (y 64–72) */
  elbow_left:       { x: 4,  y: 64,  w: 12, h: 8 },
  elbow_right:      { x: 84, y: 64,  w: 12, h: 8 },

  /* Hip  (y 70–86) */
  hip_left:         { x: 27, y: 70,  w: 22, h: 16 },
  hip_right:        { x: 51, y: 70,  w: 22, h: 16 },

  /* Forearms  (y 72–92) */
  forearm_left:     { x: 2,  y: 72,  w: 12, h: 20 },
  forearm_right:    { x: 86, y: 72,  w: 12, h: 20 },

  /* Hands  (y 92–106) */
  hand_left:        { x: 0,  y: 92,  w: 12, h: 14 },
  hand_right:       { x: 88, y: 92,  w: 12, h: 14 },

  /* Thighs  (y 93–124) */
  thigh_left:       { x: 27, y: 93,  w: 22, h: 30 },
  thigh_right:      { x: 51, y: 93,  w: 22, h: 30 },

  /* Knees  (y 124–138) */
  knee_left:        { x: 28, y: 124, w: 18, h: 14 },
  knee_right:       { x: 52, y: 124, w: 18, h: 14 },

  /* Calves  (y 138–166) */
  calf_left:        { x: 27, y: 138, w: 18, h: 28 },
  calf_right:       { x: 53, y: 138, w: 18, h: 28 },

  /* Ankles  (y 166–178) */
  ankle_left:       { x: 27, y: 166, w: 16, h: 12 },
  ankle_right:      { x: 55, y: 166, w: 16, h: 12 },

  /* Feet  (y 178–192) */
  foot_left:        { x: 24, y: 178, w: 20, h: 14 },
  foot_right:       { x: 54, y: 178, w: 20, h: 14 },
};

export const BACK_POSITIONS: Record<string, ZonePos> = {
  /* Head */
  scalp:            { x: 38, y: 4,   w: 24, h: 20 },

  /* Neck */
  neck:             { x: 40, y: 26,  w: 20, h: 10 },

  /* Shoulders */
  shoulder_left:    { x: 16, y: 36,  w: 18, h: 10 },
  shoulder_right:   { x: 66, y: 36,  w: 18, h: 10 },

  /* Upper back  (y 36–52) */
  upper_back:       { x: 34, y: 36,  w: 32, h: 16 },

  /* Upper arms */
  upper_arm_left:   { x: 6,  y: 46,  w: 16, h: 18 },
  upper_arm_right:  { x: 78, y: 46,  w: 16, h: 18 },

  /* Mid back  (y 52–66) */
  mid_back:         { x: 33, y: 52,  w: 34, h: 14 },

  /* Elbows */
  elbow_left:       { x: 4,  y: 64,  w: 12, h: 8 },
  elbow_right:      { x: 84, y: 64,  w: 12, h: 8 },

  /* Lower back  (y 66–80) */
  lower_back:       { x: 33, y: 66,  w: 34, h: 14 },

  /* Forearms */
  forearm_left:     { x: 2,  y: 72,  w: 12, h: 20 },
  forearm_right:    { x: 86, y: 72,  w: 12, h: 20 },

  /* Glutes  (y 80–93) */
  glute_left:       { x: 29, y: 80,  w: 20, h: 14 },
  glute_right:      { x: 51, y: 80,  w: 20, h: 14 },

  /* Hands */
  hand_left:        { x: 0,  y: 92,  w: 12, h: 14 },
  hand_right:       { x: 88, y: 92,  w: 12, h: 14 },

  /* Thighs  (starts lower than front — after glutes) */
  thigh_left:       { x: 27, y: 94,  w: 22, h: 30 },
  thigh_right:      { x: 51, y: 94,  w: 22, h: 30 },

  /* Knees */
  knee_left:        { x: 28, y: 124, w: 18, h: 14 },
  knee_right:       { x: 52, y: 124, w: 18, h: 14 },

  /* Calves */
  calf_left:        { x: 27, y: 138, w: 18, h: 28 },
  calf_right:       { x: 53, y: 138, w: 18, h: 28 },

  /* Ankles */
  ankle_left:       { x: 27, y: 166, w: 16, h: 12 },
  ankle_right:      { x: 55, y: 166, w: 16, h: 12 },

  /* Feet */
  foot_left:        { x: 24, y: 178, w: 20, h: 14 },
  foot_right:       { x: 54, y: 178, w: 20, h: 14 },
};

/* ── Legacy region name mapping ── */

const LEGACY_MAP: Record<string, BodyRegion> = {
  head: 'scalp',
  arm: 'upper_arm',
  lower_arm: 'forearm',
};

/** Normalise a region name, mapping legacy values to current ones */
export function normaliseRegion(region: string): BodyRegion {
  return (LEGACY_MAP[region] ?? region) as BodyRegion;
}

/* ── Helpers ── */

export function zoneKey(z: BodyZoneSelection): string {
  return `${z.side}:${z.half}:${z.region}`;
}

export function isSelected(
  zones: BodyZoneSelection[],
  side: BodySide,
  half: BodyHalf,
  region: BodyRegion,
): boolean {
  return zones.some((s) => s.side === side && s.half === half && s.region === region);
}

/** Get all zone entries (hitbox keys) for a given body side */
export function getZoneEntries(
  side: BodySide,
): Array<{ posKey: string; region: BodyRegion; half: BodyHalf }> {
  const regions = side === 'front' ? FRONT_REGIONS : BACK_REGIONS;
  const entries: Array<{ posKey: string; region: BodyRegion; half: BodyHalf }> = [];

  for (const region of regions) {
    if (BILATERAL.includes(region)) {
      entries.push({ posKey: `${region}_left`, region, half: 'left' });
      entries.push({ posKey: `${region}_right`, region, half: 'right' });
    } else {
      entries.push({ posKey: region, region, half: 'left' });
    }
  }
  return entries;
}

/* ── Unified color tokens ── */

export const FOCUS_STYLE = 'bg-blue-500/70 border-blue-500 text-blue-700';
export const AVOID_STYLE = 'bg-red-500/70 border-red-500 text-red-700';
export const FOCUS_FADED = 'bg-blue-500/25 border-blue-400/50 text-blue-500';
export const AVOID_FADED = 'bg-red-500/25 border-red-400/50 text-red-500';
export const FOCUS_CHIP = 'bg-blue-500 text-white';
export const AVOID_CHIP = 'bg-red-500 text-white';
