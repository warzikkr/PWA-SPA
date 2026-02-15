/**
 * BodyMapStep — Focus & Avoid zones on one screen.
 *
 * Two UnifiedBodyMap instances (focus + avoid). No max selection limits.
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UnifiedBodyMap } from '../../../components/bodymap/UnifiedBodyMap';
import type { BodyZoneSelection } from '../../../types';

interface Props {
  defaultValues: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => void;
  onBack: () => void;
}

export function BodyMapStep({ defaultValues, onSubmit, onBack }: Props) {
  const { t } = useTranslation();

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
    <div className="space-y-6">
      {/* Focus zones */}
      <div>
        <h3 className="text-sm font-semibold text-brand-dark mb-2">
          {t('kiosk.focusAreas', 'Focus Areas')}
        </h3>
        <p className="text-xs text-brand-muted mb-3">
          {t('kiosk.focusAreasHint', 'Select areas you want us to focus on')}
        </p>
        <UnifiedBodyMap
          mode="edit"
          editableType="focus"
          focusZones={focusZones}
          avoidZones={avoidZones}
          onChange={setFocusZones}
        />
      </div>

      {/* Avoid zones */}
      <div>
        <h3 className="text-sm font-semibold text-brand-dark mb-2">
          {t('kiosk.avoidAreas', 'Avoid Areas')}
        </h3>
        <p className="text-xs text-brand-muted mb-3">
          {t('kiosk.avoidAreasHint', 'Select areas you want us to avoid')}
        </p>
        <UnifiedBodyMap
          mode="edit"
          editableType="avoid"
          focusZones={focusZones}
          avoidZones={avoidZones}
          onChange={setAvoidZones}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 px-4 rounded-lg border border-brand-border text-brand-dark font-medium"
        >
          {t('common.back')}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 py-3 px-4 rounded-lg bg-brand-dark text-white font-medium"
        >
          {t('common.continue')}
        </button>
      </div>
    </div>
  );
}
