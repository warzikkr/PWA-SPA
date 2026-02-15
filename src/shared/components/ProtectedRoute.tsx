import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import type { UserRole } from '../../types';

interface Props {
  allowedRoles: UserRole[];
}

/**
 * Route guard — renders child routes only when the current user
 * is authenticated via Supabase and has one of the allowed roles.
 * Shows nothing while session is being restored. Redirects to /login otherwise.
 */
export function ProtectedRoute({ allowedRoles }: Props) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const loading = useAuthStore((s) => s.loading);

  // Still restoring Supabase session — render nothing (or a spinner)
  if (loading) return null;

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
