import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBookingStore } from '../../../stores/bookingStore';
import { useConfigStore } from '../../../stores/configStore';
import { clientService } from '../../../services/clientService';
import { intakeService } from '../../../services/intakeService';
import { getTherapistClientView, type TherapistClientView } from '../../../stores/selectors/therapistSessionView';
import { Button } from '../../../shared/components';
import { getTherapistBrief } from '../../../stores/selectors/therapistBrief';
import { PrintSessionSheet } from '../../../components/PrintSessionSheet';
import { IntakeSummaryCard } from '../../../components/intake/IntakeSummaryCard';
import type { Intake } from '../../../types';

export function SessionDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { bookings, updateBooking, loadToday } = useBookingStore();
  const config = useConfigStore((s) => s.config);

  // MIGRATION: use TherapistClientView — contact fields stripped at data layer
  const [client, setClient] = useState<TherapistClientView | null>(null);
  const [intake, setIntake] = useState<Intake | null>(null);
  const [note, setNote] = useState('');

  const booking = bookings.find((b) => b.id === id);

  useEffect(() => {
    loadToday();
  }, [loadToday]);

  useEffect(() => {
    if (!booking) return;
    clientService.getById(booking.clientId).then((c) =>
      setClient(c ? getTherapistClientView(c) : null)
    );
    intakeService.getByBookingId(booking.id).then((i) => setIntake(i ?? null));
  }, [booking]);

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
