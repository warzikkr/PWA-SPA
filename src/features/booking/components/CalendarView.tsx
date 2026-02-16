import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface CalendarViewProps {
  availableDates: Set<string>;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toISO(d: Date): string {
  return d.toISOString().split('T')[0];
}

export function CalendarView({ availableDates, selectedDate, onSelectDate }: CalendarViewProps) {
  const { t } = useTranslation();
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const todayISO = toISO(today);

  const [viewDate, setViewDate] = useState(() => new Date(today));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const canGoPrev = year > today.getFullYear() || month > today.getMonth();

  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          disabled={!canGoPrev}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-30 transition-colors"
        >
          &larr;
        </button>
        <span className="font-serif text-lg font-semibold text-brand-dark">{monthLabel}</span>
        <button
          onClick={nextMonth}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          &rarr;
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-brand-muted py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`e-${idx}`} />;

          const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isPast = iso < todayISO;
          const isAvailable = availableDates.has(iso);
          const isSelected = iso === selectedDate;
          const isToday = iso === todayISO;

          const disabled = isPast || !isAvailable;

          return (
            <button
              key={iso}
              disabled={disabled}
              onClick={() => onSelectDate(iso)}
              className={[
                'relative w-full aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all',
                isSelected
                  ? 'bg-brand-green text-white shadow-sm'
                  : isToday && isAvailable
                    ? 'bg-green-50 text-brand-green border border-brand-green'
                    : isAvailable
                      ? 'bg-white text-brand-dark hover:bg-green-50 border border-brand-border'
                      : 'text-gray-300 cursor-not-allowed',
              ].join(' ')}
            >
              {day}
              {isAvailable && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-green" />
              )}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-brand-muted text-center mt-3">
        {t('booking.calendarHint', 'Green dot = available')}
      </p>
    </div>
  );
}
