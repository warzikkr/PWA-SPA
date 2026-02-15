import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBookingStore } from '../../../stores/bookingStore';
import { useConfigStore } from '../../../stores/configStore';
import { useIntakeStore } from '../../../stores/intakeStore';
import { clientService } from '../../../services/clientService';
import { Button, Badge, Select } from '../../../shared/components';
import { Modal } from '../../../shared/components/Modal';
import { getTherapistBrief } from '../../../stores/selectors/therapistBrief';
import { PrintSessionSheet } from '../../../components/PrintSessionSheet';
import { IntakeSummaryCard } from '../../../components/intake/IntakeSummaryCard';
import type { Client, Booking, Intake } from '../../../types';

export function BookingDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  // Detect parent route for back navigation
  const parentRoute = location.pathname.startsWith('/reception') ? '/reception' : '/admin';
  const { bookings, updateBooking, loadBookings } = useBookingStore();
  const { getByBookingId } = useIntakeStore();
  const config = useConfigStore((s) => s.config);

  const [client, setClient] = useState<Client | null>(null);
  const [intake, setIntake] = useState<Intake | null>(null);
  const [noteModal, setNoteModal] = useState(false);
  const [note, setNote] = useState('');

  const booking = bookings.find((b) => b.id === id);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  useEffect(() => {
    if (!booking) return;
    clientService.getById(booking.clientId).then((c) => setClient(c ?? null));
    getByBookingId(booking.id).then((i) => setIntake(i ?? null));
  }, [booking, getByBookingId]);

  if (!booking) return <div className="p-8 text-brand-muted">{t('common.noData')}</div>;

  const handleUpdate = async (data: Partial<Booking>) => {
    await updateBooking(booking.id, data);
  };

  const redFlags: string[] = [];
  if (intake) {
    if (intake.data.pregnancy && intake.data.pregnancy !== 'no') redFlags.push(t('medical.pregnant'));
    if (intake.data.high_blood_pressure) redFlags.push(t('medical.highBP'));
    if (intake.data.fever) redFlags.push(t('medical.fever'));
    if (intake.data.varicose_veins) redFlags.push(t('medical.varicoseVeins'));
    const allergies = intake.data.allergies as string[] | undefined;
    if (allergies?.length) redFlags.push(`${t('therapist.risksAllergies')}: ${allergies.join(', ')}`);
  }

  return (
    <div>
      <button onClick={() => navigate(parentRoute)} className="text-brand-muted mb-4 text-sm">&larr; {t('common.back')}</button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Client + Booking */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-brand-border p-4">
            <h3 className="font-semibold text-brand-dark mb-3">{t('admin.clientInfo')}</h3>
            {client ? (
              <div className="space-y-2 text-sm">
                <div><span className="text-brand-muted">{t('kiosk.fullName')}:</span> {client.fullName}</div>
                <div><span className="text-brand-muted">{t('kiosk.email')}:</span> {client.email}</div>
                <div><span className="text-brand-muted">{t('kiosk.contactValue')}:</span> {client.contactMethod}: {client.contactValue}</div>
                <div className="flex gap-1 flex-wrap">
                  {client.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-brand-muted text-sm">{t('common.noData')}</p>
            )}
          </div>

          {redFlags.length > 0 && (
            <div className="bg-red-50 rounded-xl border border-red-200 p-4">
              <h3 className="font-semibold text-red-700 mb-2">{t('therapist.risksAllergies')}</h3>
              <ul className="space-y-1">
                {redFlags.map((f) => (
                  <li key={f} className="text-sm text-red-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-xl border border-brand-border p-4 space-y-4">
            <h3 className="font-semibold text-brand-dark">{t('admin.actions')}</h3>

            <Select
              label={t('admin.assignTherapist')}
              options={config.therapists.filter((th) => th.enabled).map((th) => ({ value: th.id, label: th.label }))}
              value={booking.therapistId ?? ''}
              onChange={(e) => handleUpdate({ therapistId: e.target.value })}
              placeholder={t('common.selectPlaceholder')}
            />
            <Select
              label={t('admin.assignRoom')}
              options={config.rooms.filter((r) => r.enabled).map((r) => ({ value: r.id, label: r.label }))}
              value={booking.roomId ?? ''}
              onChange={(e) => handleUpdate({ roomId: e.target.value })}
              placeholder={t('common.selectPlaceholder')}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-brand-dark">{t('admin.startTime')}</label>
              <input
                type="time"
                className="w-full min-h-[48px] px-4 py-3 border border-brand-border rounded-lg text-base"
                value={booking.startTime ?? ''}
                onChange={(e) => handleUpdate({ startTime: e.target.value })}
              />
            </div>
            <Select
              label={t('admin.updateStatus')}
              options={config.statuses.filter((s) => s.enabled).map((s) => ({ value: s.id, label: s.label }))}
              value={booking.status}
              onChange={(e) => handleUpdate({ status: e.target.value })}
            />

            <div className="flex gap-3 flex-wrap">
              <Button size="sm" variant="secondary" onClick={() => handleUpdate({ status: 'in_progress' })}>
                {t('admin.checkIn')}
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleUpdate({ paymentStatus: 'paid' })}>
                {t('admin.payment')}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setNoteModal(true)}>
                {t('admin.internalNote')}
              </Button>
              {intake && (
                <Button size="sm" variant="outline" onClick={() => window.print()}>
                  {t('print.printSession')}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Intake summary */}
        <div className="flex flex-col gap-4">
          {intake ? (
            <IntakeSummaryCard intake={intake} />
          ) : (
            <div className="bg-white rounded-xl border border-brand-border p-4">
              <p className="text-brand-muted text-sm">{t('common.noData')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Printable session sheet — hidden on screen, visible in print */}
      {intake && (
        <PrintSessionSheet
          brief={getTherapistBrief(intake)}
          booking={booking}
          client={client}
          config={config}
        />
      )}

      {/* Note modal */}
      <Modal open={noteModal} onClose={() => setNoteModal(false)} title={t('admin.internalNote')}>
        <textarea
          className="w-full min-h-[100px] p-3 border border-brand-border rounded-lg text-base mb-4"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t('therapist.addNotes')}
        />
        <Button
          fullWidth
          onClick={async () => {
            await handleUpdate({ internalNote: note });
            setNoteModal(false);
            setNote('');
          }}
        >
          {t('common.save')}
        </Button>
      </Modal>
    </div>
  );
}
