import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useChangeRequestStore } from '../../../stores/changeRequestStore';
import { useClientStore } from '../../../stores/clientStore';
import { useAuthStore } from '../../../stores/authStore';
import { Button, Badge } from '../../../shared/components';

export function ChangeRequestsPage() {
  const { t } = useTranslation();
  const currentUser = useAuthStore((s) => s.currentUser);
  const { requests, loadRequests, approveRequest, rejectRequest } = useChangeRequestStore();
  const { loadClients } = useClientStore();

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const pending = requests.filter((r) => r.status === 'pending');
  const reviewed = requests
    .filter((r) => r.status !== 'pending')
    .sort((a, b) => (b.reviewedAt ?? b.createdAt).localeCompare(a.reviewedAt ?? a.createdAt))
    .slice(0, 20);

  const handleApprove = async (id: string) => {
    if (!currentUser) return;
    await approveRequest(id, currentUser);
    await loadClients(); // refresh after potential deletion
  };

  const handleReject = async (id: string) => {
    if (!currentUser) return;
    await rejectRequest(id, currentUser);
  };

  const statusVariant: Record<string, 'default' | 'success' | 'danger' | 'warning'> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
  };

  return (
    <div>
      <h2 className="font-serif text-2xl font-bold text-brand-dark mb-6">Change Requests</h2>

      {/* Pending */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-brand-muted uppercase tracking-wider mb-3">
          Pending ({pending.length})
        </h3>
        {pending.length === 0 && (
          <p className="text-brand-muted text-center py-6">No pending requests</p>
        )}
        <div className="space-y-3">
          {pending.map((req) => (
            <div key={req.id} className="bg-white rounded-xl border border-yellow-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="warning">{req.type}</Badge>
                  <span className="font-medium text-brand-dark">{req.clientName}</span>
                </div>
                <span className="text-xs text-brand-muted">
                  {new Date(req.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-brand-dark mb-2">{req.description}</p>
              <p className="text-xs text-brand-muted mb-3">
                Requested by: {req.requestedByName}
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleApprove(req.id)}>Approve</Button>
                <Button size="sm" variant="outline" onClick={() => handleReject(req.id)}>Reject</Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recently reviewed */}
      {reviewed.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-brand-muted uppercase tracking-wider mb-3">
            Recently Reviewed
          </h3>
          <div className="space-y-2">
            {reviewed.map((req) => (
              <div key={req.id} className="bg-white rounded-xl border border-brand-border p-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={statusVariant[req.status] ?? 'default'}>{req.status}</Badge>
                    <span className="text-sm font-medium text-brand-dark">{req.clientName}</span>
                    <Badge>{req.type}</Badge>
                  </div>
                  <p className="text-xs text-brand-muted">
                    {req.description} — by {req.requestedByName}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-brand-muted">
                    {req.reviewedByName && `Reviewed by ${req.reviewedByName}`}
                  </div>
                  <div className="text-xs text-brand-muted">
                    {req.reviewedAt && new Date(req.reviewedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
