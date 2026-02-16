/**
 * BodyMapStep — Screen 3: Focus & Avoid areas.
 *
 * Two UnifiedBodyMap instances with clear section headers,
 * clean spacing, and unlimited selection.
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UnifiedBodyMap } from '../../../components/bodymap/UnifiedBodyMap';
import { useKioskStore } from '../../../stores/kioskStore';
import type { BodyGender, BodyZoneSelection } from '../../../types';

interface Props {
  defaultValues: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => void;
  onBack: () => void;
}

export function BodyMapStep({ defaultValues, onSubmit, onBack }: Props) {
  const { t } = useTranslation();
  const storeGender = useKioskStore((s) => s.gender);
  const gender: BodyGender = storeGender === 'male' ? 'male' : 'female';

  const [focusZones, setFocusZones] = useState<BodyZoneSelection[]>(
    (defaultValues.focus_zones as BodyZoneSelection[]) ?? [],
  );
  const [avoidZones, setAvoidZones] = useState<BodyZoneSelection[]>(
    (defaultValues.avoid_zones as BodyZoneSelection[]) ?? [],
  );

  const handleSubmit = () => {
    onSubmit({
      focus_zones: focusZones,
      avoid_zones: avoidZones,
    });
  };

  return (
    <div className="space-y-8">
      {/* Focus zones */}
      <div className="bg-blue-50/50 rounded-xl p-4">
        <h3 className="text-base font-semibold text-brand-dark mb-1">
          {t('kiosk.focusAreas', 'Focus Areas')}
        </h3>
        <p className="text-sm text-brand-muted mb-4">
          {t('kiosk.focusAreasHint', 'Select areas you want us to focus on')}
        </p>
        <UnifiedBodyMap
          mode="edit"
          editableType="focus"
          focusZones={focusZones}
          avoidZones={avoidZones}
          onChange={setFocusZones}
          gender={gender}
        />
      </div>

      {/* Avoid zones */}
      <div className="bg-red-50/50 rounded-xl p-4">
        <h3 className="text-base font-semibold text-brand-dark mb-1">
          {t('kiosk.avoidAreas', 'Avoid Areas')}
        </h3>
        <p className="text-sm text-brand-muted mb-4">
          {t('kiosk.avoidAreasHint', 'Select areas you want us to avoid')}
        </p>
        <UnifiedBodyMap
          mode="edit"
          editableType="avoid"
          focusZones={focusZones}
          avoidZones={avoidZones}
          onChange={setAvoidZones}
          gender={gender}
        />
      </div>

      {/* Nav buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 min-h-[52px] rounded-xl border border-brand-border text-brand-dark font-medium text-base active:scale-[0.98] transition-transform"
        >
          {t('common.back')}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 min-h-[52px] rounded-xl bg-brand-dark text-white font-medium text-base active:scale-[0.98] transition-transform"
        >
          {t('common.continue')}
        </button>
      </div>
    </div>
  );
}
