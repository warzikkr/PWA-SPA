/**
 * MyTodayPage — Therapist dashboard.
 *
 * Subscribes to useBookingStore.bookings and filters by therapistId + today.
 * Polls every 15s (same pattern as Admin/Reception) for cross-tab consistency.
 */
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../stores/authStore';
import { useBookingStore } from '../../../stores/bookingStore';
import { useConfigStore } from '../../../stores/configStore';
import { useClientStore } from '../../../stores/clientStore';
import { clientService } from '../../../services/clientService';
import { intakeService } from '../../../services/intakeService';
import { getTherapistClientView, type TherapistClientView } from '../../../stores/selectors/therapistSessionView';
import { SessionCard } from '../components/SessionCard';
import type { Intake } from '../../../types';

const POLL_INTERVAL = 15_000;

export function MyTodayPage() {
  const { t } = useTranslation();
  const currentUser = useAuthStore((s) => s.currentUser);
  const therapistId = currentUser?.therapistId;
  const config = useConfigStore((s) => s.config);

  // Subscribe to the shared booking store — reactive to all updates
  const { bookings: allBookings, loadBookings } = useBookingStore();
  const loadClients = useClientStore((s) => s.loadClients);

  const [clients, setClients] = useState<Record<string, TherapistClientView>>({});
  const [intakes, setIntakes] = useState<Record<string, Intake>>({});

  // Polling — same as Admin/Reception dashboards
  const refresh = useCallback(() => {
    loadBookings();
    loadClients();
  }, [loadBookings, loadClients]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [refresh]);

  // Filter from store: therapistId + today
  const today = new Date().toISOString().split('T')[0];
  const myBookings = useMemo(
    () =>
      allBookings.filter(
        (b) => b.therapistId === therapistId && b.date === today,
      ),
    [allBookings, therapistId, today],
  );

  // Load client/intake data when booking list changes
  useEffect(() => {
    if (myBookings.length === 0) {
      setClients({});
      setIntakes({});
      return;
    }

    let cancelled = false;

    (async () => {
      const clientMap: Record<string, TherapistClientView> = {};
      const intakeMap: Record<string, Intake> = {};

      for (const b of myBookings) {
        const c = await clientService.getById(b.clientId);
        if (c) clientMap[c.id] = getTherapistClientView(c);
        const i = await intakeService.getByBookingId(b.id);
        if (i) intakeMap[b.id] = i;
      }

      if (!cancelled) {
        setClients(clientMap);
        setIntakes(intakeMap);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [myBookings]);

  const now = myBookings.find((b) => b.status === 'in_progress');
  const upcoming = myBookings
    .filter((b) => b.status !== 'in_progress' && b.status !== 'done')
    .sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''));
  const done = myBookings.filter((b) => b.status === 'done');

  return (
    <div className="space-y-6">
      {now && (
        <section>
          <h2 className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-3">{t('therapist.myNow')}</h2>
          <SessionCard
            booking={now}
            client={clients[now.clientId]}
            intake={intakes[now.id]}
            config={config}
          />
        </section>
      )}

      <section>
        <h2 className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-3">{t('therapist.myToday')}</h2>
        {upcoming.length === 0 && !now && (
          <div className="text-center py-8 text-brand-muted">{t('therapist.noSessions')}</div>
        )}
        <div className="space-y-3">
          {upcoming.map((b) => (
            <SessionCard
              key={b.id}
              booking={b}
              client={clients[b.clientId]}
              intake={intakes[b.id]}
              config={config}
            />
          ))}
        </div>
      </section>

      {done.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-3">{t('therapist.completed')}</h2>
          <div className="space-y-3 opacity-60">
            {done.map((b) => (
              <SessionCard
                key={b.id}
                booking={b}
                client={clients[b.clientId]}
                intake={intakes[b.id]}
                config={config}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
