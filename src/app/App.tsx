import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useAuthStore } from '../stores/authStore';
import { useConfigStore } from '../stores/configStore';
import { useClientStore } from '../stores/clientStore';
import { useBookingStore } from '../stores/bookingStore';
import { useIntakeStore } from '../stores/intakeStore';
import { useUserStore } from '../stores/userStore';
import { useTherapistNoteStore } from '../stores/therapistNoteStore';
import { useChangeRequestStore } from '../stores/changeRequestStore';
import { subscribeRealtime, unsubscribeRealtime } from '../lib/realtimeSync';
import { ErrorBoundary } from '../shared/components';
import '../i18n';

export function App() {
  const loading = useAuthStore((s) => s.loading);
  const currentUser = useAuthStore((s) => s.currentUser);

  const loadConfig = useConfigStore((s) => s.loadConfig);
  const loadClients = useClientStore((s) => s.loadClients);
  const loadBookings = useBookingStore((s) => s.loadBookings);
  const loadIntakes = useIntakeStore((s) => s.loadIntakes);
  const loadUsers = useUserStore((s) => s.loadUsers);
  const loadNotes = useTherapistNoteStore((s) => s.loadNotes);
  const loadRequests = useChangeRequestStore((s) => s.loadRequests);

  useEffect(() => {
    if (!loading) {
      loadConfig().catch(console.error);
    }
  }, [loading, loadConfig]);

  useEffect(() => {
    if (!currentUser) return;

    Promise.all([
      loadClients(),
      loadBookings(),
      loadIntakes(),
      loadUsers(),
      loadNotes(),
      loadRequests(),
    ]).catch(console.error);

    subscribeRealtime();
    return () => { unsubscribeRealtime(); };
  }, [currentUser, loadClients, loadBookings, loadIntakes, loadUsers, loadNotes, loadRequests]);

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
