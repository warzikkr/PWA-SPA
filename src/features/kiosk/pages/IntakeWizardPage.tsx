/**
 * IntakeWizardPage — 4-step intake wizard using custom step components.
 *
 * Steps:
 *   1. Session Preferences (duration, goal, pressure, deep tissue)
 *   2. Focus & Avoid (body maps)
 *   3. Health & Sensitivity (medical + allergies + oil + smell)
 *   4. Atmosphere (music, volume, light) — final submit
 */
import { useState } from 'react';
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
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
      setSubmitting(true);
      setSubmitError(null);
      try {
        await submitKioskIntake({
          clientId: clientId ?? '',
          bookingId,
          isWalkin,
          formData: merged,
        });
        navigate('/kiosk/thanks', { replace: true });
      } catch (err) {
        console.error('[Kiosk] Submission error:', err);
        setSubmitError(
          err instanceof Error ? err.message : 'Submission failed. Please try again.',
        );
      } finally {
        setSubmitting(false);
      }
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

        {submitError && (
          <div className="max-w-md mx-auto mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700 font-medium mb-2">Submission failed</p>
            <p className="text-xs text-red-600">{submitError}</p>
            <button
              onClick={() => setSubmitError(null)}
              className="mt-2 text-xs text-red-700 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {submitting && (
          <div className="max-w-md mx-auto mb-4 flex items-center justify-center gap-3 p-4">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
            <span className="text-sm text-brand-muted">Submitting...</span>
          </div>
        )}

        <div className="max-w-md mx-auto">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
