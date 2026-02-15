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
// Initialize i18n (side-effect import)
import '../i18n';

export function App() {
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const currentUser = useAuthStore((s) => s.currentUser);

  const loadConfig = useConfigStore((s) => s.loadConfig);
  const loadClients = useClientStore((s) => s.loadClients);
  const loadBookings = useBookingStore((s) => s.loadBookings);
  const loadIntakes = useIntakeStore((s) => s.loadIntakes);
  const loadUsers = useUserStore((s) => s.loadUsers);
  const loadNotes = useTherapistNoteStore((s) => s.loadNotes);
  const loadRequests = useChangeRequestStore((s) => s.loadRequests);

  // Restore Supabase session on mount
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // Load all data from Supabase + subscribe to Realtime when user is authenticated
  // Also load config for kiosk (works for anon via RLS)
  useEffect(() => {
    loadConfig();

    if (currentUser) {
      loadClients();
      loadBookings();
      loadIntakes();
      loadUsers();
      loadNotes();
      loadRequests();
      subscribeRealtime();
    }

    return () => {
      unsubscribeRealtime();
    };
  }, [currentUser, loadConfig, loadClients, loadBookings, loadIntakes, loadUsers, loadNotes, loadRequests]);

  return <RouterProvider router={router} />;
}
