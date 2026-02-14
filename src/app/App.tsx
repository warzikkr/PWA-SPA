import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useConfigStore } from '../stores/configStore';
import { useClientStore } from '../stores/clientStore';
import { useUserStore } from '../stores/userStore';
import { useTherapistNoteStore } from '../stores/therapistNoteStore';
import { useChangeRequestStore } from '../stores/changeRequestStore';
// Initialize i18n (side-effect import)
import '../i18n';

export function App() {
  const loadConfig = useConfigStore((s) => s.loadConfig);
  const loadClients = useClientStore((s) => s.loadClients);
  const loadUsers = useUserStore((s) => s.loadUsers);
  const loadNotes = useTherapistNoteStore((s) => s.loadNotes);
  const loadRequests = useChangeRequestStore((s) => s.loadRequests);

  useEffect(() => {
    loadConfig();
    loadClients();
    loadUsers();
    loadNotes();
    loadRequests();
  }, [loadConfig, loadClients, loadUsers, loadNotes, loadRequests]);

  return <RouterProvider router={router} />;
}
