import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useClientStore } from '../../../stores/clientStore';
import { useBookingStore } from '../../../stores/bookingStore';
import { useIntakeStore } from '../../../stores/intakeStore';
import { useConfigStore } from '../../../stores/configStore';
import { useAuthStore } from '../../../stores/authStore';
import { useTherapistNoteStore } from '../../../stores/therapistNoteStore';
import { useChangeRequestStore } from '../../../stores/changeRequestStore';
import { getTherapistBrief, hasMedicalRisks } from '../../../stores/selectors/therapistBrief';
import { Button, Input, Badge, Select, ReadonlyBodyMap, Modal } from '../../../shared/components';
import { uid } from '../../../services/storage';
import type { Client, Booking, Intake, TherapistNote } from '../../../types';

/* ── Tab type ── */
type Tab = 'overview' | 'sessions' | 'notes' | 'audit';

/* ── Session with resolved data for timeline ── */
interface ResolvedSession {
  booking: Booking;
  intake: Intake | undefined;
  notes: TherapistNote[];
}

export function ClientProfilePage() {
  const { t } = useTranslation();
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const parentRoute = location.pathname.startsWith('/reception') ? '/reception/clients' : '/admin/clients';

  const isAdmin = useAuthStore((s) => s.hasRole('admin'));
  const currentUser = useAuthStore((s) => s.currentUser);
  const { getById, updateClient, deleteClient, addAuditEntry, loadClients } = useClientStore();
  const { findByClientId } = useBookingStore();
  const { getByBookingId: getIntakeByBookingId } = useIntakeStore();
  const config = useConfigStore((s) => s.config);
  const { getByBookingIds, deleteNote: deleteTherapistNote } = useTherapistNoteStore();
  const { createRequest } = useChangeRequestStore();

  const [client, setClient] = useState<Client | null>(null);
  const [sessions, setSessions] = useState<ResolvedSession[]>([]);
  const [tab, setTab] = useState<Tab>('overview');
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', email: '', contactMethod: '', contactValue: '', tags: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteRequestSent, setDeleteRequestSent] = useState(false);

  /* ── Load client data ── */
  const loadData = useCallback(async () => {
    if (!clientId) return;
    await loadClients();
    const c = getById(clientId);
    if (!c) return;
    setClient(c);

    // Load sessions timeline
    const bookings = await findByClientId(clientId);
    const sorted = [...bookings].sort((a, b) => b.date.localeCompare(a.date));
    const bookingIds = sorted.map((b) => b.id);
    const noteMap = getByBookingIds(bookingIds);

    const resolved: ResolvedSession[] = [];
    for (const b of sorted) {
      const intake = await getIntakeByBookingId(b.id);
      resolved.push({ booking: b, intake, notes: noteMap[b.id] ?? [] });
    }
    setSessions(resolved);
  }, [clientId, loadClients, getById, findByClientId, getIntakeByBookingId, getByBookingIds]);

  useEffect(() => { loadData(); }, [loadData]);

  // Keep client in sync with store
  useEffect(() => {
    if (clientId) {
      const c = getById(clientId);
      if (c) setClient(c);
    }
  }, [clientId, getById]);

  if (!client) return <div className="p-8 text-brand-muted">{t('common.noData')}</div>;

  /* ── Helpers ── */
  const therapistLabel = (id?: string) => config.therapists.find((th) => th.id === id)?.label ?? '—';
  const roomLabel = (id?: string) => config.rooms.find((r) => r.id === id)?.label ?? '—';
  const statusLabel = (id: string) => config.statuses.find((s) => s.id === id)?.label ?? id;

  const lastVisit = sessions.length > 0 ? sessions[0].booking.date : null;
  const totalVisits = (client.visitHistory ?? []).length || sessions.length;

  /* ── Minor edit (immediate) ── */
  const openEditModal = () => {
    setEditForm({
      fullName: client.fullName,
      email: client.email,
      contactMethod: client.contactMethod,
      contactValue: client.contactValue,
      tags: client.tags.join(', '),
    });
    setEditModal(true);
  };

  const saveMinorEdit = async () => {
    if (!currentUser) return;
    const changes: Partial<Client> = {};
    const auditActions: string[] = [];

    if (editForm.fullName !== client.fullName) {
      changes.fullName = editForm.fullName;
      auditActions.push(`fullName: "${client.fullName}" → "${editForm.fullName}"`);
    }
    if (editForm.email !== client.email) {
      changes.email = editForm.email;
      auditActions.push(`email: "${client.email}" → "${editForm.email}"`);
    }
    if (editForm.contactMethod !== client.contactMethod) {
      changes.contactMethod = editForm.contactMethod;
      auditActions.push(`contactMethod: "${client.contactMethod}" → "${editForm.contactMethod}"`);
    }
    if (editForm.contactValue !== client.contactValue) {
      changes.contactValue = editForm.contactValue;
      auditActions.push(`contactValue: "${client.contactValue}" → "${editForm.contactValue}"`);
    }
    const newTags = editForm.tags.split(',').map((t) => t.trim()).filter(Boolean);
    if (JSON.stringify(newTags) !== JSON.stringify(client.tags)) {
      changes.tags = newTags;
      auditActions.push(`tags updated`);
    }

    if (Object.keys(changes).length > 0) {
      await updateClient(client.id, changes);
      for (const action of auditActions) {
        await addAuditEntry(client.id, {
          id: uid(),
          action: `Minor edit: ${action}`,
          performedBy: currentUser.fullName,
          performedByUserId: currentUser.id,
          role: currentUser.role,
          timestamp: new Date().toISOString(),
        });
      }
      await loadData();
    }
    setEditModal(false);
  };

  /* ── Delete (admin direct, reception via request) ── */
  const handleDelete = async () => {
    if (!currentUser) return;
    await addAuditEntry(client.id, {
      id: uid(),
      action: 'Client deleted',
      performedBy: currentUser.fullName,
      performedByUserId: currentUser.id,
      role: currentUser.role,
      timestamp: new Date().toISOString(),
    });
    await deleteClient(client.id);
    navigate(parentRoute);
  };

  const handleRequestDeletion = async () => {
    if (!currentUser) return;
    await createRequest({
      clientId: client.id,
      clientName: client.fullName,
      requestedByUserId: currentUser.id,
      requestedByName: currentUser.fullName,
      type: 'delete',
      description: `Delete client "${client.fullName}"`,
      payload: {},
    });
    setDeleteRequestSent(true);
  };

  /* ── Delete note (admin only) ── */
  const handleDeleteNote = async (noteId: string) => {
    if (!currentUser) return;
    await deleteTherapistNote(noteId);
    await addAuditEntry(client.id, {
      id: uid(),
      action: `Therapist note deleted (id: ${noteId})`,
      performedBy: currentUser.fullName,
      performedByUserId: currentUser.id,
      role: currentUser.role,
      timestamp: new Date().toISOString(),
    });
    await loadData();
  };

  /* ── All notes across sessions ── */
  const allNotes = sessions.flatMap((s) =>
    s.notes.map((n) => ({ ...n, bookingDate: s.booking.date }))
  ).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  /* ── Audit log ── */
  const auditLog = [...(client.auditLog ?? [])].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  /* ── Tabs config ── */
  const tabs: { id: Tab; label: string; adminOnly?: boolean }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'sessions', label: 'Sessions' },
    { id: 'notes', label: `Notes (${allNotes.length})` },
    { id: 'audit', label: 'Audit', adminOnly: true },
  ];

  return (
    <div>
      {/* Back */}
      <button onClick={() => navigate(parentRoute)} className="text-brand-muted mb-4 text-sm">&larr; {t('common.back')}</button>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl font-bold text-brand-dark">{client.fullName}</h2>
          <div className="flex items-center gap-2 mt-1">
            {client.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
            <span className="text-xs text-brand-muted ml-2">
              Since {new Date(client.createdAt).toLocaleDateString()}
            </span>
            {lastVisit && (
              <span className="text-xs text-brand-muted">· Last visit: {lastVisit}</span>
            )}
            <span className="text-xs text-brand-muted">· {totalVisits} visits</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={openEditModal}>Edit</Button>
          {isAdmin ? (
            <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(true)}>Delete</Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRequestDeletion}
              disabled={deleteRequestSent}
            >
              {deleteRequestSent ? 'Request Sent' : 'Request Deletion'}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 max-w-md">
        {tabs.filter((t) => !t.adminOnly || isAdmin).map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              tab === tb.id ? 'bg-white text-brand-dark shadow-sm' : 'text-brand-muted'
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {/* ─── OVERVIEW TAB ─── */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Info */}
          <div className="bg-white rounded-xl border border-brand-border p-4">
            <h3 className="font-semibold text-brand-dark mb-3">Contact Information</h3>
            <div className="space-y-2 text-sm">
              <div><span className="text-brand-muted">Email:</span> {client.email}</div>
              <div><span className="text-brand-muted">Contact:</span> {client.contactMethod}: {client.contactValue}</div>
              <div><span className="text-brand-muted">Source:</span> {client.marketingSource}</div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-xl border border-brand-border p-4">
            <h3 className="font-semibold text-brand-dark mb-3">Preferences</h3>
            {client.preferences ? (
              <div className="space-y-2 text-sm">
                {client.preferences.pressure && (
                  <div><span className="text-brand-muted">Pressure:</span> {client.preferences.pressure}</div>
                )}
                {client.preferences.oilPreference && (
                  <div><span className="text-brand-muted">Oil:</span> {client.preferences.oilPreference}</div>
                )}
                {client.preferences.allergies && client.preferences.allergies.length > 0 && (
                  <div><span className="text-brand-muted">Allergies:</span> {client.preferences.allergies.join(', ')}</div>
                )}
                {client.preferences.smellSensitivity && (
                  <div className="text-red-600">Smell sensitive</div>
                )}
                {client.preferences.atmosphere && Object.keys(client.preferences.atmosphere).length > 0 && (
                  <div>
                    <span className="text-brand-muted">Atmosphere:</span>{' '}
                    {Object.entries(client.preferences.atmosphere).map(([k, v]) => `${k}: ${v}`).join(', ')}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-brand-muted text-sm">No preferences saved yet</p>
            )}
          </div>

          {/* Body Map Preview */}
          {client.preferences && (
            (client.preferences.focusZones?.length || client.preferences.avoidZones?.length) ? (
              <div className="bg-white rounded-xl border border-brand-border p-4 lg:col-span-2">
                <h3 className="font-semibold text-brand-dark mb-3">Body Zones</h3>
                <ReadonlyBodyMap
                  focusZones={client.preferences.focusZones ?? []}
                  avoidZones={client.preferences.avoidZones ?? []}
                  compact
                />
              </div>
            ) : null
          )}
        </div>
      )}

      {/* ─── SESSIONS TAB ─── */}
      {tab === 'sessions' && (
        <div className="space-y-4">
          {sessions.length === 0 && (
            <p className="text-brand-muted text-center py-8">{t('common.noData')}</p>
          )}
          {sessions.map(({ booking, intake, notes }) => {
            const brief = intake ? getTherapistBrief(intake) : null;
            const risks = brief ? hasMedicalRisks(brief) : false;

            return (
              <div
                key={booking.id}
                className={`bg-white rounded-xl border p-4 ${
                  risks ? 'border-red-200' : 'border-brand-border'
                }`}
              >
                {/* Session header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-brand-dark">{booking.date}</span>
                    <span className="text-sm text-brand-muted">{booking.startTime ?? ''}</span>
                    <Badge variant={booking.status === 'done' ? 'success' : 'default'}>
                      {statusLabel(booking.status)}
                    </Badge>
                    {booking.source === 'walkin' && <Badge variant="info">Walk-in</Badge>}
                    {booking.paymentStatus === 'paid' && <Badge variant="success">Paid</Badge>}
                  </div>
                  <div className="text-sm text-brand-muted">
                    {therapistLabel(booking.therapistId)} · {roomLabel(booking.roomId)}
                  </div>
                </div>

                {brief && (
                  <>
                    {/* Key metrics */}
                    <div className="grid grid-cols-4 gap-3 mb-3">
                      <div className="text-center">
                        <div className="text-xs text-brand-muted uppercase">Duration</div>
                        <div className="font-bold text-brand-dark">{brief.duration || '—'} min</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-brand-muted uppercase">Pressure</div>
                        <div className="font-bold text-brand-dark capitalize">{brief.pressure || '—'}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-brand-muted uppercase">Goal</div>
                        <div className="text-sm font-medium text-brand-dark">{brief.goal.join(', ') || '—'}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-brand-muted uppercase">Oil</div>
                        <div className="text-sm font-medium text-brand-dark">{brief.oilPreference || '—'}</div>
                      </div>
                    </div>

                    {/* Body map */}
                    {(brief.focusZones.length > 0 || brief.avoidZones.length > 0) && (
                      <div className="mb-3">
                        <ReadonlyBodyMap focusZones={brief.focusZones} avoidZones={brief.avoidZones} compact />
                      </div>
                    )}

                    {/* Medical flags */}
                    {risks && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {brief.pregnancy !== 'no' && brief.pregnancy !== '' && <Badge variant="danger">Pregnant ({brief.pregnancy})</Badge>}
                        {brief.bloodPressure && <Badge variant="danger">High BP</Badge>}
                        {brief.fever && <Badge variant="danger">Fever</Badge>}
                        {brief.varicoseVeins && <Badge variant="danger">Varicose Veins</Badge>}
                        {brief.allergies.map((a) => <Badge key={a} variant="danger">{a}</Badge>)}
                      </div>
                    )}
                  </>
                )}

                {/* Therapist notes for this session */}
                {notes.length > 0 && (
                  <div className="border-t border-brand-border pt-3 mt-3 space-y-2">
                    <div className="text-xs font-semibold text-brand-muted uppercase">Therapist Notes</div>
                    {notes.map((n) => (
                      <div key={n.id} className="text-sm bg-gray-50 rounded-lg p-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-brand-dark">
                            {n.therapistName ?? therapistLabel(n.therapistId)}
                          </span>
                          <span className="text-xs text-brand-muted">
                            {new Date(n.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-brand-dark">{n.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── NOTES TAB ─── */}
      {tab === 'notes' && (
        <div className="space-y-3">
          {allNotes.length === 0 && (
            <p className="text-brand-muted text-center py-8">No therapist notes yet</p>
          )}
          {allNotes.map((n) => (
            <div key={n.id} className="bg-white rounded-xl border border-brand-border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-brand-dark">
                    {n.therapistName ?? therapistLabel(n.therapistId)}
                  </span>
                  <span className="text-xs text-brand-muted">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                  <Badge>{n.bookingDate}</Badge>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleDeleteNote(n.id)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="text-sm text-brand-dark">{n.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* ─── AUDIT TAB (admin only) ─── */}
      {tab === 'audit' && isAdmin && (
        <div className="space-y-2">
          {auditLog.length === 0 && (
            <p className="text-brand-muted text-center py-8">No audit entries yet</p>
          )}
          {auditLog.map((entry) => (
            <div key={entry.id} className="bg-white rounded-xl border border-brand-border p-3 flex items-center justify-between">
              <div>
                <p className="text-sm text-brand-dark">{entry.action}</p>
                <p className="text-xs text-brand-muted">
                  by {entry.performedBy} ({entry.role})
                </p>
              </div>
              <span className="text-xs text-brand-muted shrink-0">
                {new Date(entry.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ─── Edit Modal ─── */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit Client">
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={editForm.fullName}
            onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
          />
          <Input
            label="Email"
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
          />
          <Select
            label="Contact Method"
            options={config.contactMethods.filter((c) => c.enabled).map((c) => ({ value: c.id, label: c.label }))}
            value={editForm.contactMethod}
            onChange={(e) => setEditForm({ ...editForm, contactMethod: e.target.value })}
          />
          <Input
            label="Contact Value"
            value={editForm.contactValue}
            onChange={(e) => setEditForm({ ...editForm, contactValue: e.target.value })}
          />
          <Input
            label="Tags (comma separated)"
            value={editForm.tags}
            onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
          />
          <Button fullWidth onClick={saveMinorEdit}>Save Changes</Button>
        </div>
      </Modal>

      {/* ─── Delete Confirmation Modal (admin) ─── */}
      <Modal open={deleteConfirm} onClose={() => setDeleteConfirm(false)} title="Delete Client">
        <div className="space-y-4">
          <p className="text-sm text-brand-dark">
            Are you sure you want to permanently delete <strong>{client.fullName}</strong>?
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button fullWidth variant="outline" onClick={() => setDeleteConfirm(false)}>Cancel</Button>
            <Button fullWidth variant="ghost" onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
