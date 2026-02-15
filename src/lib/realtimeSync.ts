/**
 * Supabase Realtime subscriptions.
 *
 * Listens for postgres_changes on key tables and reloads the
 * corresponding Zustand store so all connected clients see updates
 * within seconds — replaces the old StorageEvent cross-tab sync.
 */
import { supabase } from './supabaseClient';
import { useBookingStore } from '../stores/bookingStore';
import { useClientStore } from '../stores/clientStore';
import { useIntakeStore } from '../stores/intakeStore';
import { useTherapistNoteStore } from '../stores/therapistNoteStore';
import { useChangeRequestStore } from '../stores/changeRequestStore';

let subscribed = false;

export function subscribeRealtime() {
  if (subscribed) return;
  subscribed = true;

  supabase
    .channel('db-sync')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
      useBookingStore.getState().loadBookings();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => {
      useClientStore.getState().loadClients();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'intakes' }, () => {
      useIntakeStore.getState().loadIntakes();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'therapist_notes' }, () => {
      useTherapistNoteStore.getState().loadNotes();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'change_requests' }, () => {
      useChangeRequestStore.getState().loadRequests();
    })
    .subscribe();
}

export function unsubscribeRealtime() {
  if (!subscribed) return;
  subscribed = false;
  supabase.removeAllChannels();
}
