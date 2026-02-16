import { useLayoutEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { useChangeRequestStore } from '../../stores/changeRequestStore';
import { forceEnglish } from '../../stores/languageStore';

export function AdminLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);
  const pendingCount = useChangeRequestStore((s) => s.pendingCount());

  useLayoutEffect(() => {
    forceEnglish();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { to: '/admin', label: t('menu.dashboard'), end: true },
    { to: '/admin/calendar', label: 'Calendar' },
    { to: '/admin/clients', label: t('menu.clients') },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/change-requests', label: `Requests${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
    { to: '/admin/config', label: t('menu.settings') },
  ];

  return (
    <div className="h-full flex bg-brand-light">
      {/* Sidebar */}
      <nav className="w-56 bg-white border-r border-brand-border flex flex-col shrink-0">
        <div className="p-4 border-b border-brand-border">
          <h1 className="font-serif text-xl font-bold text-brand-dark">Spa Admin</h1>
        </div>
        <div className="flex-1 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-brand-green bg-green-50 border-r-2 border-brand-green'
                    : 'text-brand-dark hover:bg-gray-50'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
        <div className="p-4 border-t border-brand-border space-y-2">
          <NavLink to="/kiosk" className="block text-xs text-brand-muted hover:text-brand-dark">
            {t('menu.openKiosk')} &rarr;
          </NavLink>
          <button
            onClick={handleLogout}
            className="block text-xs text-red-500 hover:text-red-700"
          >
            {currentUser?.fullName} — Logout
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
