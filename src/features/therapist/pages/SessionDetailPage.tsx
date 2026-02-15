import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBookingStore } from '../../../stores/bookingStore';
import { useConfigStore } from '../../../stores/configStore';
import { useIntakeStore } from '../../../stores/intakeStore';
import { useClientStore } from '../../../stores/clientStore';
import { getTherapistClientView } from '../../../stores/selectors/therapistSessionView';
import { Button } from '../../../shared/components';
import { getTherapistBrief } from '../../../stores/selectors/therapistBrief';
import { PrintSessionSheet } from '../../../components/PrintSessionSheet';
import { IntakeSummaryCard } from '../../../components/intake/IntakeSummaryCard';

const POLL_INTERVAL = 15_000;

export function SessionDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { bookings, updateBooking, loadBookings } = useBookingStore();
  // Subscribe reactively — re-renders when intakes/clients update (cross-tab sync, polling)
  const { intakes, loadIntakes } = useIntakeStore();
  const { clients, loadClients } = useClientStore();
  const config = useConfigStore((s) => s.config);

  const [note, setNote] = useState('');

  const booking = bookings.find((b) => b.id === id);

  // Derive intake reactively from store
  const intake = useMemo(
    () => (booking ? intakes.find((i) => i.bookingId === booking.id) : undefined) ?? null,
    [intakes, booking],
  );

  // Derive client reactively, stripping contact fields for therapist
  const client = useMemo(() => {
    if (!booking) return null;
    const raw = clients.find((c) => c.id === booking.clientId);
    return raw ? getTherapistClientView(raw) : null;
  }, [clients, booking]);

  // Polling for fresh data
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

  if (!booking) return <div className="p-8 text-brand-muted">{t('therapist.sessionDetail')}</div>;

  const brief = intake ? getTherapistBrief(intake) : null;

  const handleStart = () => updateBooking(booking.id, { status: 'in_progress' });
  const handleFinish = () => {
    updateBooking(booking.id, {
      status: 'done',
      internalNote: note || booking.internalNote,
    });
    navigate('/therapist');
  };

  return (
    <div className="space-y-4">
      <button onClick={() => navigate('/therapist')} className="text-brand-muted text-sm">&larr; {t('common.back')}</button>

      {/* Client name + time — NO contact info shown */}
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold text-brand-dark">
          {client?.fullName ?? t('admin.clientInfo')}
        </h2>
        <span className="text-brand-muted">{booking.startTime ?? ''}</span>
      </div>

      {intake && <IntakeSummaryCard intake={intake} />}

      {/* Therapist notes */}
      <div className="bg-white rounded-xl border border-brand-border p-4">
        <h3 className="font-semibold text-brand-dark text-sm mb-2">{t('therapist.sessionNotes')}</h3>
        <textarea
          className="w-full min-h-[80px] p-3 border border-brand-border rounded-lg text-sm resize-none"
          placeholder={t('therapist.addNotes')}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pb-4 no-print">
        {brief && (
          <Button fullWidth variant="outline" onClick={() => window.print()}>
            {t('print.printSession')}
          </Button>
        )}
        {booking.status !== 'in_progress' && booking.status !== 'done' && (
          <Button fullWidth variant="secondary" onClick={handleStart}>
            {t('therapist.startSession')}
          </Button>
        )}
        {booking.status === 'in_progress' && (
          <Button fullWidth onClick={handleFinish}>
            {t('therapist.finishSession')}
          </Button>
        )}
      </div>

      {/* Printable session sheet — hidden on screen, visible in print */}
      {brief && (
        <PrintSessionSheet
          brief={brief}
          booking={booking}
          client={client}
          config={config}
        />
      )}
    </div>
  );
}
