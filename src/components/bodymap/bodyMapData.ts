/**
 * bodyMapData.ts — Single source of truth for body-map region data,
 * hitbox positions, and shared helpers. Used by UnifiedBodyMap.
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

/* ── Hitbox positions (percentage of 100×200 viewBox) ── */

export type ZonePos = { x: number; y: number; w: number; h: number };

export const FRONT_POSITIONS: Record<string, ZonePos> = {
  /* Head */
  scalp:            { x: 38, y: 1,  w: 24, h: 6 },
  face:             { x: 39, y: 7,  w: 22, h: 9 },
  jaw_left:         { x: 36, y: 15, w: 14, h: 5 },
  jaw_right:        { x: 50, y: 15, w: 14, h: 5 },
  /* Neck */
  neck:             { x: 42, y: 20, w: 16, h: 6 },
  /* Shoulders */
  shoulder_left:    { x: 19, y: 26, w: 14, h: 7 },
  shoulder_right:   { x: 67, y: 26, w: 14, h: 7 },
  /* Chest (bilateral) */
  chest_left:       { x: 33, y: 26, w: 17, h: 11 },
  chest_right:      { x: 50, y: 26, w: 17, h: 11 },
  /* Upper arms */
  upper_arm_left:   { x: 12, y: 33, w: 11, h: 10 },
  upper_arm_right:  { x: 77, y: 33, w: 11, h: 10 },
  /* Abdomen */
  abdomen:          { x: 35, y: 37, w: 30, h: 10 },
  /* Elbows */
  elbow_left:       { x: 8,  y: 43, w: 10, h: 5 },
  elbow_right:      { x: 82, y: 43, w: 10, h: 5 },
  /* Hip */
  hip_left:         { x: 30, y: 47, w: 18, h: 7 },
  hip_right:        { x: 52, y: 47, w: 18, h: 7 },
  /* Forearms */
  forearm_left:     { x: 5,  y: 48, w: 11, h: 10 },
  forearm_right:    { x: 84, y: 48, w: 11, h: 10 },
  /* Thighs */
  thigh_left:       { x: 29, y: 54, w: 18, h: 14 },
  thigh_right:      { x: 53, y: 54, w: 18, h: 14 },
  /* Hands */
  hand_left:        { x: 2,  y: 58, w: 10, h: 7 },
  hand_right:       { x: 88, y: 58, w: 10, h: 7 },
  /* Knees */
  knee_left:        { x: 30, y: 68, w: 14, h: 5 },
  knee_right:       { x: 56, y: 68, w: 14, h: 5 },
  /* Calves */
  calf_left:        { x: 29, y: 73, w: 14, h: 12 },
  calf_right:       { x: 57, y: 73, w: 14, h: 12 },
  /* Ankles */
  ankle_left:       { x: 29, y: 85, w: 12, h: 4 },
  ankle_right:      { x: 59, y: 85, w: 12, h: 4 },
  /* Feet */
  foot_left:        { x: 27, y: 89, w: 14, h: 7 },
  foot_right:       { x: 59, y: 89, w: 14, h: 7 },
};

export const BACK_POSITIONS: Record<string, ZonePos> = {
  /* Head */
  scalp:            { x: 38, y: 1,  w: 24, h: 12 },
  /* Neck */
  neck:             { x: 42, y: 14, w: 16, h: 8 },
  /* Shoulders */
  shoulder_left:    { x: 19, y: 26, w: 14, h: 7 },
  shoulder_right:   { x: 67, y: 26, w: 14, h: 7 },
  /* Upper back */
  upper_back:       { x: 33, y: 26, w: 34, h: 10 },
  /* Upper arms */
  upper_arm_left:   { x: 12, y: 33, w: 11, h: 10 },
  upper_arm_right:  { x: 77, y: 33, w: 11, h: 10 },
  /* Mid back */
  mid_back:         { x: 34, y: 36, w: 32, h: 8 },
  /* Elbows */
  elbow_left:       { x: 8,  y: 43, w: 10, h: 5 },
  elbow_right:      { x: 82, y: 43, w: 10, h: 5 },
  /* Lower back */
  lower_back:       { x: 35, y: 44, w: 30, h: 6 },
  /* Forearms */
  forearm_left:     { x: 5,  y: 48, w: 11, h: 10 },
  forearm_right:    { x: 84, y: 48, w: 11, h: 10 },
  /* Glutes */
  glute_left:       { x: 31, y: 50, w: 17, h: 8 },
  glute_right:      { x: 52, y: 50, w: 17, h: 8 },
  /* Thighs */
  thigh_left:       { x: 28, y: 58, w: 18, h: 11 },
  thigh_right:      { x: 54, y: 58, w: 18, h: 11 },
  /* Hands */
  hand_left:        { x: 2,  y: 58, w: 10, h: 7 },
  hand_right:       { x: 88, y: 58, w: 10, h: 7 },
  /* Knees */
  knee_left:        { x: 30, y: 69, w: 14, h: 5 },
  knee_right:       { x: 56, y: 69, w: 14, h: 5 },
  /* Calves */
  calf_left:        { x: 29, y: 74, w: 14, h: 12 },
  calf_right:       { x: 57, y: 74, w: 14, h: 12 },
  /* Ankles */
  ankle_left:       { x: 29, y: 86, w: 12, h: 4 },
  ankle_right:      { x: 59, y: 86, w: 12, h: 4 },
  /* Feet */
  foot_left:        { x: 28, y: 90, w: 14, h: 7 },
  foot_right:       { x: 58, y: 90, w: 14, h: 7 },
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

/** Focus zone styling — blue, opacity ~0.7 */
export const FOCUS_STYLE = 'bg-blue-500/70 border-blue-500 text-blue-700';
/** Avoid zone styling — red, opacity ~0.7 */
export const AVOID_STYLE = 'bg-red-500/70 border-red-500 text-red-700';
/** Faded focus (shown in edit mode when editing avoid) */
export const FOCUS_FADED = 'bg-blue-500/25 border-blue-400/50 text-blue-500';
/** Faded avoid (shown in edit mode when editing focus) */
export const AVOID_FADED = 'bg-red-500/25 border-red-400/50 text-red-500';
/** Chip styling for selected focus zones */
export const FOCUS_CHIP = 'bg-blue-500 text-white';
/** Chip styling for selected avoid zones */
export const AVOID_CHIP = 'bg-red-500 text-white';
