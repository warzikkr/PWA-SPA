import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import type { UserRole } from '../../types';

interface Props {
  allowedRoles: UserRole[];
}

function AuthSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
    </div>
  );
}

/**
 * Route guard — renders child routes only when the current user
 * is authenticated and has one of the allowed roles.
 * Shows spinner while session is being restored.
 */
export function ProtectedRoute({ allowedRoles }: Props) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const loading = useAuthStore((s) => s.loading);

  if (loading) return <AuthSpinner />;

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
