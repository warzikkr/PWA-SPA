/**
 * bodyMapData.ts — Single source of truth for body-map region data,
 * hitbox positions, and shared helpers. Used by UnifiedBodyMap.
 */
import type { BodySide, BodyHalf, BodyRegion, BodyZoneSelection } from '../../types';

/* ── Region lists ── */

export const REGIONS: BodyRegion[] = [
  'head', 'neck', 'shoulder', 'arm', 'lower_arm', 'hand',
  'upper_back', 'lower_back', 'glute', 'thigh', 'knee', 'calf', 'foot',
];

/** Regions that have left/right variants */
export const BILATERAL: BodyRegion[] = [
  'shoulder', 'arm', 'lower_arm', 'hand', 'glute', 'thigh', 'knee', 'calf', 'foot',
];

/** Regions visible on front */
export const FRONT_REGIONS: BodyRegion[] = [
  'head', 'neck', 'shoulder', 'arm', 'lower_arm', 'hand',
  'upper_back', 'lower_back', 'thigh', 'knee', 'calf', 'foot',
];

/** Regions visible on back */
export const BACK_REGIONS: BodyRegion[] = [
  'head', 'neck', 'shoulder', 'arm', 'lower_arm', 'hand',
  'upper_back', 'lower_back', 'glute', 'thigh', 'knee', 'calf', 'foot',
];

/* ── Hitbox positions (percentage of 100×200 viewBox) ── */

export type ZonePos = { x: number; y: number; w: number; h: number };

export const FRONT_POSITIONS: Record<string, ZonePos> = {
  head:           { x: 38, y: 2,  w: 24, h: 10 },
  neck:           { x: 42, y: 12, w: 16, h: 4 },
  shoulder_left:  { x: 20, y: 16, w: 18, h: 7 },
  shoulder_right: { x: 62, y: 16, w: 18, h: 7 },
  arm_left:       { x: 12, y: 23, w: 14, h: 14 },
  arm_right:      { x: 74, y: 23, w: 14, h: 14 },
  lower_arm_left: { x: 8,  y: 37, w: 14, h: 14 },
  lower_arm_right:{ x: 78, y: 37, w: 14, h: 14 },
  hand_left:      { x: 4,  y: 51, w: 12, h: 8 },
  hand_right:     { x: 84, y: 51, w: 12, h: 8 },
  upper_back:     { x: 32, y: 23, w: 36, h: 12 },
  lower_back:     { x: 34, y: 35, w: 32, h: 10 },
  thigh_left:     { x: 28, y: 50, w: 20, h: 18 },
  thigh_right:    { x: 52, y: 50, w: 20, h: 18 },
  knee_left:      { x: 30, y: 68, w: 16, h: 6 },
  knee_right:     { x: 54, y: 68, w: 16, h: 6 },
  calf_left:      { x: 29, y: 74, w: 16, h: 14 },
  calf_right:     { x: 55, y: 74, w: 16, h: 14 },
  foot_left:      { x: 28, y: 88, w: 16, h: 8 },
  foot_right:     { x: 56, y: 88, w: 16, h: 8 },
};

export const BACK_POSITIONS: Record<string, ZonePos> = {
  head:           { x: 38, y: 2,  w: 24, h: 10 },
  neck:           { x: 42, y: 12, w: 16, h: 4 },
  shoulder_left:  { x: 20, y: 16, w: 18, h: 7 },
  shoulder_right: { x: 62, y: 16, w: 18, h: 7 },
  arm_left:       { x: 12, y: 23, w: 14, h: 14 },
  arm_right:      { x: 74, y: 23, w: 14, h: 14 },
  lower_arm_left: { x: 8,  y: 37, w: 14, h: 14 },
  lower_arm_right:{ x: 78, y: 37, w: 14, h: 14 },
  hand_left:      { x: 4,  y: 51, w: 12, h: 8 },
  hand_right:     { x: 84, y: 51, w: 12, h: 8 },
  upper_back:     { x: 32, y: 23, w: 36, h: 12 },
  lower_back:     { x: 34, y: 35, w: 32, h: 10 },
  glute_left:     { x: 30, y: 45, w: 18, h: 8 },
  glute_right:    { x: 52, y: 45, w: 18, h: 8 },
  thigh_left:     { x: 28, y: 53, w: 20, h: 15 },
  thigh_right:    { x: 52, y: 53, w: 20, h: 15 },
  knee_left:      { x: 30, y: 68, w: 16, h: 6 },
  knee_right:     { x: 54, y: 68, w: 16, h: 6 },
  calf_left:      { x: 29, y: 74, w: 16, h: 14 },
  calf_right:     { x: 55, y: 74, w: 16, h: 14 },
  foot_left:      { x: 28, y: 88, w: 16, h: 8 },
  foot_right:     { x: 56, y: 88, w: 16, h: 8 },
};

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
      // Midline zones — use "left" as canonical half (displayed as center)
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
