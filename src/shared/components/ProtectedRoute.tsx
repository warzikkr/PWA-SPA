import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import type { UserRole } from '../../types';

interface Props {
  allowedRoles: UserRole[];
}

/**
 * Route guard — renders child routes only when the current user
 * is authenticated and has one of the allowed roles.
 * Otherwise redirects to /login.
 */
export function ProtectedRoute({ allowedRoles }: Props) {
  const currentUser = useAuthStore((s) => s.currentUser);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
