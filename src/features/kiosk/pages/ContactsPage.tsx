/**
 * ContactsPage — Screen 1: Client details.
 *
 * - Full Name (required)
 * - Gender as segmented buttons (side-by-side)
 * - Contact Method as dropdown select
 * - Contact Value with dynamic placeholder based on method
 */
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useKioskStore } from '../../../stores/kioskStore';
import { useConfigStore } from '../../../stores/configStore';
import { useClientStore } from '../../../stores/clientStore';
import { Input, SegmentedControl, Select } from '../../../shared/components';
import { useKioskInactivity } from '../hooks/useKioskInactivity';

const schema = z.object({
  fullName: z.string().min(1, 'Name is required'),
  gender: z.enum(['male', 'female'], { message: 'Please select gender' }),
  contactMethod: z.string().min(1, 'Select a contact method'),
  contactValue: z.string().min(1, 'Contact value is required'),
});

type FormData = z.infer<typeof schema>;

/* Dynamic placeholder map per contact method */
const CONTACT_PLACEHOLDERS: Record<string, string> = {
  whatsapp: 'Enter WhatsApp number',
  phone: 'Enter phone number',
  telegram: 'Enter Telegram username',
  email: 'Enter email address',
  instagram: 'Enter Instagram handle',
};

export function ContactsPage() {
  useKioskInactivity();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setClientId, setGender, updateFormData } = useKioskStore();
  const config = useConfigStore((s) => s.config);
  const findOrCreate = useClientStore((s) => s.findOrCreate);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      gender: undefined,
      contactMethod: '',
      contactValue: '',
    },
  });

  const selectedMethod = watch('contactMethod');

  const onSubmit = async (data: FormData) => {
    const client = await findOrCreate({
      fullName: data.fullName,
      email: '',
      contactMethod: data.contactMethod,
      contactValue: data.contactValue,
      marketingSource: '',
      consentPromotions: false,
      consentPrivacy: true,
      gender: data.gender,
      tags: [],
    });

    setClientId(client.id);
    setGender(data.gender);

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
      }
      updateFormData(prefData);
    }

    updateFormData({ gender: data.gender });
    navigate('/kiosk/intake');
  };

  return (
    <div className="flex flex-col min-h-full px-6 py-8">
      <button onClick={() => navigate(-1)} className="text-brand-muted mb-6 self-start">
        &larr; {t('common.back')}
      </button>

      <h2 className="font-serif text-2xl font-bold text-brand-dark text-center mb-2">
        {t('kiosk.yourDetails')}
      </h2>
      <p className="text-brand-muted text-center mb-8">
        {t('kiosk.yourDetailsSubtitle')}
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-md mx-auto w-full flex flex-col gap-6 pb-28"
      >
        {/* Full Name */}
        <Input
          label={t('kiosk.fullName')}
          placeholder={t('kiosk.fullNamePlaceholder')}
          {...register('fullName')}
          error={errors.fullName?.message}
        />

        {/* Gender — segmented buttons */}
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <SegmentedControl
              label={t('kiosk.gender', 'Gender')}
              options={[
                { id: 'male', label: t('kiosk.male', 'Male') },
                { id: 'female', label: t('kiosk.female', 'Female') },
              ]}
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.gender?.message}
            />
          )}
        />

        {/* Contact Method — dropdown */}
        <Controller
          name="contactMethod"
          control={control}
          render={({ field }) => (
            <Select
              label={t('kiosk.contactMethod')}
              options={config.contactMethods
                .filter((c) => c.enabled)
                .map((c) => ({ value: c.id, label: c.label }))}
              placeholder={t('common.selectPlaceholder', 'Select...')}
              value={field.value}
              onChange={field.onChange}
              error={errors.contactMethod?.message}
            />
          )}
        />

        {/* Contact Value — dynamic placeholder */}
        <Input
          label={t('kiosk.contactValue')}
          placeholder={
            CONTACT_PLACEHOLDERS[selectedMethod] ??
            t('kiosk.contactValuePlaceholder')
          }
          {...register('contactValue')}
          error={errors.contactValue?.message}
        />

        {/* Fixed bottom button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-brand-border">
          <div className="max-w-md mx-auto">
            <button
              type="submit"
              className="w-full min-h-[56px] rounded-xl bg-brand-dark text-white font-medium text-lg active:scale-[0.98] transition-transform"
            >
              {t('common.continue')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
