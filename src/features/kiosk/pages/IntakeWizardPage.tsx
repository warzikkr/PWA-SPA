import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useKioskStore } from '../../../stores/kioskStore';
import { useConfigStore } from '../../../stores/configStore';
import { StepProgress } from '../../../shared/components';
import { FormRenderer } from '../../../engine/FormRenderer';
import { useKioskInactivity } from '../hooks/useKioskInactivity';
import { submitKioskIntake } from '../../../services/kioskSubmissionService';

export function IntakeWizardPage() {
  useKioskInactivity();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { intakeStep, setIntakeStep, formData, updateFormData, clientId, bookingId, isWalkin } =
    useKioskStore();
  const intakeSchema = useConfigStore((s) => s.config.intakeSchema);

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
      try {
        await submitKioskIntake({
          clientId: clientId ?? '',
          bookingId,
          isWalkin,
          formData: merged,
        });
      } catch (err) {
        // Log error but still navigate — data is persisted in service layer
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
