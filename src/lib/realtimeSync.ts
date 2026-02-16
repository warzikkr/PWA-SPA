/**
 * Supabase Realtime subscriptions.
 *
 * Listens for postgres_changes on key tables and reloads the
 * corresponding Zustand store so all connected clients see updates
 * within seconds.
 */
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import { useBookingStore } from '../stores/bookingStore';
import { useClientStore } from '../stores/clientStore';
import { useIntakeStore } from '../stores/intakeStore';
import { useTherapistNoteStore } from '../stores/therapistNoteStore';
import { useChangeRequestStore } from '../stores/changeRequestStore';

let channel: RealtimeChannel | null = null;

export function subscribeRealtime() {
  if (channel) return;

  channel = supabase
    .channel('db-sync')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
      useBookingStore.getState().loadBookings().catch(console.error);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => {
      useClientStore.getState().loadClients().catch(console.error);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'intakes' }, () => {
      useIntakeStore.getState().loadIntakes().catch(console.error);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'therapist_notes' }, () => {
      useTherapistNoteStore.getState().loadNotes().catch(console.error);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'change_requests' }, () => {
      useChangeRequestStore.getState().loadRequests().catch(console.error);
    })
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR') {
        console.error('[Realtime] Channel error — will retry on next auth cycle');
        channel = null;
      }
    });
}

export function unsubscribeRealtime() {
  if (!channel) return;
  supabase.removeChannel(channel);
  channel = null;
}
