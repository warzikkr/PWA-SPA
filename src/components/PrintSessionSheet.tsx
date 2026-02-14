import { useTranslation } from 'react-i18next';
import { ReadonlyBodyMap } from '../shared/components';
import type { TherapistBrief } from '../stores/selectors/therapistBrief';
import type { Booking } from '../types';
import type { AppConfig } from '../types/config';

/** Minimal client shape — works with both full Client and TherapistClientView */
interface PrintableClient {
  fullName: string;
  email?: string;
}

interface Props {
  brief: TherapistBrief;
  booking: Booking;
  client: PrintableClient | null;
  config: AppConfig;
}

/**
 * PrintSessionSheet — A4-optimized session summary for printing.
 * Hidden on screen (class="hidden print:block"), rendered via window.print().
 */
export function PrintSessionSheet({ brief, booking, client, config }: Props) {
  const { t } = useTranslation();

  const therapistLabel =
    config.therapists.find((th) => th.id === booking.therapistId)?.label ?? '—';
  const roomLabel =
    config.rooms.find((r) => r.id === booking.roomId)?.label ?? '—';

  const str = (v: unknown) => (v == null || v === '' ? '—' : String(v));

  return (
    <div className="hidden print:block print-session-sheet text-black bg-white p-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold">{t('print.sessionSheet')}</h1>
          <p className="text-sm text-gray-600">{t('print.date')}: {new Date().toLocaleDateString()}</p>
        </div>
        {/* Logo placeholder */}
        <div className="text-right text-sm text-gray-400">Spa</div>
      </div>

      {/* Client & Booking info */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <div className="font-semibold mb-1">{t('admin.clientInfo')}</div>
          <div>{t('kiosk.fullName')}: <strong>{client?.fullName ?? '—'}</strong></div>
          {client?.email && <div>{t('kiosk.email')}: {client.email}</div>}
        </div>
        <div>
          <div>{t('print.therapistLabel')}: <strong>{therapistLabel}</strong></div>
          <div>{t('print.room')}: <strong>{roomLabel}</strong></div>
          <div>{t('admin.startTime')}: <strong>{booking.startTime ?? '—'}</strong></div>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-4 gap-3 mb-4 text-center text-sm">
        <div className="border border-gray-300 rounded p-2">
          <div className="text-xs text-gray-500 uppercase">{t('therapist.duration')}</div>
          <div className="text-lg font-bold">{str(brief.duration)} {t('therapist.mins')}</div>
        </div>
        <div className="border border-gray-300 rounded p-2">
          <div className="text-xs text-gray-500 uppercase">{t('therapist.pressure')}</div>
          <div className="text-lg font-bold capitalize">{str(brief.pressure)}</div>
          {brief.deepTissue && <div className="text-xs">{t('therapist.deepTissue')}</div>}
        </div>
        <div className="border border-gray-300 rounded p-2">
          <div className="text-xs text-gray-500 uppercase">{t('therapist.goal')}</div>
          <div className="text-sm font-medium">{brief.goal.length ? brief.goal.join(', ') : '—'}</div>
        </div>
        <div className="border border-gray-300 rounded p-2">
          <div className="text-xs text-gray-500 uppercase">{t('therapist.oil')}</div>
          <div className="text-sm font-medium">{str(brief.oilPreference)}</div>
          {brief.smellSensitivity && (
            <div className="text-xs text-red-600 font-semibold">{t('therapist.smellSensitive')}</div>
          )}
        </div>
      </div>

      {/* Body Map */}
      {(brief.focusZones.length > 0 || brief.avoidZones.length > 0) && (
        <div className="mb-4 border border-gray-300 rounded p-3">
          <h3 className="font-semibold text-sm mb-2">{t('therapist.bodyZones')}</h3>
          <div className="max-w-[240px] mx-auto">
            <ReadonlyBodyMap
              focusZones={brief.focusZones}
              avoidZones={brief.avoidZones}
              compact
            />
          </div>
        </div>
      )}

      {/* Medical Flags */}
      {(brief.pregnancy !== 'no' && brief.pregnancy !== '' ||
        brief.fever || brief.bloodPressure || brief.varicoseVeins ||
        brief.allergies.length > 0 || brief.injuries || brief.skinIssues) && (
        <div className="mb-4 border border-red-300 rounded p-3 bg-red-50">
          <h3 className="font-semibold text-red-700 text-sm mb-1">{t('print.medicalFlags')}</h3>
          <div className="text-sm space-y-1">
            {brief.pregnancy !== 'no' && brief.pregnancy !== '' && (
              <div>{t('medical.pregnant')}: {brief.pregnancy}</div>
            )}
            {brief.bloodPressure && <div>{t('medical.highBP')}</div>}
            {brief.fever && <div>{t('medical.fever')}</div>}
            {brief.varicoseVeins && <div>{t('medical.varicoseVeins')}</div>}
            {brief.allergies.length > 0 && (
              <div>{t('therapist.risksAllergies')}: {brief.allergies.join(', ')}</div>
            )}
            {brief.injuries && <div>{t('therapist.injuries')}: {brief.injuries}</div>}
            {brief.skinIssues && <div>{t('therapist.skinIssues')}: {brief.skinIssues}</div>}
          </div>
        </div>
      )}

      {/* Pain */}
      {brief.painScale > 0 && (
        <div className="mb-4 text-sm">
          <strong>{t('print.painScale')}:</strong> {brief.painScale}/10
          {brief.painLocation && <span> — {t('print.painLocation')}: {brief.painLocation}</span>}
        </div>
      )}

      {/* Sensitive areas */}
      {brief.sensitiveAreas.length > 0 && (
        <div className="mb-4 text-sm">
          <strong>{t('therapist.sensitiveAreas')}:</strong> {brief.sensitiveAreas.join(', ')}
        </div>
      )}

      {/* Atmosphere */}
      {(brief.atmosphere.music || brief.atmosphere.volume || brief.atmosphere.light || brief.atmosphere.temp) && (
        <div className="mb-4 border border-gray-300 rounded p-3">
          <h3 className="font-semibold text-sm mb-1">{t('therapist.atmosphere')}</h3>
          <div className="grid grid-cols-2 gap-1 text-sm">
            {brief.atmosphere.music && <div>{t('therapist.music')}: {brief.atmosphere.music}</div>}
            {brief.atmosphere.volume && <div>{t('therapist.volume')}: {brief.atmosphere.volume}</div>}
            {brief.atmosphere.light && <div>{t('therapist.light')}: {brief.atmosphere.light}</div>}
            {brief.atmosphere.temp && <div>{t('therapist.temp')}: {brief.atmosphere.temp}</div>}
          </div>
        </div>
      )}

      {/* Client notes */}
      {brief.additionalNotes && (
        <div className="mb-4 text-sm">
          <strong>{t('print.clientNotes')}:</strong> {brief.additionalNotes}
        </div>
      )}

      {/* Footer line for therapist notes */}
      <div className="border-t border-gray-300 pt-3 mt-6">
        <div className="text-xs text-gray-400">{t('therapist.sessionNotes')}:</div>
        <div className="min-h-[60px]" />
      </div>
    </div>
  );
}
