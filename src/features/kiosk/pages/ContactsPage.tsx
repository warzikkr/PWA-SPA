import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useKioskStore } from '../../../stores/kioskStore';
import { useConfigStore } from '../../../stores/configStore';
import { useClientStore } from '../../../stores/clientStore';
import { Input, Select, Checkbox } from '../../../shared/components';
import { useKioskInactivity } from '../hooks/useKioskInactivity';

const schema = z.object({
  fullName: z.string().min(1, 'Name is required'),
  contactMethod: z.string().min(1, 'Select a contact method'),
  contactValue: z.string().min(1, 'Contact value is required'),
  email: z.string().email('Valid email required'),
  marketingSource: z.string().min(1, 'Please select'),
  consentPromotions: z.boolean(),
  consentPrivacy: z.literal(true, { message: 'You must agree to the privacy policy' }),
});

type FormData = z.infer<typeof schema>;

export function ContactsPage() {
  useKioskInactivity();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setClientId, updateFormData } = useKioskStore();
  const config = useConfigStore((s) => s.config);
  const findOrCreate = useClientStore((s) => s.findOrCreate);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      contactMethod: '',
      contactValue: '',
      email: '',
      marketingSource: '',
      consentPromotions: false,
      consentPrivacy: false as unknown as true,
    },
  });

  const onSubmit = async (data: FormData) => {
    // Find existing client by email or create new
    const client = await findOrCreate({
      fullName: data.fullName,
      email: data.email,
      contactMethod: data.contactMethod,
      contactValue: data.contactValue,
      marketingSource: data.marketingSource,
      consentPromotions: data.consentPromotions,
      consentPrivacy: true,
      tags: [],
    });

    setClientId(client.id);

    // Pre-fill form with returning client's preferences
    if (client.preferences) {
      const prefs = client.preferences;
      const prefData: Record<string, unknown> = {};
      if (prefs.pressure) prefData.pressure = prefs.pressure;
      if (prefs.oilPreference) prefData.oil_preference = prefs.oilPreference;
      if (prefs.allergies?.length) prefData.allergies = prefs.allergies;
      if (prefs.smellSensitivity != null) prefData.smell_sensitivity = prefs.smellSensitivity;
      if (prefs.focusZones?.length) prefData.focus_zones = prefs.focusZones;
      if (prefs.avoidZones?.length) prefData.avoid_zones = prefs.avoidZones;
      if (prefs.atmosphere) {
        if (prefs.atmosphere.music) prefData.music_preset = prefs.atmosphere.music;
        if (prefs.atmosphere.volume) prefData.volume = prefs.atmosphere.volume;
        if (prefs.atmosphere.light) prefData.light_preference = prefs.atmosphere.light;
        if (prefs.atmosphere.temp) prefData.temperature = prefs.atmosphere.temp;
      }
      updateFormData(prefData);
    }

    navigate('/kiosk/intake');
  };

  return (
    <div className="flex flex-col min-h-full px-6 py-8">
      <button onClick={() => navigate(-1)} className="text-brand-muted mb-6 self-start">&larr; {t('common.back')}</button>

      <h2 className="font-serif text-2xl font-bold text-brand-dark text-center mb-2">
        {t('kiosk.yourDetails')}
      </h2>
      <p className="text-brand-muted text-center mb-8">
        {t('kiosk.yourDetailsSubtitle')}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm mx-auto w-full flex flex-col gap-5 pb-28">
        <Input
          label={t('kiosk.fullName')}
          placeholder={t('kiosk.fullNamePlaceholder')}
          {...register('fullName')}
          error={errors.fullName?.message}
        />

        <Controller
          name="contactMethod"
          control={control}
          render={({ field }) => (
            <Select
              label={t('kiosk.contactMethod')}
              options={config.contactMethods.filter((c) => c.enabled).map((c) => ({ value: c.id, label: c.label }))}
              placeholder={t('common.selectPlaceholder')}
              value={field.value}
              onChange={field.onChange}
              error={errors.contactMethod?.message}
            />
          )}
        />

        <Input
          label={t('kiosk.contactValue')}
          placeholder={t('kiosk.contactValuePlaceholder')}
          {...register('contactValue')}
          error={errors.contactValue?.message}
        />

        <Input
          label={t('kiosk.email')}
          type="email"
          placeholder={t('kiosk.emailPlaceholder')}
          {...register('email')}
          error={errors.email?.message}
        />

        <Controller
          name="marketingSource"
          control={control}
          render={({ field }) => (
            <Select
              label={t('kiosk.howDidYouHear')}
              options={config.marketingSources.filter((s) => s.enabled).map((s) => ({ value: s.id, label: s.label }))}
              placeholder={t('common.selectPlaceholder')}
              value={field.value}
              onChange={field.onChange}
              error={errors.marketingSource?.message}
            />
          )}
        />

        <div className="border-t border-brand-border pt-4 mt-2 flex flex-col gap-2">
          <Checkbox
            label={t('kiosk.consentPromotions')}
            {...register('consentPromotions')}
          />
          <Checkbox
            label={t('kiosk.consentPrivacy')}
            {...register('consentPrivacy')}
            error={errors.consentPrivacy?.message}
          />
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-brand-border">
          <div className="max-w-sm mx-auto">
            <button
              type="submit"
              className="w-full min-h-[52px] rounded-lg bg-brand-dark text-white font-medium text-lg"
            >
              {t('common.continue')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
