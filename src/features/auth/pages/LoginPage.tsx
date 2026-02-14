import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { login, currentUser } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Already authenticated — redirect
  if (currentUser) {
    navigate(roleRedirects[currentUser.role], { replace: true });
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(username.trim(), password);
    if (success) {
      const user = useAuthStore.getState().currentUser!;
      navigate(roleRedirects[user.role], { replace: true });
    } else {
      setError('Invalid username or password');
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

            <Button fullWidth type="submit">
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-brand-border">
            <a
              href="/kiosk"
              className="block text-center text-xs text-brand-muted hover:text-brand-dark"
            >
              Open Kiosk Mode &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
