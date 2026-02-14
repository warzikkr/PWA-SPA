import { useLayoutEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { forceEnglish } from '../../stores/languageStore';

export function TherapistLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);

  // MIGRATION: read name from currentUser instead of config lookup
  const name = currentUser?.fullName ?? 'Therapist';

  useLayoutEffect(() => {
    forceEnglish();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <header className="flex items-center justify-between px-4 py-3 border-b border-brand-border bg-white shrink-0">
        <h1 className="font-serif text-lg font-bold text-brand-dark">{name}</h1>
        <nav className="flex items-center gap-4">
          <NavLink
            to="/therapist"
            end
            className={({ isActive }) =>
              `text-sm font-medium ${isActive ? 'text-brand-green' : 'text-brand-muted'}`
            }
          >
            {t('therapist.myToday')}
          </NavLink>
          <button
            onClick={handleLogout}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Logout
          </button>
        </nav>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}
