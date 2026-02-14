import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useKioskStore } from '../../../stores/kioskStore';

const RESET_SECONDS = 15;

export function ThankYouPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const reset = useKioskStore((s) => s.reset);
  const [countdown, setCountdown] = useState(RESET_SECONDS);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          reset();
          navigate('/kiosk', { replace: true });
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate, reset]);

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 text-center">
      <div className="text-6xl mb-6">✓</div>
      <h2 className="font-serif text-3xl font-bold text-brand-dark mb-4">
        {t('kiosk.thankYou')}
      </h2>
      <p className="text-brand-muted text-lg mb-2">
        {t('kiosk.thankYouSubtitle')}
      </p>
      <p className="text-sm text-brand-muted mt-12">
        {countdown}s
      </p>
    </div>
  );
}
