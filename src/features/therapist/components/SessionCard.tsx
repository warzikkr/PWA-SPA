import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Badge } from '../../../shared/components';
import { IntakeSummaryCard } from '../../../components/intake/IntakeSummaryCard';
import { hasMedicalRisks, getTherapistBrief } from '../../../stores/selectors/therapistBrief';
import type { Booking, Intake } from '../../../types';
import type { TherapistClientView } from '../../../stores/selectors/therapistSessionView';
import type { AppConfig } from '../../../types/config';

interface Props {
  booking: Booking;
  client?: TherapistClientView;
  intake?: Intake;
  config: AppConfig;
}

export function SessionCard({ booking, client, intake, config }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const hasRedFlag = intake ? hasMedicalRisks(getTherapistBrief(intake)) : false;

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

      {intake && (
        <div className="mt-3">
          <IntakeSummaryCard intake={intake} compact />
        </div>
      )}
    </button>
  );
}
