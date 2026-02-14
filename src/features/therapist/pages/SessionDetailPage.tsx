import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBookingStore } from '../../../stores/bookingStore';
import { useConfigStore } from '../../../stores/configStore';
import { clientService } from '../../../services/clientService';
import { intakeService } from '../../../services/intakeService';
import { getTherapistClientView, type TherapistClientView } from '../../../stores/selectors/therapistSessionView';
import { Button, Badge, ReadonlyBodyMap } from '../../../shared/components';
import { getTherapistBrief, hasMedicalRisks } from '../../../stores/selectors/therapistBrief';
import { PrintSessionSheet } from '../../../components/PrintSessionSheet';
import type { Intake } from '../../../types';
import type { BodyZoneSelection } from '../../../types';

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
  const hasRisks = brief ? hasMedicalRisks(brief) : false;

  const handleStart = () => updateBooking(booking.id, { status: 'in_progress' });
  const handleFinish = () => {
    updateBooking(booking.id, {
      status: 'done',
      internalNote: note || booking.internalNote,
    });
    navigate('/therapist');
  };

  const zoneLabel = (z: BodyZoneSelection) => {
    const regionName = config.bodyZones.find((bz) => bz.id === z.region)?.label ?? z.region;
    return `${z.half === 'right' ? 'R' : 'L'} ${regionName}`;
  };

  const groupZones = (zones: BodyZoneSelection[]) => {
    const front = zones.filter((z) => z.side === 'front');
    const back = zones.filter((z) => z.side === 'back');
    return { front, back };
  };

  const renderZoneGroup = (zones: BodyZoneSelection[], label: string, color: string) => {
    if (!zones.length) return null;
    const { front, back } = groupZones(zones);
    return (
      <div>
        <span className={`text-xs uppercase font-semibold ${color}`}>{label}: </span>
        <div className="ml-2 text-sm">
          {front.length > 0 && (
            <div><span className="text-brand-muted text-xs">{t('therapist.front')}:</span> {front.map(zoneLabel).join(', ')}</div>
          )}
          {back.length > 0 && (
            <div><span className="text-brand-muted text-xs">{t('therapist.backSide')}:</span> {back.map(zoneLabel).join(', ')}</div>
          )}
        </div>
      </div>
    );
  };

  const str = (v: unknown) => (v == null || v === '' ? '—' : String(v));

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

      {brief && (
        <>
          {/* Key info grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-brand-border p-4 text-center">
              <div className="text-xs text-brand-muted uppercase tracking-wide mb-1">{t('therapist.duration')}</div>
              <div className="text-2xl font-bold text-brand-dark">{str(brief.duration)}</div>
              <div className="text-xs text-brand-muted">{t('therapist.mins')}</div>
            </div>
            <div className="bg-white rounded-xl border border-brand-border p-4 text-center">
              <div className="text-xs text-brand-muted uppercase tracking-wide mb-1">{t('therapist.pressure')}</div>
              <div className="text-2xl font-bold text-brand-dark capitalize">{str(brief.pressure)}</div>
              {brief.deepTissue && <div className="text-xs text-brand-green">{t('therapist.deepTissue')}</div>}
            </div>
            <div className="bg-white rounded-xl border border-brand-border p-4 text-center">
              <div className="text-xs text-brand-muted uppercase tracking-wide mb-1">{t('therapist.goal')}</div>
              <div className="text-sm font-medium text-brand-dark">
                {brief.goal.length ? brief.goal.join(', ') : '—'}
              </div>
            </div>
          </div>

          {/* Body Zones */}
          <div className="bg-white rounded-xl border border-brand-border p-4 space-y-3">
            <h3 className="font-semibold text-brand-dark text-sm">{t('therapist.bodyZones')}</h3>
            {(brief.focusZones.length > 0 || brief.avoidZones.length > 0) && (
              <ReadonlyBodyMap focusZones={brief.focusZones} avoidZones={brief.avoidZones} compact />
            )}
            {renderZoneGroup(brief.focusZones, t('therapist.focus'), 'text-brand-green')}
            {renderZoneGroup(brief.secondaryZones, t('therapist.secondary'), 'text-brand-muted')}
            {renderZoneGroup(brief.avoidZones, t('therapist.avoid'), 'text-red-500')}
            {brief.sensitiveAreas.length > 0 && (
              <div>
                <span className="text-xs text-orange-500 uppercase font-semibold">{t('therapist.sensitiveAreas')}: </span>
                <span className="text-sm text-brand-dark">{brief.sensitiveAreas.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Medical Risks */}
          {hasRisks && (
            <div className="bg-red-50 rounded-xl border border-red-200 p-4 space-y-2">
              <h3 className="font-semibold text-red-700 text-sm">{t('therapist.risksAllergies')}</h3>
              <div className="flex flex-wrap gap-1">
                {brief.pregnancy !== 'no' && brief.pregnancy !== '' && <Badge variant="danger">{t('medical.pregnant')} ({brief.pregnancy})</Badge>}
                {brief.bloodPressure && <Badge variant="danger">{t('medical.highBP')}</Badge>}
                {brief.fever && <Badge variant="danger">{t('medical.fever')}</Badge>}
                {brief.varicoseVeins && <Badge variant="danger">{t('medical.varicoseVeins')}</Badge>}
                {brief.allergies.map((a) => <Badge key={a} variant="danger">{a}</Badge>)}
              </div>
              {brief.injuries && <div className="text-sm text-red-700">{t('therapist.injuries')}: {brief.injuries}</div>}
              {brief.skinIssues && <div className="text-sm text-red-700">{t('therapist.skinIssues')}: {brief.skinIssues}</div>}
              {brief.painScale > 0 && (
                <div className="text-sm text-red-700">{t('therapist.pain')}: {brief.painScale}/10 — {str(brief.painLocation)}</div>
              )}
            </div>
          )}

          {/* Preferences */}
          <div className="bg-white rounded-xl border border-brand-border p-4">
            <h3 className="font-semibold text-brand-dark text-sm mb-2">{t('therapist.preferences')}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {brief.oilPreference && <div><span className="text-brand-muted">{t('therapist.oil')}:</span> {brief.oilPreference}</div>}
              {brief.smellSensitivity && <div className="text-red-600">{t('therapist.smellSensitive')}</div>}
            </div>
          </div>

          {/* Atmosphere */}
          <div className="bg-white rounded-xl border border-brand-border p-4">
            <h3 className="font-semibold text-brand-dark text-sm mb-2">{t('therapist.atmosphere')}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {brief.atmosphere.music && <div><span className="text-brand-muted">{t('therapist.music')}:</span> {brief.atmosphere.music}</div>}
              {brief.atmosphere.volume && <div><span className="text-brand-muted">{t('therapist.volume')}:</span> {brief.atmosphere.volume}</div>}
              {brief.atmosphere.light && <div><span className="text-brand-muted">{t('therapist.light')}:</span> {brief.atmosphere.light}</div>}
              {brief.atmosphere.temp && <div><span className="text-brand-muted">{t('therapist.temp')}:</span> {brief.atmosphere.temp}</div>}
            </div>
          </div>

          {/* Additional Notes */}
          {brief.additionalNotes && (
            <div className="bg-white rounded-xl border border-brand-border p-4">
              <h3 className="font-semibold text-brand-dark text-sm mb-2">{t('print.clientNotes')}</h3>
              <p className="text-sm text-brand-dark">{brief.additionalNotes}</p>
            </div>
          )}
        </>
      )}

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
