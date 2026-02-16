/**
 * UnifiedBodyMap.tsx — THE ONLY body-map rendering component.
 *
 * Supports two modes:
 *   • readonly — displays focus (blue) + avoid (red) zones, no interaction
 *   • edit    — interactive selection for one zone type at a time;
 *               the other type is shown faded
 *
 * Visual output is 100 % identical regardless of user role or page.
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { BodySide, BodyHalf, BodyRegion, BodyGender, BodyZoneSelection } from '../../types';
import { getBodySVG } from './BodySVG';
import {
  BILATERAL,
  FRONT_POSITIONS,
  BACK_POSITIONS,
  getZoneEntries,
  isSelected,
  zoneKey,
  FOCUS_STYLE,
  AVOID_STYLE,
  FOCUS_FADED,
  AVOID_FADED,
  FOCUS_CHIP,
  AVOID_CHIP,
} from './bodyMapData';

/* ── Props ── */

export interface UnifiedBodyMapProps {
  /** Zones the client wants focused on (blue) */
  focusZones?: BodyZoneSelection[];
  /** Zones the client wants avoided (red) */
  avoidZones?: BodyZoneSelection[];
  /** Display-only or interactive selection */
  mode: 'edit' | 'readonly';
  /** Which zone type is currently being edited (edit mode only) */
  editableType?: 'focus' | 'avoid';
  /** Callback when the editable zone list changes */
  onChange?: (zones: BodyZoneSelection[]) => void;
  /** Max zones selectable (edit mode only) */
  maxSelections?: number;
  /** Optional label rendered above the map */
  label?: string;
  /** Validation error */
  error?: string;
  /** Smaller sizing for card embeds */
  compact?: boolean;
  /** Pre-selected gender (readonly mode); edit mode has internal toggle */
  gender?: BodyGender;
}

/* ── Component ── */

