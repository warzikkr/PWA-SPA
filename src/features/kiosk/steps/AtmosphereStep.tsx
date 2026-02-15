/**
 * AtmosphereStep — Screen 5 (final): Music, volume, light.
 *
 * Music uses a 2-column responsive grid to prevent overflow on iPad.
 * Volume and Light use SegmentedControl (3 options each — fits fine).
 * No temperature field.
 *
 * This is the last intake step — submit button submits the form.
 */
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SegmentedControl } from '../../../shared/components';

const MUSIC_OPTIONS = [
  { id: 'nature', labelKey: 'kiosk.musicNature', fallback: 'Nature' },
  { id: 'piano', labelKey: 'kiosk.musicPiano', fallback: 'Piano' },
  { id: 'tibetan', labelKey: 'kiosk.musicTibetan', fallback: 'Tibetan Bowls' },
  { id: 'silence', labelKey: 'kiosk.musicSilence', fallback: 'Silence' },
  { id: 'lounge', labelKey: 'kiosk.musicLounge', fallback: 'Lounge' },
];

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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Music — 2-column grid for iPad-friendly layout */}
      <Controller
        name="music_preset"
        control={control}
        render={({ field }) => (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-brand-dark">
              {t('kiosk.music', 'Music')}
            </span>
            <div className="grid grid-cols-2 gap-2">
              {MUSIC_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => field.onChange(opt.id)}
                  className={`
                    min-h-[52px] px-3 py-3 rounded-xl text-base font-medium transition-all
                    ${
                      field.value === opt.id
                        ? 'bg-white text-brand-green border-2 border-brand-green shadow-sm'
                        : 'bg-white text-brand-dark border border-brand-border hover:border-gray-300'
                    }
                  `}
                >
                  {t(opt.labelKey, opt.fallback)}
                </button>
              ))}
            </div>
          </div>
        )}
      />

      {/* Volume */}
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

      {/* Light */}
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
          {submitLabel ?? t('common.submit')}
        </button>
      </div>
    </form>
  );
}
