/**
 * AtmosphereStep — Music preset, volume, light. No temperature.
 *
 * This is the last intake step — submit label reflects that.
 */
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SegmentedControl } from '../../../shared/components';

const schema = z.object({
  music_preset: z.string().optional(),
  volume: z.string().optional(),
  light_preference: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  defaultValues: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => void;
  onBack: () => void;
  /** Label for the submit button (e.g. "Submit" on last step) */
  submitLabel?: string;
}

export function AtmosphereStep({ defaultValues, onSubmit, onBack, submitLabel }: Props) {
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      music_preset: (defaultValues.music_preset as string) ?? '',
      volume: (defaultValues.volume as string) ?? '',
      light_preference: (defaultValues.light_preference as string) ?? '',
    },
  });

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      music_preset: data.music_preset ?? '',
      volume: data.volume ?? '',
      light_preference: data.light_preference ?? '',
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Controller
        name="music_preset"
        control={control}
        render={({ field }) => (
          <SegmentedControl
            label={t('kiosk.music', 'Music')}
            options={[
              { id: 'nature', label: t('kiosk.musicNature', 'Nature') },
              { id: 'piano', label: t('kiosk.musicPiano', 'Piano') },
              { id: 'tibetan', label: t('kiosk.musicTibetan', 'Tibetan Bowls') },
              { id: 'silence', label: t('kiosk.musicSilence', 'Silence') },
              { id: 'lounge', label: t('kiosk.musicLounge', 'Lounge') },
            ]}
            value={field.value ?? ''}
            onChange={field.onChange}
          />
        )}
      />

      <Controller
        name="volume"
        control={control}
        render={({ field }) => (
          <SegmentedControl
            label={t('kiosk.volume', 'Volume')}
            options={[
              { id: 'low', label: t('kiosk.volumeLow', 'Low') },
              { id: 'medium', label: t('kiosk.volumeMedium', 'Medium') },
              { id: 'high', label: t('kiosk.volumeHigh', 'High') },
            ]}
            value={field.value ?? ''}
            onChange={field.onChange}
          />
        )}
      />

      <Controller
        name="light_preference"
        control={control}
        render={({ field }) => (
          <SegmentedControl
            label={t('kiosk.light', 'Lighting')}
            options={[
              { id: 'dim', label: t('kiosk.lightDim', 'Dim') },
              { id: 'medium', label: t('kiosk.lightMedium', 'Medium') },
              { id: 'bright', label: t('kiosk.lightBright', 'Bright') },
            ]}
            value={field.value ?? ''}
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
          {submitLabel ?? t('common.submit')}
        </button>
      </div>
    </form>
  );
}
