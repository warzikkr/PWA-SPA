import { useTranslation } from 'react-i18next';

interface IntakeChoiceProps {
  onFillNow: () => void;
  onSkip: () => void;
}

export function IntakeChoice({ onFillNow, onSkip }: IntakeChoiceProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center text-center gap-6 py-4">
      <h3 className="font-serif text-xl font-bold text-brand-dark">
        {t('booking.intakeQuestion', 'Would you like to fill your massage preferences now?')}
      </h3>
      <p className="text-brand-muted text-sm max-w-xs">
        {t('booking.intakeQuestionHint', 'This helps us prepare your session. You can also fill it at the salon.')}
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={onFillNow}
          className="w-full min-h-[56px] rounded-xl bg-brand-green text-white font-medium text-base active:scale-[0.98] transition-transform"
        >
          {t('booking.fillNow', 'Yes, fill now')}
        </button>
        <button
          onClick={onSkip}
          className="w-full min-h-[56px] rounded-xl border-2 border-brand-border text-brand-dark font-medium text-base hover:bg-gray-50 active:scale-[0.98] transition-all"
        >
          {t('booking.fillAtSalon', 'I will fill at the salon')}
        </button>
      </div>
    </div>
  );
}
