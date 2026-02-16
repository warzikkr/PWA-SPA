import { useEffect, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBookingStore } from '../../../stores/bookingStore';
import { useConfigStore } from '../../../stores/configStore';
import { useClientStore } from '../../../stores/clientStore';
import { Badge, Button } from '../../../shared/components';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  scheduled: 'warning',
  checked_in: 'info',
  assigned: 'info',
  in_progress: 'success',
  done: 'default',
  cancelled: 'danger',
};

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 08:00 — 19:00

const POLL_INTERVAL = 30_000;

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function toISO(d: Date): string {
  return d.toISOString().split('T')[0];
}

function formatWeekRange(monday: Date): string {
  const sun = new Date(monday);
  sun.setDate(sun.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${monday.toLocaleDateString('en-US', opts)} — ${sun.toLocaleDateString('en-US', opts)}, ${monday.getFullYear()}`;
}

export function CalendarPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { bookings, loadBookings } = useBookingStore();
  const config = useConfigStore((s) => s.config);
  const { clients: storeClients, loadClients } = useClientStore();

  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));

  const clientMap = useMemo(() => {
    const map: Record<string, (typeof storeClients)[number]> = {};
    storeClients.forEach((c) => (map[c.id] = c));
    return map;
  }, [storeClients]);

  const refresh = useCallback(() => {
    loadBookings();
    loadClients();
  }, [loadBookings, loadClients]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [refresh]);

  // Build week dates
  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return toISO(d);
    });
  }, [weekStart]);

  const todayISO = toISO(new Date());

  // Group bookings by date
  const bookingsByDate = useMemo(() => {
    const map: Record<string, typeof bookings> = {};
    for (const date of weekDates) {
      map[date] = bookings
        .filter((b) => b.date === date)
        .sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''));
    }
    return map;
  }, [bookings, weekDates]);

  const statusLabel = (id: string) =>
    config.statuses.find((s) => s.id === id)?.label ?? id;

  const therapistLabel = (id?: string) =>
    config.therapists.find((th) => th.id === id)?.label ?? '';

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };

  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  const goToday = () => setWeekStart(getMonday(new Date()));

  // Helper: get hour from time string
  const getHour = (time?: string) => {
    if (!time) return -1;
    return parseInt(time.split(':')[0], 10);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-bold text-brand-dark">Calendar</h2>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={prevWeek}>&larr;</Button>
          <Button size="sm" variant="secondary" onClick={goToday}>Today</Button>
          <Button size="sm" variant="outline" onClick={nextWeek}>&rarr;</Button>
        </div>
      </div>

      <p className="text-sm text-brand-muted mb-4">{formatWeekRange(weekStart)}</p>

      {/* Week grid */}
      <div className="bg-white rounded-xl border border-brand-border overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-brand-border">
          <div className="p-2" />
          {weekDates.map((date, i) => {
            const isToday = date === todayISO;
            const dayNum = new Date(date + 'T12:00:00').getDate();
            return (
              <div
                key={date}
                className={`p-2 text-center border-l border-brand-border ${isToday ? 'bg-green-50' : ''}`}
              >
                <div className="text-xs font-medium text-brand-muted">{DAY_LABELS[i]}</div>
                <div className={`text-sm font-bold ${isToday ? 'text-brand-green' : 'text-brand-dark'}`}>
                  {dayNum}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time rows */}
        {HOURS.map((hour) => (
          <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-brand-border last:border-b-0 min-h-[64px]">
            <div className="p-2 text-xs text-brand-muted text-right pr-3 pt-1">
              {String(hour).padStart(2, '0')}:00
            </div>
            {weekDates.map((date) => {
              const dayBookings = (bookingsByDate[date] ?? []).filter(
                (b) => getHour(b.startTime) === hour,
              );
              const isToday = date === todayISO;
              return (
                <div
                  key={date}
                  className={`border-l border-brand-border p-1 ${isToday ? 'bg-green-50/50' : ''}`}
                >
                  {dayBookings.map((b) => {
                    const client = clientMap[b.clientId];
                    return (
                      <button
                        key={b.id}
                        onClick={() => navigate(`/admin/booking/${b.id}`)}
                        className="w-full text-left p-1.5 rounded-lg mb-1 hover:ring-1 hover:ring-brand-green transition-all text-xs bg-white border border-brand-border shadow-sm"
                      >
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="font-medium text-brand-dark truncate">
                            {b.startTime ?? '—'}
                          </span>
                          <Badge variant={statusVariant[b.status] ?? 'default'}>
                            {statusLabel(b.status)}
                          </Badge>
                        </div>
                        <div className="text-brand-dark truncate">
                          {client?.fullName ?? '—'}
                        </div>
                        {therapistLabel(b.therapistId) && (
                          <div className="text-brand-muted truncate">
                            {therapistLabel(b.therapistId)}
                          </div>
                        )}
                        {b.source === 'online' && (
                          <span className="text-[10px] bg-blue-50 text-blue-600 px-1 rounded">Online</span>
                        )}
                        {b.source === 'walkin' && (
                          <span className="text-[10px] bg-orange-50 text-orange-600 px-1 rounded">Walk-in</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
