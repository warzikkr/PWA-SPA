import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { BodySide, BodyHalf, BodyRegion, BodyZoneSelection } from '../../types';
import {
  BILATERAL,
  FRONT_POSITIONS,
  BACK_POSITIONS,
  FrontBodySVG,
  BackBodySVG,
  getZoneEntries,
} from './BodyMap';

interface Props {
  focusZones: BodyZoneSelection[];
  avoidZones: BodyZoneSelection[];
  /** Compact mode for embedding in cards (smaller size) */
  compact?: boolean;
}

/** Check if a zone matches given side/half/region */
function matchesZone(zones: BodyZoneSelection[], side: BodySide, half: BodyHalf, region: BodyRegion): boolean {
  return zones.some((z) => z.side === side && z.half === half && z.region === region);
}

/**
 * ReadonlyBodyMap — displays focus (blue) and avoid (red) zones simultaneously.
 * Non-interactive; used in therapist/admin session views and print sheets.
 */
export function ReadonlyBodyMap({ focusZones, avoidZones, compact }: Props) {
  const { t } = useTranslation();
  const [activeSide, setActiveSide] = useState<BodySide>('front');

  const positions = activeSide === 'front' ? FRONT_POSITIONS : BACK_POSITIONS;
  const entries = getZoneEntries(activeSide);

  const regionLabel = (region: BodyRegion) => t(`bodyMap.${region}`);
  const halfLabel = (half: BodyHalf) => t(`bodyMap.${half}`);

  const maxW = compact ? 'max-w-[200px]' : 'max-w-[260px]';

  return (
    <div className="flex flex-col gap-2">
      {/* Front/Back toggle */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 max-w-[180px] mx-auto">
        <button
          type="button"
          onClick={() => setActiveSide('front')}
          className={`flex-1 py-1 px-2 rounded-md text-xs font-medium transition-colors ${
            activeSide === 'front' ? 'bg-white text-brand-dark shadow-sm' : 'text-brand-muted'
          }`}
        >
          {t('bodyMap.front')}
        </button>
        <button
          type="button"
          onClick={() => setActiveSide('back')}
          className={`flex-1 py-1 px-2 rounded-md text-xs font-medium transition-colors ${
            activeSide === 'back' ? 'bg-white text-brand-dark shadow-sm' : 'text-brand-muted'
          }`}
        >
          {t('bodyMap.back')}
        </button>
      </div>

      {/* Body SVG with zone overlays */}
      <div className={`relative w-full ${maxW} mx-auto`} style={{ aspectRatio: '1/2' }}>
        {activeSide === 'front' ? <FrontBodySVG /> : <BackBodySVG />}

        {entries.map(({ posKey, region, half }) => {
          const pos = positions[posKey];
          if (!pos) return null;

          const isFocus = matchesZone(focusZones, activeSide, half, region);
          const isAvoid = matchesZone(avoidZones, activeSide, half, region);

          if (!isFocus && !isAvoid) return null;

          const isBilateral = BILATERAL.includes(region);
          const shortLabel = isBilateral
            ? `${halfLabel(half)[0]}·${regionLabel(region)}`
            : regionLabel(region);

          // Blue for focus, red for avoid
          const colorClass = isAvoid
            ? 'bg-red-500/30 border-red-500 text-red-700'
            : 'bg-blue-500/30 border-blue-500 text-blue-700';

          return (
            <div
              key={posKey}
              title={`${isBilateral ? halfLabel(half) + ' ' : ''}${regionLabel(region)}`}
              className={`absolute rounded-md text-[7px] font-semibold leading-tight flex items-center justify-center border-2 ${colorClass}`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y / 2}%`,
                width: `${pos.w}%`,
                height: `${pos.h / 2}%`,
              }}
            >
              {shortLabel}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      {(focusZones.length > 0 || avoidZones.length > 0) && (
        <div className="flex items-center justify-center gap-4 text-xs text-brand-muted">
          {focusZones.length > 0 && (
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm bg-blue-500/40 border border-blue-500" />
              {t('therapist.focus')}
            </span>
          )}
          {avoidZones.length > 0 && (
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm bg-red-500/40 border border-red-500" />
              {t('therapist.avoid')}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