export function UnifiedBodyMap({
  focusZones = [],
  avoidZones = [],
  mode,
  editableType = 'focus',
  onChange,
  maxSelections,
  label,
  error,
  compact,
  gender: genderProp,
}: UnifiedBodyMapProps) {
  const { t } = useTranslation();
  const [activeSide, setActiveSide] = useState<BodySide>('front');
  const [activeGender, setActiveGender] = useState<BodyGender>(genderProp ?? 'female');

  const gender = genderProp ?? activeGender;

  const positions = activeSide === 'front' ? FRONT_POSITIONS : BACK_POSITIONS;
  const entries = getZoneEntries(activeSide);

  const regionLabel = (region: BodyRegion) => t(`bodyMap.${region}`);
  const halfLabel = (half: BodyHalf) => t(`bodyMap.${half}`);

  const shortLabel = (region: BodyRegion, half: BodyHalf) => {
    const isBilateral = BILATERAL.includes(region);
    return isBilateral ? `${halfLabel(half)[0]}·${regionLabel(region)}` : regionLabel(region);
  };

  const titleLabel = (region: BodyRegion, half: BodyHalf) => {
    const isBilateral = BILATERAL.includes(region);
    return isBilateral ? `${halfLabel(half)} ${regionLabel(region)}` : regionLabel(region);
  };

  /* ── Edit-mode helpers ── */

  const editableZones = editableType === 'avoid' ? avoidZones : focusZones;

  const toggle = (side: BodySide, half: BodyHalf, region: BodyRegion) => {
    if (mode !== 'edit' || !onChange) return;
    const idx = editableZones.findIndex(
      (s) => s.side === side && s.half === half && s.region === region,
    );
    if (idx >= 0) {
      onChange(editableZones.filter((_, i) => i !== idx));
    } else if (!maxSelections || editableZones.length < maxSelections) {
      onChange([...editableZones, { side, half, region }]);
    }
  };

  /* ── Sizing ── */

  const maxW = compact ? 'max-w-[220px]' : 'max-w-[300px]';

  /* ── Zone style resolver ── */

  const getZoneStyle = (
    half: BodyHalf,
    region: BodyRegion,
  ): { className: string; label: string } | null => {
    const isFocus = isSelected(focusZones, activeSide, half, region);
    const isAvoid = isSelected(avoidZones, activeSide, half, region);

    if (mode === 'readonly') {
      if (isAvoid) return { className: AVOID_STYLE, label: shortLabel(region, half) };
      if (isFocus) return { className: FOCUS_STYLE, label: shortLabel(region, half) };
      return null;
    }

    const isEditTarget = editableType === 'avoid' ? isAvoid : isFocus;
    const isOther = editableType === 'avoid' ? isFocus : isAvoid;

    if (isEditTarget) {
      return {
        className: editableType === 'avoid' ? AVOID_STYLE : FOCUS_STYLE,
        label: shortLabel(region, half),
      };
    }
    if (isOther) {
      return {
        className: editableType === 'avoid' ? FOCUS_FADED : AVOID_FADED,
        label: shortLabel(region, half),
      };
    }
    return null;
  };

  /* ── Toggle button helper ── */

  const toggleBtn = (
    isActive: boolean,
    onClick: () => void,
    label: string,
  ) => (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-1 px-2 rounded-md text-xs font-medium transition-colors ${
        isActive ? 'bg-white text-brand-dark shadow-sm' : 'text-brand-muted'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-sm font-medium text-brand-dark">{label}</span>}

      {/* Gender + Front/Back toggles */}
      <div className="flex justify-center gap-2">
        {/* Gender toggle */}
        {!genderProp && (
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {toggleBtn(gender === 'female', () => setActiveGender('female'), t('bodyMap.female'))}
            {toggleBtn(gender === 'male', () => setActiveGender('male'), t('bodyMap.male'))}
          </div>
        )}
        {/* Front / Back toggle */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {toggleBtn(activeSide === 'front', () => setActiveSide('front'), t('bodyMap.front'))}
          {toggleBtn(activeSide === 'back', () => setActiveSide('back'), t('bodyMap.back'))}
        </div>
      </div>

      {/* Body SVG + zone overlays */}
      <div className={`relative w-full ${maxW} mx-auto`} style={{ aspectRatio: '1/2' }}>
        {getBodySVG(gender, activeSide)}

        {entries.map(({ posKey, region, half }) => {
          const pos = positions[posKey];
          if (!pos) return null;

          const zoneInfo = getZoneStyle(half, region);

          if (mode === 'readonly') {
            if (!zoneInfo) return null;
            return (
              <div
                key={posKey}
                title={titleLabel(region, half)}
                className={`absolute rounded text-[6px] font-semibold leading-none flex items-center justify-center border overflow-hidden whitespace-nowrap ${zoneInfo.className}`}
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y / 2}%`,
                  width: `${pos.w}%`,
                  height: `${pos.h / 2}%`,
                }}
              >
                {zoneInfo.label}
              </div>
            );
          }

          const isActive = !!zoneInfo && !zoneInfo.className.includes('/25');
          return (
            <button
              key={posKey}
              type="button"
              onClick={() => toggle(activeSide, half, region)}
              title={titleLabel(region, half)}
              className={`
                absolute rounded transition-all text-[6px] font-semibold leading-none
                flex items-center justify-center border overflow-hidden whitespace-nowrap
                ${zoneInfo
                  ? zoneInfo.className
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
              {isActive || zoneInfo ? zoneInfo?.label ?? '' : ''}
            </button>
          );
        })}
      </div>

      {/* Selected chips — edit mode only */}
      {mode === 'edit' && editableZones.length > 0 && (
        <div className="space-y-1 mt-2">
          {(['front', 'back'] as BodySide[]).map((side) => {
            const sideZones = editableZones.filter((s) => s.side === side);
            if (sideZones.length === 0) return null;
            const chipClass = editableType === 'avoid' ? AVOID_CHIP : FOCUS_CHIP;
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
                        className={`px-2 py-1 rounded-full text-xs transition-colors ${chipClass}`}
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
            onClick={() => onChange?.([])}
            className="text-xs text-brand-muted hover:text-red-500 mt-1"
          >
            {t('bodyMap.clearAll')}
          </button>
        </div>
      )}

      {/* Legend */}
      {(focusZones.length > 0 || avoidZones.length > 0) && (
        <div className="flex items-center justify-center gap-4 text-xs text-brand-muted">
          {focusZones.length > 0 && (
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm bg-blue-500/70 border border-blue-500" />
              {t('therapist.focus')}
            </span>
          )}
          {avoidZones.length > 0 && (
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm bg-red-500/70 border border-red-500" />
              {t('therapist.avoid')}
            </span>
          )}
        </div>
      )}

      {error && <span className="text-sm text-red-500 text-center">{error}</span>}
    </div>
  );
}
