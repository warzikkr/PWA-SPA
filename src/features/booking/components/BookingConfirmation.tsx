import { useTranslation } from 'react-i18next';

interface BookingConfirmationProps {
  date: string;
  time: string;
  name: string;
}

export function BookingConfirmation({ date, time, name }: BookingConfirmationProps) {
  const { t } = useTranslation();

  const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col items-center text-center py-8 gap-6">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
        <svg className="w-8 h-8 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div>
        <h2 className="font-serif text-2xl font-bold text-brand-dark mb-2">
          {t('booking.confirmed', 'Booking Confirmed!')}
        </h2>
        <p className="text-brand-muted">
          {t('booking.confirmedHint', 'We look forward to seeing you')}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-brand-border p-5 w-full max-w-xs space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-brand-muted">{t('booking.name', 'Name')}</span>
          <span className="font-medium text-brand-dark">{name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-brand-muted">{t('booking.date', 'Date')}</span>
          <span className="font-medium text-brand-dark">{formattedDate}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-brand-muted">{t('booking.time', 'Time')}</span>
          <span className="font-medium text-brand-dark">{time}</span>
        </div>
      </div>

      <p className="text-xs text-brand-muted max-w-xs">
        {t('booking.arrivalNote', 'Please arrive 5 minutes before your session. You can check in using the kiosk at the salon.')}
      </p>
    </div>
  );
}
