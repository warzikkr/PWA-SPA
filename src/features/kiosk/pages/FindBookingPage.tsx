import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useKioskStore } from '../../../stores/kioskStore';
import { clientService } from '../../../services/clientService';
import { bookingService } from '../../../services/bookingService';
import { Button, Input } from '../../../shared/components';
import { useKioskInactivity } from '../hooks/useKioskInactivity';
import type { Booking } from '../../../types';

const SEARCH_TIMEOUT = 10_000;

export function FindBookingPage() {
  useKioskInactivity();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setBookingId, setClientId, setIsWalkin } = useKioskStore();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<(Booking & { clientName?: string })[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResults([]);
    setSearched(false);

    const timeout = setTimeout(() => {
      setLoading(false);
      setError('Search timed out. Please try again.');
    }, SEARCH_TIMEOUT);

    try {
      const clients = await clientService.findByContact(query.trim());
      const today = new Date().toISOString().split('T')[0];

      const allBookings = await Promise.all(
        clients.map(async (client) => {
          const clientBookings = await bookingService.findByClientId(client.id);
          return clientBookings
            .filter((b) => b.date === today)
            .map((b) => ({ ...b, clientName: client.fullName }));
        }),
      );

      clearTimeout(timeout);
      setResults(allBookings.flat());
      setSearched(true);
    } catch (err) {
      clearTimeout(timeout);
      console.error('[FindBooking] Search error:', err);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectBooking = (booking: Booking) => {
    setBookingId(booking.id);
    setClientId(booking.clientId);
    navigate('/kiosk/intake');
  };

  const continueAsWalkin = () => {
    setIsWalkin(true);
    navigate('/kiosk/contacts');
  };

  return (
    <div className="flex flex-col min-h-full px-6 py-8">
      <button onClick={() => navigate('/kiosk')} className="text-brand-muted mb-6 self-start">&larr; {t('common.back')}</button>

      <h2 className="font-serif text-2xl font-bold text-brand-dark text-center mb-2">
        {t('kiosk.findBooking')}
      </h2>
      <p className="text-brand-muted text-center mb-8">
        {t('kiosk.findBookingHint')}
      </p>

      <div className="max-w-sm mx-auto w-full flex flex-col gap-4">
        <Input
          placeholder={t('kiosk.findBookingPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button fullWidth onClick={handleSearch} disabled={loading}>
          {loading ? t('common.loading') : t('common.search')}
        </Button>

        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        {searched && results.length === 0 && !error && (
          <div className="text-center py-8">
            <p className="text-brand-muted mb-4">{t('kiosk.noBookingFound')}</p>
            <Button variant="outline" fullWidth onClick={continueAsWalkin}>
              {t('kiosk.walkInFallback')}
            </Button>
          </div>
        )}

        {results.length > 0 && (
          <div className="flex flex-col gap-3 mt-4">
            <p className="text-sm font-medium text-brand-dark">{t('kiosk.findBooking')}:</p>
            {results.map((b) => (
              <button
                key={b.id}
                onClick={() => selectBooking(b)}
                className="p-4 border-2 border-brand-border rounded-lg text-left hover:border-brand-green transition-colors"
              >
                <div className="font-medium text-brand-dark">{b.clientName}</div>
                <div className="text-sm text-brand-muted">
                  {b.startTime && `${b.startTime} — `}{b.status}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
