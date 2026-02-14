import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useKioskStore } from '../../../stores/kioskStore';
import { useConfigStore } from '../../../stores/configStore';
import { useIntakeStore } from '../../../stores/intakeStore';
import { useBookingStore } from '../../../stores/bookingStore';
import { useClientStore } from '../../../stores/clientStore';
import { StepProgress } from '../../../shared/components';
import { FormRenderer } from '../../../engine/FormRenderer';
import { useKioskInactivity } from '../hooks/useKioskInactivity';
import type { ClientPreferences } from '../../../types';

/** Extract reusable preferences from intake data */
function extractPreferences(data: Record<string, unknown>): ClientPreferences {
  const prefs: ClientPreferences = {};
  if (data.pressure) prefs.pressure = String(data.pressure);
  if (data.oil_preference) prefs.oilPreference = String(data.oil_preference);
  if (Array.isArray(data.allergies) && data.allergies.length) prefs.allergies = data.allergies as string[];
  if (data.smell_sensitivity != null) prefs.smellSensitivity = Boolean(data.smell_sensitivity);
  if (Array.isArray(data.focus_zones) && data.focus_zones.length) prefs.focusZones = data.focus_zones as ClientPreferences['focusZones'];
  if (Array.isArray(data.avoid_zones) && data.avoid_zones.length) prefs.avoidZones = data.avoid_zones as ClientPreferences['avoidZones'];
  const atmo: Record<string, string> = {};
  if (data.music_preset) atmo.music = String(data.music_preset);
  if (data.volume) atmo.volume = String(data.volume);
  if (data.light_preference) atmo.light = String(data.light_preference);
  if (data.temperature) atmo.temp = String(data.temperature);
  if (Object.keys(atmo).length) prefs.atmosphere = atmo;
  return prefs;
}

export function IntakeWizardPage() {
  useKioskInactivity();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { intakeStep, setIntakeStep, formData, updateFormData, clientId, bookingId, isWalkin } = useKioskStore();
  const intakeSchema = useConfigStore((s) => s.config.intakeSchema);
  const addIntake = useIntakeStore((s) => s.addIntake);
  const { addBooking, updateBooking } = useBookingStore();
  const { updatePreferences, addVisit } = useClientStore();

  const enabledSteps = intakeSchema
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  const currentStep = enabledSteps[intakeStep];
  const isLast = intakeStep === enabledSteps.length - 1;

  if (!currentStep) {
    navigate('/kiosk/thanks', { replace: true });
    return null;
  }

  const handleStepSubmit = async (data: Record<string, unknown>) => {
    const merged = { ...formData, ...data };
    updateFormData(data);

    if (isLast) {
      let finalBookingId = bookingId;

      if (isWalkin && clientId && !bookingId) {
        const booking = await addBooking({
          clientId,
          status: 'pending',
          date: new Date().toISOString().split('T')[0],
          paymentStatus: 'unpaid',
          source: 'walkin',
        });
        finalBookingId = booking.id;
      }

      // Create intake and back-link to booking
      const intake = await addIntake({
        clientId: clientId ?? '',
        bookingId: finalBookingId,
        data: merged,
        signature: (merged.signature as string) ?? '',
      });

      // Back-link intakeId to booking
      if (finalBookingId) {
        await updateBooking(finalBookingId, { intakeId: intake.id });
      }

      // Persist client preferences & visit history
      if (clientId) {
        await updatePreferences(clientId, extractPreferences(merged));
        if (finalBookingId) {
          await addVisit(clientId, finalBookingId);
        }
      }

      navigate('/kiosk/thanks', { replace: true });
    } else {
      setIntakeStep(intakeStep + 1);
    }
  };

  const handleBack = () => {
    if (intakeStep === 0) {
      navigate(-1);
    } else {
      setIntakeStep(intakeStep - 1);
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="pt-6 pb-4">
        <StepProgress steps={enabledSteps.map((s) => s.title)} current={intakeStep} />
      </div>

      <div className="px-6 pb-28">
        <h2 className="font-serif text-2xl font-bold text-brand-dark text-center mb-1">
          {currentStep.title}
        </h2>
        {currentStep.description && (
          <p className="text-brand-muted text-center mb-8">{currentStep.description}</p>
        )}

        <div className="max-w-sm mx-auto">
          <FormRenderer
            key={currentStep.id}
            step={currentStep}
            defaultValues={formData}
            onSubmit={handleStepSubmit}
            submitLabel={isLast ? t('common.submit') : t('common.continue')}
            onBack={handleBack}
          />
        </div>
      </div>
    </div>
  );
}
