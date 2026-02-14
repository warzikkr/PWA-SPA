import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBookingStore } from '../../../stores/bookingStore';
import { useConfigStore } from '../../../stores/configStore';
import { useClientStore } from '../../../stores/clientStore';
import { Badge, Button, Input, Select } from '../../../shared/components';
import type { Client, Booking } from '../../../types';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending: 'warning',
  assigned: 'info',
  in_progress: 'success',
  done: 'default',
};

const POLL_INTERVAL = 15_000;

export function ReceptionDashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { bookings, loadBookings, updateBooking, addBooking } = useBookingStore();
  const config = useConfigStore((s) => s.config);
  const { clients: storeClients, loadClients } = useClientStore();
  const [clientMap, setClientMap] = useState<Record<string, Client>>({});
  const [search, setSearch] = useState('');

  const refresh = useCallback(() => {
    loadBookings();
    loadClients();
  }, [loadBookings, loadClients]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    const map: Record<string, Client> = {};
    storeClients.forEach((c) => (map[c.id] = c));
    setClientMap(map);
  }, [storeClients]);

  const today = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter((b) => b.date === today);

  const filteredBookings = search.trim()
    ? todayBookings.filter((b) => {
        const client = clientMap[b.clientId];
        return (
          client?.fullName.toLowerCase().includes(search.toLowerCase()) ||
          b.id.includes(search)
        );
      })
    : todayBookings;

  const sortedBookings = [...filteredBookings].sort((a, b) => {
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

  const handleCheckIn = async (bookingId: string) => {
    await updateBooking(bookingId, { status: 'in_progress' });
  };

  const handleMarkPaid = async (bookingId: string) => {
    await updateBooking(bookingId, { paymentStatus: 'paid' });
  };

  const handleAssignTherapist = async (bookingId: string, therapistId: string) => {
    await updateBooking(bookingId, { therapistId, status: therapistId ? 'assigned' : 'pending' });
  };

  const handleCreateWalkin = async () => {
    await addBooking({
      clientId: '',
      status: 'pending',
      date: today,
      paymentStatus: 'unpaid',
      source: 'walkin',
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-bold text-brand-dark">{t('admin.today')}</h2>
        <Button size="sm" variant="outline" onClick={handleCreateWalkin}>
          + Walk-in
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
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

      {/* Search */}
      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Search by client name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Bookings list */}
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
              <div key={b.id} className="px-4 py-3">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigate(`/reception/booking/${b.id}`)}
                    className="flex-1 flex items-center gap-4 text-left hover:bg-gray-50 -mx-2 px-2 py-1 rounded transition-colors"
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
                    {b.source === 'walkin' && <Badge variant="info">{t('common.walkin')}</Badge>}
                    {b.paymentStatus === 'paid' && <Badge variant="success">Paid</Badge>}
                  </button>

                  {/* Quick actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Select
                      options={config.therapists.filter((th) => th.enabled).map((th) => ({ value: th.id, label: th.label }))}
                      value={b.therapistId ?? ''}
                      onChange={(e) => handleAssignTherapist(b.id, e.target.value)}
                      placeholder="Therapist"
                    />
                    {b.status !== 'in_progress' && b.status !== 'done' && (
                      <Button size="sm" variant="secondary" onClick={() => handleCheckIn(b.id)}>
                        {t('admin.checkIn')}
                      </Button>
                    )}
                    {b.paymentStatus !== 'paid' && (
                      <Button size="sm" variant="outline" onClick={() => handleMarkPaid(b.id)}>
                        {t('admin.payment')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
