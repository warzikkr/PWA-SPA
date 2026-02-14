import { useLayoutEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useLanguageStore } from '../../stores/languageStore';

export function KioskLayout() {
  const applyKioskLanguage = useLanguageStore((s) => s.applyKioskLanguage);

  /**
   * Restore kiosk language on every mount.
   * This ensures that when the user navigates back from admin/therapist
   * (which force English), the kiosk resumes in their selected language.
   *
   * useLayoutEffect runs before paint — no flicker.
   */
  useLayoutEffect(() => {
    applyKioskLanguage();
  }, [applyKioskLanguage]);

  return (
    <div className="kiosk-mode h-full bg-white flex flex-col">
      <div className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </div>
    </div>
  );
}
