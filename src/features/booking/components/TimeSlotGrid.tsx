import { useTranslation } from 'react-i18next';
import type { TimeSlot } from '../../../services/availabilityService';

interface TimeSlotGridProps {
  slots: TimeSlot[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  loading?: boolean;
}

export function TimeSlotGrid({ slots, selectedTime, onSelectTime, loading }: TimeSlotGridProps) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <p className="text-center text-brand-muted py-8">
        {t('booking.noSlots', 'No available times for this date')}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
      {slots.map((slot) => {
        const isSelected = slot.time === selectedTime;
        return (
          <button
            key={slot.time}
            onClick={() => onSelectTime(slot.time)}
            className={[
              'py-3 px-2 rounded-xl text-center font-medium transition-all border-2',
              isSelected
                ? 'border-brand-green bg-brand-green text-white shadow-sm'
                : 'border-brand-border bg-white text-brand-dark hover:border-brand-green hover:bg-green-50',
            ].join(' ')}
          >
            <span className="text-base">{slot.time}</span>
            {slot.availableCount <= 2 && (
              <span className="block text-[10px] mt-0.5 opacity-70">
                {slot.availableCount === 1
                  ? t('booking.lastSlot', 'Last spot')
                  : t('booking.fewSlots', '{{count}} left', { count: slot.availableCount })}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
