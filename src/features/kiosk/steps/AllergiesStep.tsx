/**
 * AllergiesStep — Allergies (tag-style), oil preference (tile buttons), smell toggle.
 *
 * Oil rendered as clickable tile buttons (CardSelector) instead of dropdown.
 */
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CardSelector, Toggle } from '../../../shared/components';

const ALLERGY_OPTIONS = [
  { id: 'nuts', label: 'Nuts' },
  { id: 'latex', label: 'Latex' },
  { id: 'essential_oils', label: 'Essential Oils' },
  { id: 'fragrances', label: 'Fragrances' },
  { id: 'other', label: 'Other' },
];

const OIL_OPTIONS = [
  { id: 'coconut', label: 'Coconut' },
  { id: 'jojoba', label: 'Jojoba' },
  { id: 'lavender', label: 'Lavender' },
  { id: 'eucalyptus', label: 'Eucalyptus' },
  { id: 'unscented', label: 'Unscented' },
  { id: 'no_preference', label: 'No Preference' },
];

const schema = z.object({
  allergies: z.array(z.string()).optional(),
  oil_preference: z.string().optional(),
  smell_sensitivity: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  defaultValues: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => void;
  onBack: () => void;
}

export function AllergiesStep({ defaultValues, onSubmit, onBack }: Props) {
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      allergies: (defaultValues.allergies as string[]) ?? [],
      oil_preference: (defaultValues.oil_preference as string) ?? '',
      smell_sensitivity: (defaultValues.smell_sensitivity as boolean) ?? false,
    },
  });

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      allergies: data.allergies ?? [],
      oil_preference: data.oil_preference ?? '',
      smell_sensitivity: data.smell_sensitivity ?? false,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Allergies — multi-select tags */}
      <Controller
        name="allergies"
        control={control}
        render={({ field }) => (
          <CardSelector
            label={t('kiosk.allergies', 'Allergies')}
            multiple
            options={ALLERGY_OPTIONS}
            value={(field.value as string[]) ?? []}
            onChange={(v) => field.onChange(v)}
          />
        )}
      />

      {/* Oil preference — tile buttons */}
      <Controller
        name="oil_preference"
        control={control}
        render={({ field }) => (
          <CardSelector
            label={t('kiosk.oilPreference', 'Oil Preference')}
            options={OIL_OPTIONS}
            value={field.value ?? ''}
            onChange={(v) => field.onChange(v)}
          />
        )}
      />

      {/* Smell sensitivity */}
      <Controller
        name="smell_sensitivity"
        control={control}
        render={({ field }) => (
          <Toggle
            label={t('kiosk.smellSensitivity', 'Strong Smell Sensitivity')}
            checked={field.value ?? false}
            onChange={field.onChange}
          />
        )}
      />

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 px-4 rounded-lg border border-brand-border text-brand-dark font-medium"
        >
          {t('common.back')}
        </button>
        <button
          type="submit"
          className="flex-1 py-3 px-4 rounded-lg bg-brand-dark text-white font-medium"
        >
          {t('common.continue')}
        </button>
      </div>
    </form>
  );
}
