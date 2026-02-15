import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '../../../stores/userStore';
import { useConfigStore } from '../../../stores/configStore';
import { Button, Input, Select, Toggle } from '../../../shared/components';
import { Modal } from '../../../shared/components/Modal';
import { supabase } from '../../../lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';
import type { UserRole } from '../../../types';

const roles: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'reception', label: 'Reception' },
  { value: 'therapist', label: 'Therapist' },
];

const emptyForm = {
  fullName: '',
  email: '',
  password: '',
  role: 'reception' as UserRole,
  therapistId: '',
};

/**
 * Create a throwaway Supabase client that does NOT persist sessions.
 * Used so that signUp() doesn't clobber the admin's active session.
 */
function tempSupabaseClient() {
  return createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } },
  );
}

export function UserManagementPage() {
  const { t } = useTranslation();
  const { users, loadUsers, createUser, toggleEnabled } = useUserStore();
  const therapists = useConfigStore((s) => s.config.therapists);

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleCreate = async () => {
    setError('');
    if (!form.fullName.trim() || !form.email.trim() || !form.password.trim()) {
      setError('All fields are required');
      return;
    }

    setCreating(true);
    try {
      // 1. Create Supabase auth user via a non-persistent client
      const tmp = tempSupabaseClient();
      const { data: authData, error: authErr } = await tmp.auth.signUp({
        email: form.email.trim(),
        password: form.password.trim(),
      });
      if (authErr) throw new Error(authErr.message);
      if (!authData.user) throw new Error('Auth user not created');

      // 2. Insert app user row linked to auth uid
      //    We use the main (admin-session) supabase client so RLS allows the insert
      const username = form.email.trim().split('@')[0];
      await createUser({
        fullName: form.fullName.trim(),
        username,
        role: form.role,
        therapistId: form.role === 'therapist' ? form.therapistId || undefined : undefined,
        enabled: true,
        authUid: authData.user.id,
      } as never); // authUid is passed through to userService.create

      setForm(emptyForm);
      setShowCreate(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const handleResetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      alert('Password reset email sent');
    }
  };

  const therapistLabel = (id?: string) =>
    therapists.find((th) => th.id === id)?.label ?? '—';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-bold text-brand-dark">User Management</h2>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          + Create User
        </Button>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-xl border border-brand-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-brand-muted">Name</th>
                <th className="text-left px-4 py-3 font-medium text-brand-muted">Username</th>
                <th className="text-left px-4 py-3 font-medium text-brand-muted">Role</th>
                <th className="text-left px-4 py-3 font-medium text-brand-muted">Linked Therapist</th>
                <th className="text-left px-4 py-3 font-medium text-brand-muted">Enabled</th>
                <th className="text-left px-4 py-3 font-medium text-brand-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {users.map((u) => (
                <tr key={u.id} className={`hover:bg-gray-50 ${!u.enabled ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3 font-medium text-brand-dark">{u.fullName}</td>
                  <td className="px-4 py-3 text-brand-muted">{u.username}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium uppercase bg-gray-100 px-2 py-1 rounded">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-brand-muted">
                    {u.role === 'therapist' ? therapistLabel(u.therapistId) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Toggle
                      label=""
                      checked={u.enabled}
                      onChange={() => toggleEnabled(u.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleResetPassword(`${u.username}@spa.local`)}
                      className="text-xs text-brand-green hover:underline"
                    >
                      Reset Password
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-brand-muted">
                    {t('common.noData')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create User">
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            placeholder="user@spa.local"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Select
            label="Role"
            options={roles.map((r) => ({ value: r.value, label: r.label }))}
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
          />
          {form.role === 'therapist' && (
            <Select
              label="Link to Therapist"
              options={therapists.filter((th) => th.enabled).map((th) => ({ value: th.id, label: th.label }))}
              value={form.therapistId}
              onChange={(e) => setForm({ ...form, therapistId: e.target.value })}
              placeholder="Select therapist..."
            />
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button fullWidth onClick={handleCreate} disabled={creating}>
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
