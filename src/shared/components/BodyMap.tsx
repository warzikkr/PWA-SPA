import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { BodySide, BodyHalf, BodyRegion, BodyZoneSelection } from '../../types';

interface Props {
  label?: string;
  selected: BodyZoneSelection[];
  onChange: (zones: BodyZoneSelection[]) => void;
  maxSelections?: number;
  mode?: 'focus' | 'avoid';
  error?: string;
}

/** All available regions */
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

export type ZonePos = { x: number; y: number; w: number; h: number };

/** Hitbox positions for front view, percentage of 100x200 viewbox */
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

/** Hitbox positions for back view */
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

export function zoneKey(z: BodyZoneSelection): string {
  return `${z.side}:${z.half}:${z.region}`;
}

export function isSelected(selected: BodyZoneSelection[], side: BodySide, half: BodyHalf, region: BodyRegion): boolean {
  return selected.some((s) => s.side === side && s.half === half && s.region === region);
}

/** Get all clickable zone entries for a given side */
export function getZoneEntries(side: BodySide): Array<{ posKey: string; region: BodyRegion; half: BodyHalf }> {
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

/** SVG body outline — front view */
export function FrontBodySVG() {
  return (
    <svg viewBox="0 0 100 200" className="w-full h-full" fill="none" stroke="#ccc" strokeWidth="0.5">
      <ellipse cx="50" cy="12" rx="10" ry="11" />
      <rect x="45" y="23" width="10" height="6" rx="2" />
      <path d="M30 29 Q28 29 26 35 L22 55 Q20 60 25 65 L30 70 Q35 73 40 73 L60 73 Q65 73 70 70 L75 65 Q80 60 78 55 L74 35 Q72 29 70 29 Z" />
      <path d="M26 32 Q18 40 12 52 Q8 58 10 62 L15 58 Q20 50 24 42" />
      <path d="M74 32 Q82 40 88 52 Q92 58 90 62 L85 58 Q80 50 76 42" />
      <path d="M35 73 Q33 90 32 110 Q31 130 30 145 Q29 165 32 180 L38 180 Q40 165 40 145 Q40 130 41 110 Q42 90 42 80" />
      <path d="M58 80 Q58 90 59 110 Q60 130 60 145 Q60 165 62 180 L68 180 Q71 165 70 145 Q69 130 68 110 Q67 90 65 73" />
      <line x1="50" y1="29" x2="50" y2="73" strokeDasharray="2 2" opacity="0.3" />
    </svg>
  );
}

/** SVG body outline — back view */
export function BackBodySVG() {
  return (
    <svg viewBox="0 0 100 200" className="w-full h-full" fill="none" stroke="#ccc" strokeWidth="0.5">
      <ellipse cx="50" cy="12" rx="10" ry="11" />
      <rect x="45" y="23" width="10" height="6" rx="2" />
      <path d="M30 29 Q28 29 26 35 L22 55 Q20 60 25 65 L30 70 Q35 73 40 73 L60 73 Q65 73 70 70 L75 65 Q80 60 78 55 L74 35 Q72 29 70 29 Z" />
      <path d="M26 32 Q18 40 12 52 Q8 58 10 62 L15 58 Q20 50 24 42" />
      <path d="M74 32 Q82 40 88 52 Q92 58 90 62 L85 58 Q80 50 76 42" />
      <path d="M35 73 Q33 90 32 110 Q31 130 30 145 Q29 165 32 180 L38 180 Q40 165 40 145 Q40 130 41 110 Q42 90 42 80" />
      <path d="M58 80 Q58 90 59 110 Q60 130 60 145 Q60 165 62 180 L68 180 Q71 165 70 145 Q69 130 68 110 Q67 90 65 73" />
      <line x1="50" y1="29" x2="50" y2="73" strokeDasharray="2 2" opacity="0.3" />
      {/* Spine line */}
      <line x1="50" y1="23" x2="50" y2="73" stroke="#ddd" strokeWidth="0.8" />
    </svg>
  );
}

export function BodyMap({ label, selected, onChange, maxSelections, mode = 'focus', error }: Props) {
  const { t } = useTranslation();
  const [activeSide, setActiveSide] = useState<BodySide>('front');

  const colorClass = mode === 'avoid' ? 'red' : 'green';
  const bgSelected = mode === 'avoid' ? 'bg-red-500/25 border-red-500 text-red-600' : 'bg-brand-green/25 border-brand-green text-brand-green';
  const chipSelected = mode === 'avoid' ? 'bg-red-500 text-white' : 'bg-brand-green text-white';

  const toggle = (side: BodySide, half: BodyHalf, region: BodyRegion) => {
    const existing = selected.findIndex(
      (s) => s.side === side && s.half === half && s.region === region,
    );
    if (existing >= 0) {
      onChange(selected.filter((_, i) => i !== existing));
    } else if (!maxSelections || selected.length < maxSelections) {
      onChange([...selected, { side, half, region }]);
    }
  };

  const positions = activeSide === 'front' ? FRONT_POSITIONS : BACK_POSITIONS;
  const entries = getZoneEntries(activeSide);

  const regionLabel = (region: BodyRegion) => t(`bodyMap.${region}`);
  const halfLabel = (half: BodyHalf) => t(`bodyMap.${half}`);

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-sm font-medium text-brand-dark">{label}</span>}

      {/* Front/Back toggle */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 max-w-[200px] mx-auto">
        <button
          type="button"
          onClick={() => setActiveSide('front')}
          className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${
            activeSide === 'front' ? 'bg-white text-brand-dark shadow-sm' : 'text-brand-muted'
          }`}
        >
          {t('bodyMap.front')}
        </button>
        <button
          type="button"
          onClick={() => setActiveSide('back')}
          className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${
            activeSide === 'back' ? 'bg-white text-brand-dark shadow-sm' : 'text-brand-muted'
          }`}
        >
          {t('bodyMap.back')}
        </button>
      </div>

      {/* Body SVG with overlays */}
      <div className="relative w-full max-w-[280px] mx-auto" style={{ aspectRatio: '1/2' }}>
        {activeSide === 'front' ? <FrontBodySVG /> : <BackBodySVG />}

        {entries.map(({ posKey, region, half }) => {
          const pos = positions[posKey];
          if (!pos) return null;
          const sel = isSelected(selected, activeSide, half, region);
          const isBilateral = BILATERAL.includes(region);
          const shortLabel = isBilateral
            ? `${halfLabel(half)[0]}·${regionLabel(region)}`
            : regionLabel(region);

          return (
            <button
              key={posKey}
              type="button"
              onClick={() => toggle(activeSide, half, region)}
              title={`${isBilateral ? halfLabel(half) + ' ' : ''}${regionLabel(region)}`}
              className={`
                absolute rounded-md transition-all text-[8px] font-medium leading-tight
                flex items-center justify-center border-2
                ${sel
                  ? bgSelected
                  : 'bg-transparent hover:bg-gray-100/50 border-transparent hover:border-gray-300 text-transparent hover:text-gray-500'
                }
              `}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y / 2}%`,
                width: `${pos.w}%`,
                height: `${pos.h / 2}%`,
              }}
            >
              {sel ? shortLabel : ''}
            </button>
          );
        })}
      </div>

      {/* Selected chips grouped by side */}
      {selected.length > 0 && (
        <div className="space-y-1 mt-2">
          {(['front', 'back'] as BodySide[]).map((side) => {
            const sideZones = selected.filter((s) => s.side === side);
            if (sideZones.length === 0) return null;
            return (
              <div key={side}>
                <span className="text-xs text-brand-muted uppercase">
                  {side === 'front' ? t('bodyMap.front') : t('bodyMap.back')}:
                </span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {sideZones.map((z) => {
                    const isBilateral = BILATERAL.includes(z.region);
                    return (
                      <button
                        key={zoneKey(z)}
                        type="button"
                        onClick={() => toggle(z.side, z.half, z.region)}
                        className={`px-2 py-1 rounded-full text-xs transition-colors ${chipSelected}`}
                      >
                        {isBilateral ? `${halfLabel(z.half)} ` : ''}{regionLabel(z.region)} ×
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-brand-muted hover:text-red-500 mt-1"
          >
            {t('bodyMap.clearAll')}
          </button>
        </div>
      )}

      {error && <span className="text-sm text-red-500 text-center">{error}</span>}
    </div>
  );
}

