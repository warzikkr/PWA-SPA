/**
 * SessionPrefsStep — Combined session type + pressure + deep tissue.
 *
 * Combined session type decomposes into separate `duration` and `goal` keys
 * for backward compatibility with existing data model.
 */
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CardSelector, SegmentedControl, Toggle } from '../../../shared/components';

/* ── Combined session type options ── */
const SESSION_TYPES = [
  { id: '60_relax', label: '60 min – Relax', duration: '60', goal: ['relax'] },
  { id: '90_deep_relief', label: '90 min – Deep Relief', duration: '90', goal: ['pain_relief'] },
  { id: '120_sports', label: '120 min – Sports Recovery', duration: '120', goal: ['sports_recovery'] },
] as const;

const schema = z.object({
  session_type: z.string().min(1, 'Please select a session type'),
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
      session_type: (defaultValues.session_type as string) ?? '',
      pressure: (defaultValues.pressure as string) ?? '',
      deep_tissue: (defaultValues.deep_tissue as boolean) ?? false,
    },
  });

  const handleFormSubmit = (data: FormData) => {
    // Decompose combined session type into separate duration + goal keys
    const sessionDef = SESSION_TYPES.find((s) => s.id === data.session_type);
    onSubmit({
      session_type: data.session_type,
      duration: sessionDef?.duration ?? '',
      goal: sessionDef?.goal ?? [],
      pressure: data.pressure,
      deep_tissue: data.deep_tissue ?? false,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Controller
        name="session_type"
        control={control}
        render={({ field }) => (
          <CardSelector
            label={t('kiosk.sessionType', 'Session Type')}
            options={SESSION_TYPES.map((s) => ({ id: s.id, label: s.label }))}
            value={field.value}
            onChange={(v) => field.onChange(v)}
            error={errors.session_type?.message}
          />
        )}
      />

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
