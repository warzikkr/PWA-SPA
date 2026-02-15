/**
 * MyTodayPage — Therapist dashboard.
 *
 * Subscribes to bookings, intakes, and clients stores REACTIVELY.
 * Filters by therapistId + today in render.
 * Polls every 15s for cross-tab consistency.
 */
import { useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../stores/authStore';
import { useBookingStore } from '../../../stores/bookingStore';
import { useIntakeStore } from '../../../stores/intakeStore';
import { useClientStore } from '../../../stores/clientStore';
import { useConfigStore } from '../../../stores/configStore';
import { getTherapistClientView } from '../../../stores/selectors/therapistSessionView';
import { SessionCard } from '../components/SessionCard';

const POLL_INTERVAL = 15_000;

export function MyTodayPage() {
  const { t } = useTranslation();
  const currentUser = useAuthStore((s) => s.currentUser);
  const therapistId = currentUser?.therapistId;
  const config = useConfigStore((s) => s.config);

  // Subscribe to ALL three stores — reactive to cross-tab sync + polling
  const { bookings: allBookings, loadBookings } = useBookingStore();
  const { intakes: allIntakes, loadIntakes } = useIntakeStore();
  const { clients: allClients, loadClients } = useClientStore();

  // Polling — same as Admin/Reception dashboards
  const refresh = useCallback(() => {
    loadBookings();
    loadIntakes();
    loadClients();
  }, [loadBookings, loadIntakes, loadClients]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [refresh]);

  // Filter bookings: therapistId + today
  const today = new Date().toISOString().split('T')[0];
  const myBookings = useMemo(
    () =>
      allBookings.filter(
        (b) => b.therapistId === therapistId && b.date === today,
      ),
    [allBookings, therapistId, today],
  );

  // Derive client map from store (reactive, stripped for therapist)
  const clientMap = useMemo(() => {
    const map: Record<string, ReturnType<typeof getTherapistClientView>> = {};
    for (const b of myBookings) {
      const raw = allClients.find((c) => c.id === b.clientId);
      if (raw) map[raw.id] = getTherapistClientView(raw);
    }
    return map;
  }, [allClients, myBookings]);

  // Derive intake map from store (reactive)
  const intakeMap = useMemo(() => {
    const map: Record<string, (typeof allIntakes)[number]> = {};
    for (const b of myBookings) {
      const i = allIntakes.find((intake) => intake.bookingId === b.id);
      if (i) map[b.id] = i;
    }
    return map;
  }, [allIntakes, myBookings]);

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
            client={clientMap[now.clientId]}
            intake={intakeMap[now.id]}
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
              client={clientMap[b.clientId]}
              intake={intakeMap[b.id]}
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
                client={clientMap[b.clientId]}
                intake={intakeMap[b.id]}
                config={config}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
