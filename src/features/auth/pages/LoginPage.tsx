import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { Button, Input } from '../../../shared/components';
import type { UserRole } from '../../../types';

const roleRedirects: Record<UserRole, string> = {
  admin: '/admin',
  reception: '/reception',
  therapist: '/therapist',
};

export function LoginPage() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const loading = useAuthStore((s) => s.loading);
  const login = useAuthStore((s) => s.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center bg-brand-light">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (currentUser) {
    return <Navigate to={roleRedirects[currentUser.role]} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const email = username.trim().includes('@')
        ? username.trim()
        : `${username.trim()}@spadev.app`;
      const result = await login(email, password);
      if (result.success) {
        const user = useAuthStore.getState().currentUser!;
        navigate(roleRedirects[user.role], { replace: true });
      } else {
        setError(result.error ?? 'Invalid credentials');
      }
    } catch (err) {
      console.error('[Login] Error:', err);
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center bg-brand-light px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl border border-brand-border p-8 shadow-sm">
          <h1 className="font-serif text-2xl font-bold text-brand-dark text-center mb-2">
            Spa Management
          </h1>
          <p className="text-brand-muted text-center text-sm mb-8">Sign in to continue</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Username"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            <Button fullWidth type="submit" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-brand-border">
            <Link
              to="/kiosk"
              className="block text-center text-xs text-brand-muted hover:text-brand-dark"
            >
              Open Kiosk Mode &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
