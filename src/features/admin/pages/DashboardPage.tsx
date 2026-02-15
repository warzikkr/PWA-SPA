import { useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBookingStore } from '../../../stores/bookingStore';
import { useConfigStore } from '../../../stores/configStore';
import { useClientStore } from '../../../stores/clientStore';
import { useIntakeStore } from '../../../stores/intakeStore';
import { Badge } from '../../../shared/components';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending: 'warning',
  assigned: 'info',
  in_progress: 'success',
  done: 'default',
};

const POLL_INTERVAL = 15_000; // refresh every 15s

export function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { bookings, loadBookings } = useBookingStore();
  const config = useConfigStore((s) => s.config);
  const { clients: storeClients, loadClients } = useClientStore();
  const { intakes, loadIntakes } = useIntakeStore();

  // Derive client map reactively from store (no local useState copy)
  const clientMap = useMemo(() => {
    const map: Record<string, (typeof storeClients)[number]> = {};
    storeClients.forEach((c) => (map[c.id] = c));
    return map;
  }, [storeClients]);

  // Set of bookingIds that have intake data (for badge display)
  const intakeBookingIds = useMemo(
    () => new Set(intakes.map((i) => i.bookingId)),
    [intakes],
  );

  const refresh = useCallback(() => {
    loadBookings();
    loadClients();
    loadIntakes();
  }, [loadBookings, loadClients, loadIntakes]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [refresh]);

  // Filter today's bookings
  const today = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter((b) => b.date === today);

  const sortedBookings = [...todayBookings].sort((a, b) => {
    if (!a.startTime) return 1;
    if (!b.startTime) return -1;
    return a.startTime.localeCompare(b.startTime);
  });

  const statusLabel = (id: string) =>
    config.statuses.find((s) => s.id === id)?.label ?? id;

  const therapistLabel = (id?: string) =>
    config.therapists.find((th) => th.id === id)?.label ?? '—';

  const roomLabel = (id?: string) =>
    config.rooms.find((r) => r.id === id)?.label ?? '—';

  return (
    <div>
      <h2 className="font-serif text-2xl font-bold text-brand-dark mb-6">{t('admin.today')}</h2>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {['pending', 'assigned', 'in_progress', 'done'].map((status) => {
          const count = todayBookings.filter((b) => b.status === status).length;
          return (
            <div key={status} className="bg-white rounded-xl border border-brand-border p-4">
              <div className="text-2xl font-bold text-brand-dark">{count}</div>
              <div className="text-sm text-brand-muted">{statusLabel(status)}</div>
            </div>
          );
        })}
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-brand-border">
        <div className="px-4 py-3 border-b border-brand-border">
          <h3 className="font-semibold text-brand-dark">{t('admin.bookings')}</h3>
        </div>
        <div className="divide-y divide-brand-border">
          {sortedBookings.length === 0 && (
            <div className="p-8 text-center text-brand-muted">{t('admin.noBookingsToday')}</div>
          )}
          {sortedBookings.map((b) => {
            const client = clientMap[b.clientId];
            return (
              <button
                key={b.id}
                onClick={() => navigate(`/admin/booking/${b.id}`)}
                className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-16 text-sm font-medium text-brand-dark">
                  {b.startTime ?? '—'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-brand-dark truncate">
                    {client?.fullName ?? 'Unknown'}
                  </div>
                  <div className="text-xs text-brand-muted">
                    {roomLabel(b.roomId)} · {therapistLabel(b.therapistId)}
                  </div>
                </div>
                <Badge variant={statusVariant[b.status] ?? 'default'}>
                  {statusLabel(b.status)}
                </Badge>
                {intakeBookingIds.has(b.id) && (
                  <Badge variant="success">{t('admin.intakeFilled', 'Intake')}</Badge>
                )}
                <div className="text-xs text-brand-muted">
                  {b.source === 'walkin' ? t('common.walkin') : t('common.booking')}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
