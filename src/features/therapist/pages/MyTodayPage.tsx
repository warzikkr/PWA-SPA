import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../stores/authStore';
import { useBookingStore } from '../../../stores/bookingStore';
import { useConfigStore } from '../../../stores/configStore';
import { clientService } from '../../../services/clientService';
import { intakeService } from '../../../services/intakeService';
import { getTherapistClientView, type TherapistClientView } from '../../../stores/selectors/therapistSessionView';
import { SessionCard } from '../components/SessionCard';
import type { Intake, Booking } from '../../../types';

export function MyTodayPage() {
  const { t } = useTranslation();
  const currentUser = useAuthStore((s) => s.currentUser);
  const therapistId = currentUser?.therapistId;
  const config = useConfigStore((s) => s.config);
  const { getByTherapistToday } = useBookingStore();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<Record<string, TherapistClientView>>({});
  const [intakes, setIntakes] = useState<Record<string, Intake>>({});

  useEffect(() => {
    if (!therapistId) return;
    getByTherapistToday(therapistId).then(async (bks) => {
      setBookings(bks);

      const clientMap: Record<string, TherapistClientView> = {};
      const intakeMap: Record<string, Intake> = {};

      for (const b of bks) {
        const c = await clientService.getById(b.clientId);
        // MIGRATION: strip contact fields — therapist must not see them
        if (c) clientMap[c.id] = getTherapistClientView(c);
        const i = await intakeService.getByBookingId(b.id);
        if (i) intakeMap[b.id] = i;
      }

      setClients(clientMap);
      setIntakes(intakeMap);
    });
  }, [therapistId, getByTherapistToday]);

  const now = bookings.find((b) => b.status === 'in_progress');
  const upcoming = bookings
    .filter((b) => b.status !== 'in_progress' && b.status !== 'done')
    .sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''));
  const done = bookings.filter((b) => b.status === 'done');

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
