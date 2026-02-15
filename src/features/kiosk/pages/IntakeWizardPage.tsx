/**
 * IntakeWizardPage — 4-step intake wizard using custom step components.
 *
 * Steps:
 *   1. Session Preferences (duration, goal, pressure, deep tissue)
 *   2. Focus & Avoid (body maps)
 *   3. Health & Sensitivity (medical + allergies + oil + smell)
 *   4. Atmosphere (music, volume, light) — final submit
 *
 * Data keys remain backward-compatible with existing intake model.
 */
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useKioskStore } from '../../../stores/kioskStore';
import { StepProgress } from '../../../shared/components';
import { useKioskInactivity } from '../hooks/useKioskInactivity';
import { submitKioskIntake } from '../../../services/kioskSubmissionService';
import {
  SessionPrefsStep,
  BodyMapStep,
  HealthStep,
  AtmosphereStep,
} from '../steps';

const STEPS = [
  { id: 'session_prefs', title: 'Session Preferences' },
  { id: 'body_map', title: 'Focus & Avoid' },
  { id: 'health', title: 'Health & Sensitivity' },
  { id: 'atmosphere', title: 'Atmosphere' },
] as const;

export function IntakeWizardPage() {
  useKioskInactivity();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { intakeStep, setIntakeStep, formData, updateFormData, clientId, bookingId, isWalkin } =
    useKioskStore();

  const currentStep = STEPS[intakeStep];
  const isLast = intakeStep === STEPS.length - 1;

  if (!currentStep) {
    navigate('/kiosk/thanks', { replace: true });
    return null;
  }

  const handleStepSubmit = async (data: Record<string, unknown>) => {
    const merged = { ...formData, ...data };
    updateFormData(data);

    if (isLast) {
      try {
        await submitKioskIntake({
          clientId: clientId ?? '',
          bookingId,
          isWalkin,
          formData: merged,
        });
      } catch (err) {
        console.error('[Kiosk] Submission error:', err);
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

  const renderStep = () => {
    const props = { defaultValues: formData, onSubmit: handleStepSubmit, onBack: handleBack };

    switch (currentStep.id) {
      case 'session_prefs':
        return <SessionPrefsStep {...props} />;
      case 'body_map':
        return <BodyMapStep {...props} />;
      case 'health':
        return <HealthStep {...props} />;
      case 'atmosphere':
        return <AtmosphereStep {...props} submitLabel={t('common.submit')} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="pt-6 pb-4 px-6">
        <StepProgress steps={STEPS.map((s) => s.title)} current={intakeStep} />
      </div>

      <div className="px-6 pb-28">
        <h2 className="font-serif text-2xl font-bold text-brand-dark text-center mb-6">
          {currentStep.title}
        </h2>

        <div className="max-w-md mx-auto">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
