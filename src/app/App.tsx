import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useConfigStore, subscribeConfigSync } from '../stores/configStore';
import { useClientStore, subscribeClientSync } from '../stores/clientStore';
import { useBookingStore, subscribeBookingSync } from '../stores/bookingStore';
import { useIntakeStore, subscribeIntakeSync } from '../stores/intakeStore';
import { useUserStore, subscribeUserSync } from '../stores/userStore';
import { useTherapistNoteStore, subscribeNoteSync } from '../stores/therapistNoteStore';
import { useChangeRequestStore, subscribeChangeRequestSync } from '../stores/changeRequestStore';
// Initialize i18n (side-effect import)
import '../i18n';

/**
 * One-time cleanup of stale Zustand persist keys.
 * These stores no longer use persist — service-layer localStorage is the single source of truth.
 */
const STALE_PERSIST_KEYS = [
  'spa_therapist_note_store',
  'spa_change_request_store',
  'spa_user_store',
  'spa_config_store',
];

function cleanupStalePersistKeys() {
  for (const key of STALE_PERSIST_KEYS) {
    localStorage.removeItem(key);
  }
}

export function App() {
  const loadConfig = useConfigStore((s) => s.loadConfig);
  const loadClients = useClientStore((s) => s.loadClients);
  const loadBookings = useBookingStore((s) => s.loadBookings);
  const loadIntakes = useIntakeStore((s) => s.loadIntakes);
  const loadUsers = useUserStore((s) => s.loadUsers);
  const loadNotes = useTherapistNoteStore((s) => s.loadNotes);
  const loadRequests = useChangeRequestStore((s) => s.loadRequests);

  useEffect(() => {
    cleanupStalePersistKeys();
    loadConfig();
    loadClients();
    loadBookings();
    loadIntakes();
    loadUsers();
    loadNotes();
    loadRequests();
  }, [loadConfig, loadClients, loadBookings, loadIntakes, loadUsers, loadNotes, loadRequests]);

  // Cross-tab sync: reload ALL stores when another tab writes to localStorage
  useEffect(() => {
    const unsubs = [
      subscribeBookingSync(),
      subscribeClientSync(),
      subscribeIntakeSync(),
      subscribeUserSync(),
      subscribeNoteSync(),
      subscribeChangeRequestSync(),
      subscribeConfigSync(),
    ];
    return () => unsubs.forEach((fn) => fn());
  }, []);

  return <RouterProvider router={router} />;
}
