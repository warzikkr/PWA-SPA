import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useConfigStore } from '../stores/configStore';
import { useClientStore } from '../stores/clientStore';
import { useBookingStore } from '../stores/bookingStore';
import { useIntakeStore } from '../stores/intakeStore';
import { useUserStore } from '../stores/userStore';
import { useTherapistNoteStore } from '../stores/therapistNoteStore';
import { useChangeRequestStore } from '../stores/changeRequestStore';
// Initialize i18n (side-effect import)
import '../i18n';

export function App() {
  const loadConfig = useConfigStore((s) => s.loadConfig);
  const loadClients = useClientStore((s) => s.loadClients);
  const loadBookings = useBookingStore((s) => s.loadBookings);
  const loadIntakes = useIntakeStore((s) => s.loadIntakes);
  const loadUsers = useUserStore((s) => s.loadUsers);
  const loadNotes = useTherapistNoteStore((s) => s.loadNotes);
  const loadRequests = useChangeRequestStore((s) => s.loadRequests);

  useEffect(() => {
    loadConfig();
    loadClients();
    loadBookings();
    loadIntakes();
    loadUsers();
    loadNotes();
    loadRequests();
  }, [loadConfig, loadClients, loadBookings, loadIntakes, loadUsers, loadNotes, loadRequests]);

  return <RouterProvider router={router} />;
}
