import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '../../../stores/userStore';
import { useConfigStore } from '../../../stores/configStore';
import { Button, Input, Select, Toggle } from '../../../shared/components';
import { Modal } from '../../../shared/components/Modal';
import type { User, UserRole } from '../../../types';

const roles: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'reception', label: 'Reception' },
  { value: 'therapist', label: 'Therapist' },
];

const emptyForm = {
  fullName: '',
  username: '',
  password: '',
  role: 'reception' as UserRole,
  therapistId: '',
};

export function UserManagementPage() {
  const { t } = useTranslation();
  const { users, loadUsers, createUser, updateUser, toggleEnabled } = useUserStore();
  const therapists = useConfigStore((s) => s.config.therapists);

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleCreate = async () => {
    setError('');
    if (!form.fullName.trim() || !form.username.trim() || !form.password.trim()) {
      setError('All fields are required');
      return;
    }
    // Check duplicate username
    if (users.some((u) => u.username === form.username.trim())) {
      setError('Username already exists');
      return;
    }
    await createUser({
      fullName: form.fullName.trim(),
      username: form.username.trim(),
      password: form.password.trim(),
      role: form.role,
      therapistId: form.role === 'therapist' ? form.therapistId || undefined : undefined,
      enabled: true,
    });
    setForm(emptyForm);
    setShowCreate(false);
  };

  const handlePasswordUpdate = async () => {
    if (!editUser || !newPassword.trim()) return;
    await updateUser(editUser.id, { password: newPassword.trim() });
    setEditUser(null);
    setNewPassword('');
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
                      onClick={() => { setEditUser(u); setNewPassword(''); }}
                      className="text-xs text-brand-green hover:underline"
                    >
                      Change Password
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
            label="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
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
          <Button fullWidth onClick={handleCreate}>Create</Button>
        </div>
      </Modal>

      {/* Change Password modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title={`Change Password — ${editUser?.fullName}`}>
        <div className="space-y-4">
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Button fullWidth onClick={handlePasswordUpdate}>Update Password</Button>
        </div>
      </Modal>
    </div>
  );
}
