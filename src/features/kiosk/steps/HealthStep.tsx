/**
 * HealthStep — Collapsed by default. Expands if client has health conditions.
 *
 * Gender-conditional: pregnancy only shown if gender === 'female'.
 * Only validates visible fields. Writes has_health_conditions flag.
 */
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useKioskStore } from '../../../stores/kioskStore';
import { Toggle, Slider, Input, Select } from '../../../shared/components';

const schema = z.object({
  has_health_conditions: z.boolean(),
  injuries: z.string().optional(),
  pregnancy: z.string().optional(),
  varicose_veins: z.boolean().optional(),
  high_blood_pressure: z.boolean().optional(),
  fever: z.boolean().optional(),
  skin_issues: z.string().optional(),
  pain_scale: z.number().optional(),
  pain_location: z.string().optional(),
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
    },
  });

  const expanded = watch('has_health_conditions');
  const showPregnancy = gender === 'female';

  const handleFormSubmit = (data: FormData) => {
    if (!data.has_health_conditions) {
      // Only submit the flag — all health fields default/empty
      onSubmit({ has_health_conditions: false, pregnancy: 'no' });
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
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Gate toggle */}
      <Controller
        name="has_health_conditions"
        control={control}
        render={({ field }) => (
          <Toggle
            label={t('kiosk.hasHealthConditions', 'Do you have any health conditions we should know about?')}
            checked={field.value}
            onChange={field.onChange}
          />
        )}
      />

      {/* Expanded health section */}
      {expanded && (
        <div className="space-y-5 animate-in fade-in duration-200">
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
                  placeholder={t('kiosk.injuriesPlaceholder', 'Recent surgeries, injuries, procedures...')}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                />
              </div>
            )}
          />

          {/* Toggles */}
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
                  placeholder={t('kiosk.skinIssuesPlaceholder', 'Eczema, psoriasis, open wounds...')}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                />
              </div>
            )}
          />

          {/* Pain scale */}
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

          {/* Pain location */}
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
