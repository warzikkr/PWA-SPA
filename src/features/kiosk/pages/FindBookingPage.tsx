import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useKioskStore } from '../../../stores/kioskStore';
import { useClientStore } from '../../../stores/clientStore';
import { useIntakeStore } from '../../../stores/intakeStore';
import { bookingService } from '../../../services/bookingService';
import { Button, Input } from '../../../shared/components';
import { useKioskInactivity } from '../hooks/useKioskInactivity';
import type { Booking } from '../../../types';

const DEBOUNCE_MS = 300;

type BookingResult = Booking & { clientName: string };

export function FindBookingPage() {
  useKioskInactivity();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setBookingId, setClientId, setGender, setIsWalkin, updateFormData } = useKioskStore();
  const getClientById = useClientStore((s) => s.getById);
  const intakes = useIntakeStore((s) => s.intakes);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BookingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await bookingService.searchTodayByName(value.trim());
        setResults(data);
        setSearched(true);
      } catch (err) {
        console.error('[FindBooking] Search error:', err);
        setResults([]);
        setSearched(true);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);
  }, []);

  const selectBooking = async (booking: BookingResult) => {
    setBookingId(booking.id);
    setClientId(booking.clientId);

    // Prefill client data
    const client = getClientById(booking.clientId);
    if (client) {
      if (client.gender) setGender(client.gender);
      updateFormData({ gender: client.gender });

      // Apply saved preferences
      if (client.preferences) {
        const prefs = client.preferences;
        const prefData: Record<string, unknown> = {};
        if (prefs.pressure) prefData.pressure = prefs.pressure;
        if (prefs.oilPreference) prefData.oil_preference = prefs.oilPreference;
        if (prefs.allergies?.length) prefData.allergies = prefs.allergies;
        if (prefs.smellSensitivity != null) prefData.smell_sensitivity = prefs.smellSensitivity;
        if (prefs.focusZones?.length) prefData.focus_zones = prefs.focusZones;
        if (prefs.avoidZones?.length) prefData.avoid_zones = prefs.avoidZones;
        if (prefs.atmosphere) {
          if (prefs.atmosphere.music) prefData.music_preset = prefs.atmosphere.music;
          if (prefs.atmosphere.volume) prefData.volume = prefs.atmosphere.volume;
          if (prefs.atmosphere.light) prefData.light_preference = prefs.atmosphere.light;
        }
        updateFormData(prefData);
      }
    }

    // Check if intake already filled (online)
    const existingIntake = intakes.find((i) => i.bookingId === booking.id);
    if (existingIntake) {
      // Intake already done — update status to checked_in and go to thanks
      try {
        await bookingService.update(booking.id, { status: 'checked_in' });
      } catch (err) {
        console.error('[FindBooking] Status update failed:', err);
      }
      navigate('/kiosk/thanks');
    } else {
      // No intake — proceed to intake wizard
      navigate('/kiosk/intake');
    }
  };

  const continueAsWalkin = () => {
    setIsWalkin(true);
    navigate('/kiosk/contacts');
  };

  return (
    <div className="flex flex-col min-h-full px-6 py-8">
      <button onClick={() => navigate('/kiosk')} className="text-brand-muted mb-6 self-start">
        &larr; {t('common.back')}
      </button>

      <h2 className="font-serif text-2xl font-bold text-brand-dark text-center mb-2">
        {t('kiosk.findBooking')}
      </h2>
      <p className="text-brand-muted text-center mb-8">
        {t('kiosk.findBookingHintName', 'Enter your name to find your booking')}
      </p>

      <div className="max-w-sm mx-auto w-full flex flex-col gap-4">
        <Input
          placeholder={t('kiosk.enterName', 'Your name...')}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          autoComplete="off"
          autoFocus
        />

        {loading && (
          <div className="flex items-center justify-center py-4">
            <div className="w-5 h-5 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {results.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-brand-dark">
              {t('kiosk.todayBookings', "Today's bookings")}:
            </p>
            {results.map((b) => (
              <button
                key={b.id}
                onClick={() => selectBooking(b)}
                className="p-4 border-2 border-brand-border rounded-lg text-left hover:border-brand-green transition-colors"
              >
                <div className="font-medium text-brand-dark">{b.clientName}</div>
                <div className="text-sm text-brand-muted">
                  {b.startTime ?? '—'} · {b.status}
                  {b.source === 'online' && (
                    <span className="ml-2 text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">Online</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {searched && !loading && results.length === 0 && query.trim().length >= 2 && (
          <div className="text-center py-8">
            <p className="text-brand-muted mb-4">{t('kiosk.noBookingFound')}</p>
            <Button variant="outline" fullWidth onClick={continueAsWalkin}>
              {t('kiosk.walkInFallback')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
