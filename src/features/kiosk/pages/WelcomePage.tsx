import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useKioskStore } from '../../../stores/kioskStore';
import { useLanguageStore } from '../../../stores/languageStore';
import { useConfigStore } from '../../../stores/configStore';
import { Button } from '../../../shared/components';

export function WelcomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setIsWalkin, setLanguage: setKioskLang, language, reset } = useKioskStore();
  const { setKioskLanguage } = useLanguageStore();
  const languages = useConfigStore((s) => s.config.languages).filter((l) => l.enabled);

  /**
   * Updates both kiosk in-memory state and the persisted kiosk language store.
   * setKioskLanguage also calls i18n.changeLanguage so UI updates immediately.
   */
  const handleLanguageChange = (lang: string) => {
    setKioskLang(lang);
    setKioskLanguage(lang);
  };

  const handleBooking = () => {
    reset();
    setIsWalkin(false);
    navigate('/kiosk/find');
  };

  const handleWalkin = () => {
    reset();
    setIsWalkin(true);
    navigate('/kiosk/contacts');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-12 text-center">
      {/* Language selector */}
      <div className="flex gap-2 mb-12">
        {languages.map((lang) => (
          <button
            key={lang.id}
            onClick={() => handleLanguageChange(lang.id)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${language === lang.id
                ? 'bg-brand-dark text-white'
                : 'bg-gray-100 text-brand-dark hover:bg-gray-200'
              }
            `}
          >
            {lang.label}
          </button>
        ))}
      </div>

      <h1 className="font-serif text-4xl font-bold text-brand-dark mb-3">
        {t('kiosk.welcome')}
      </h1>
      <p className="text-brand-muted text-lg mb-16 max-w-sm">
        {t('kiosk.welcomeSubtitle')}
      </p>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        <Button size="lg" fullWidth onClick={handleBooking}>
          {t('kiosk.haveBooking')}
        </Button>
        <Button size="lg" variant="outline" fullWidth onClick={handleWalkin}>
          {t('kiosk.walkIn')}
        </Button>
      </div>
    </div>
  );
}
