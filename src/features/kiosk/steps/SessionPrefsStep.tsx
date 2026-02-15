/**
 * SessionPrefsStep — Screen 2: Session Preferences.
 *
 * Separate fields: Duration (large cards), Goal (multi-select),
 * Pressure (segmented), Deep Tissue (toggle).
 *
 * Writes standard `duration`, `goal`, `pressure`, `deep_tissue` keys
 * for full backward compatibility.
 */
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CardSelector, SegmentedControl, Toggle } from '../../../shared/components';

const schema = z.object({
  duration: z.string().min(1, 'Please select a duration'),
  goal: z.array(z.string()).min(1, 'Please select at least one goal'),
  pressure: z.string().min(1, 'Please select pressure'),
  deep_tissue: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  defaultValues: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => void;
  onBack: () => void;
}

export function SessionPrefsStep({ defaultValues, onSubmit, onBack }: Props) {
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      duration: (defaultValues.duration as string) ?? '',
      goal: (defaultValues.goal as string[]) ?? [],
      pressure: (defaultValues.pressure as string) ?? '',
      deep_tissue: (defaultValues.deep_tissue as boolean) ?? false,
    },
  });

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      duration: data.duration,
      goal: data.goal,
      pressure: data.pressure,
      deep_tissue: data.deep_tissue ?? false,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Duration — large selectable cards */}
      <Controller
        name="duration"
        control={control}
        render={({ field }) => (
          <CardSelector
            label={t('kiosk.duration', 'Session Duration')}
            options={[
              { id: '60', label: '60 min' },
              { id: '90', label: '90 min' },
              { id: '120', label: '120 min' },
            ]}
            value={field.value}
            onChange={(v) => field.onChange(v)}
            error={errors.duration?.message}
          />
        )}
      />

      {/* Goal — multi-select cards */}
      <Controller
        name="goal"
        control={control}
        render={({ field }) => (
          <CardSelector
            label={t('kiosk.goal', 'Session Goal')}
            multiple
            options={[
              { id: 'relax', label: t('kiosk.goalRelax', 'Relaxation') },
              { id: 'pain_relief', label: t('kiosk.goalPain', 'Pain Relief') },
              { id: 'sports_recovery', label: t('kiosk.goalSports', 'Sports Recovery') },
              { id: 'sleep', label: t('kiosk.goalSleep', 'Sleep') },
              { id: 'lymphatic', label: t('kiosk.goalLymphatic', 'Lymphatic') },
              { id: 'other', label: t('kiosk.goalOther', 'Other') },
            ]}
            value={(field.value as string[]) ?? []}
            onChange={(v) => field.onChange(v)}
            error={errors.goal?.message}
          />
        )}
      />

      {/* Pressure — segmented control */}
      <Controller
        name="pressure"
        control={control}
        render={({ field }) => (
          <SegmentedControl
            label={t('therapist.pressure', 'Pressure')}
            options={[
              { id: 'soft', label: t('kiosk.soft', 'Soft') },
              { id: 'medium', label: t('kiosk.medium', 'Medium') },
              { id: 'strong', label: t('kiosk.strong', 'Strong') },
            ]}
            value={field.value}
            onChange={field.onChange}
            error={errors.pressure?.message}
          />
        )}
      />

      {/* Deep Tissue — toggle */}
      <Controller
        name="deep_tissue"
        control={control}
        render={({ field }) => (
          <Toggle
            label={t('therapist.deepTissue', 'Deep Tissue')}
            checked={field.value ?? false}
            onChange={field.onChange}
          />
        )}
      />

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
