import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Badge } from '../../../shared/components';
import type { Booking, Intake, BodyZoneSelection } from '../../../types';
import type { TherapistClientView } from '../../../stores/selectors/therapistSessionView';
import type { AppConfig } from '../../../types/config';

interface Props {
  booking: Booking;
  client?: TherapistClientView; // MIGRATION: restricted view — no contact fields
  intake?: Intake;
  config: AppConfig;
}

export function SessionCard({ booking, client, intake, config }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any> = intake?.data ?? {};
  const allergies = (Array.isArray(data.allergies) ? data.allergies : []) as string[];
  const focusZones = Array.isArray(data.focus_zones) ? data.focus_zones : [];
  const avoidZones = Array.isArray(data.avoid_zones) ? data.avoid_zones : [];
  const duration = String(data.duration ?? '—');
  const pressure = String(data.pressure ?? '—');

  const formatZoneLabel = (zone: unknown): string => {
    if (typeof zone === 'string') return zone;
    if (typeof zone === 'object' && zone !== null) {
      const z = zone as BodyZoneSelection;
      return `${t(`bodyMap.${z.half}`)} ${t(`bodyMap.${z.region}`)}`;
    }
    return String(zone);
  };

  const hasRedFlag =
    (data.pregnancy && data.pregnancy !== 'no') ||
    data.high_blood_pressure ||
    data.fever ||
    allergies.length > 0;

  const roomLabel = config.rooms.find((r) => r.id === booking.roomId)?.label ?? '—';
  const statusLabel = config.statuses.find((s) => s.id === booking.status)?.label ?? booking.status;

  return (
    <button
      onClick={() => navigate(`/therapist/session/${booking.id}`)}
      className={`
        w-full text-left bg-white rounded-xl border-2 p-4 transition-colors
        ${hasRedFlag ? 'border-red-300' : 'border-brand-border'}
        hover:border-brand-green
      `}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-brand-dark">{booking.startTime ?? '—'}</span>
          <Badge variant={booking.status === 'in_progress' ? 'success' : 'default'}>
            {statusLabel}
          </Badge>
          {booking.source === 'walkin' && <Badge variant="info">{t('common.walkin')}</Badge>}
        </div>
        <span className="text-sm text-brand-muted">{roomLabel}</span>
      </div>

      <div className="text-lg font-semibold text-brand-dark mb-1">
        {client?.fullName ?? 'Unknown'}
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm mt-3">
        <div>
          <div className="text-xs text-brand-muted uppercase tracking-wide mb-1">{t('therapist.duration')}</div>
          <div className="font-medium text-brand-dark">{duration} {t('therapist.mins')}</div>
        </div>
        <div>
          <div className="text-xs text-brand-muted uppercase tracking-wide mb-1">{t('therapist.pressure')}</div>
          <div className="font-medium text-brand-dark capitalize">{pressure}</div>
        </div>
        <div>
          <div className="text-xs text-brand-muted uppercase tracking-wide mb-1">{t('therapist.focus')}</div>
          <div className="font-medium text-brand-dark">
            {focusZones.length > 0 ? focusZones.map(formatZoneLabel).join(', ') : '—'}
          </div>
        </div>
      </div>

      {hasRedFlag && (
        <div className="mt-3 flex flex-wrap gap-1">
          {data.pregnancy && data.pregnancy !== 'no' && <Badge variant="danger">{t('medical.pregnant')}</Badge>}
          {Boolean(data.high_blood_pressure) && <Badge variant="danger">{t('medical.highBP')}</Badge>}
          {Boolean(data.fever) && <Badge variant="danger">{t('medical.fever')}</Badge>}
          {allergies.map((a) => (
            <Badge key={a} variant="danger">{a}</Badge>
          ))}
        </div>
      )}

      {avoidZones.length > 0 && (
        <div className="mt-2 text-xs text-red-600">
          {t('therapist.avoid')}: {avoidZones.map(formatZoneLabel).join(', ')}
        </div>
      )}
    </button>
  );
}
