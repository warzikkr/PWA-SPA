/**
 * HealthStep — Screen 4: Health & Sensitivity.
 *
 * Top toggle: "Do you have health conditions?" (default OFF).
 * When expanded: medical fields + allergies + oil preference + smell.
 * Gender-conditional: pregnancy only if female.
 *
 * Allergies, oil preference, and smell sensitivity are now part of this
 * step (merged from former AllergiesStep) to reduce total step count.
 *
 * Data keys remain backward-compatible:
 *   has_health_conditions, injuries, pregnancy, varicose_veins,
 *   high_blood_pressure, fever, skin_issues, pain_scale, pain_location,
 *   allergies, oil_preference, smell_sensitivity
 */
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useKioskStore } from '../../../stores/kioskStore';
import { Toggle, Slider, Input, Select, CardSelector } from '../../../shared/components';

/* ── Static option lists ── */

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

/* ── Schema ── */

const schema = z.object({
  has_health_conditions: z.boolean(),
  // Medical
  injuries: z.string().optional(),
  pregnancy: z.string().optional(),
  varicose_veins: z.boolean().optional(),
  high_blood_pressure: z.boolean().optional(),
  fever: z.boolean().optional(),
  skin_issues: z.string().optional(),
  pain_scale: z.number().optional(),
  pain_location: z.string().optional(),
  // Allergies & Oil (always visible inside expanded section)
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

export function HealthStep({ defaultValues, onSubmit, onBack }: Props) {
  const { t } = useTranslation();
  const gender = useKioskStore((s) => s.gender);

  const {
    control,
    handleSubmit,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      has_health_conditions: (defaultValues.has_health_conditions as boolean) ?? false,
      injuries: (defaultValues.injuries as string) ?? '',
      pregnancy: (defaultValues.pregnancy as string) ?? 'no',
      varicose_veins: (defaultValues.varicose_veins as boolean) ?? false,
      high_blood_pressure: (defaultValues.high_blood_pressure as boolean) ?? false,
      fever: (defaultValues.fever as boolean) ?? false,
      skin_issues: (defaultValues.skin_issues as string) ?? '',
      pain_scale: (defaultValues.pain_scale as number) ?? 0,
      pain_location: (defaultValues.pain_location as string) ?? '',
      allergies: (defaultValues.allergies as string[]) ?? [],
      oil_preference: (defaultValues.oil_preference as string) ?? '',
      smell_sensitivity: (defaultValues.smell_sensitivity as boolean) ?? false,
    },
  });

  const expanded = watch('has_health_conditions');
  const showPregnancy = gender === 'female';

  const handleFormSubmit = (data: FormData) => {
    if (!data.has_health_conditions) {
      // Not expanded — submit defaults + allergies/oil (always collected)
      onSubmit({
        has_health_conditions: false,
        pregnancy: 'no',
        allergies: data.allergies ?? [],
        oil_preference: data.oil_preference ?? '',
        smell_sensitivity: data.smell_sensitivity ?? false,
      });
      return;
    }
    onSubmit({
      has_health_conditions: true,
      injuries: data.injuries || '',
      pregnancy: showPregnancy ? (data.pregnancy || 'no') : 'no',
      varicose_veins: data.varicose_veins ?? false,
      high_blood_pressure: data.high_blood_pressure ?? false,
      fever: data.fever ?? false,
      skin_issues: data.skin_issues || '',
      pain_scale: data.pain_scale ?? 0,
      pain_location: data.pain_location || '',
      allergies: data.allergies ?? [],
      oil_preference: data.oil_preference ?? '',
      smell_sensitivity: data.smell_sensitivity ?? false,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* ── Gate toggle ── */}
      <div className="bg-gray-50 rounded-xl p-4">
        <Controller
          name="has_health_conditions"
          control={control}
          render={({ field }) => (
            <Toggle
              label={t(
                'kiosk.hasHealthConditions',
                'Do you have any health conditions we should know about?',
              )}
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      {/* ── Expanded medical section ── */}
      {expanded && (
        <div className="space-y-5">
          {/* Pregnancy — female only */}
          {showPregnancy && (
            <Controller
              name="pregnancy"
              control={control}
              render={({ field }) => (
                <Select
                  label={t('kiosk.pregnancy', 'Pregnancy Status')}
                  options={[
                    { value: 'no', label: t('kiosk.pregnancyNo', 'Not pregnant') },
                    { value: 'first', label: t('kiosk.pregnancyFirst', '1st trimester') },
                    { value: 'second', label: t('kiosk.pregnancySecond', '2nd trimester') },
                    { value: 'third', label: t('kiosk.pregnancyThird', '3rd trimester') },
                  ]}
                  value={field.value ?? 'no'}
                  onChange={field.onChange}
                />
              )}
            />
          )}

          {/* Injuries / Operations */}
          <Controller
            name="injuries"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-brand-dark">
                  {t('kiosk.injuries', 'Operations / Injuries')}
                </label>
                <textarea
                  className="w-full min-h-[96px] px-4 py-3 text-base border border-brand-border rounded-lg
                             focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green
                             placeholder:text-brand-muted resize-none"
                  placeholder={t(
                    'kiosk.injuriesPlaceholder',
                    'Recent surgeries, injuries, procedures...',
                  )}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                />
              </div>
            )}
          />

          {/* Medical toggles — grouped in card */}
          <div className="bg-white rounded-xl border border-brand-border divide-y divide-brand-border">
            <div className="px-4">
              <Controller
                name="varicose_veins"
                control={control}
                render={({ field }) => (
                  <Toggle
                    label={t('kiosk.varicoseVeins', 'Varicose Veins')}
                    checked={field.value ?? false}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
            <div className="px-4">
              <Controller
                name="high_blood_pressure"
                control={control}
                render={({ field }) => (
                  <Toggle
                    label={t('kiosk.highBP', 'High Blood Pressure')}
                    checked={field.value ?? false}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
            <div className="px-4">
              <Controller
                name="fever"
                control={control}
                render={({ field }) => (
                  <Toggle
                    label={t('kiosk.fever', 'Fever')}
                    checked={field.value ?? false}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>

          {/* Skin issues */}
          <Controller
            name="skin_issues"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-brand-dark">
                  {t('kiosk.skinIssues', 'Skin Issues')}
                </label>
                <textarea
                  className="w-full min-h-[80px] px-4 py-3 text-base border border-brand-border rounded-lg
                             focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green
                             placeholder:text-brand-muted resize-none"
                  placeholder={t(
                    'kiosk.skinIssuesPlaceholder',
                    'Eczema, psoriasis, open wounds...',
                  )}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                />
              </div>
            )}
          />

          {/* Pain scale + location */}
          <Controller
            name="pain_scale"
            control={control}
            render={({ field }) => (
              <Slider
                label={t('kiosk.painScale', 'Pain Scale')}
                value={field.value ?? 0}
                onChange={field.onChange}
                min={0}
                max={10}
              />
            )}
          />

          <Controller
            name="pain_location"
            control={control}
            render={({ field }) => (
              <Input
                label={t('kiosk.painLocation', 'Pain Location')}
                placeholder={t('kiosk.painLocationPlaceholder', 'Where does it hurt?')}
                value={field.value ?? ''}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      )}

      {/* ── Allergies & Oil section (always visible) ── */}
      <div className="border-t border-brand-border pt-6 space-y-6">
        <h3 className="text-base font-semibold text-brand-dark">
          {t('kiosk.allergiesAndOil', 'Allergies & Preferences')}
        </h3>

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
          type="submit"
          className="flex-1 min-h-[52px] rounded-xl bg-brand-dark text-white font-medium text-base active:scale-[0.98] transition-transform"
        >
          {t('common.continue')}
        </button>
      </div>
    </form>
  );
}
