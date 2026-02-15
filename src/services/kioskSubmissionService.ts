/**
 * kioskSubmissionService — Centralized, atomic kiosk submission.
 *
 * Orchestrates: client → booking → intake → back-links → preferences → visit history.
 * All steps run sequentially with error handling. If any step fails, throws
 * so the caller can handle (show error / retry).
 *
 * Uses Zustand store methods to ensure both localStorage (service layer)
 * and in-memory store state stay in sync.
 */
import type { ClientPreferences } from '../types';
import { useBookingStore } from '../stores/bookingStore';
import { useIntakeStore } from '../stores/intakeStore';
import { useClientStore } from '../stores/clientStore';

export interface KioskSubmissionResult {
  clientId: string;
  intakeId: string;
  bookingId: string;
}

interface SubmitParams {
  /** Client ID (already created in ContactsPage) */
  clientId: string;
  /** Existing booking ID (pre-booked flow) — undefined for walk-ins */
  bookingId?: string;
  /** Whether this is a walk-in (needs new booking) */
  isWalkin: boolean;
  /** Merged form data from all intake steps */
  formData: Record<string, unknown>;
}

/** Extract reusable preferences from intake form data */
function extractPreferences(data: Record<string, unknown>): ClientPreferences {
  const prefs: ClientPreferences = {};
  if (data.pressure) prefs.pressure = String(data.pressure);
  if (data.oil_preference) prefs.oilPreference = String(data.oil_preference);
  if (Array.isArray(data.allergies) && data.allergies.length)
    prefs.allergies = data.allergies as string[];
  if (data.smell_sensitivity != null) prefs.smellSensitivity = Boolean(data.smell_sensitivity);
  if (Array.isArray(data.focus_zones) && data.focus_zones.length)
    prefs.focusZones = data.focus_zones as ClientPreferences['focusZones'];
  if (Array.isArray(data.avoid_zones) && data.avoid_zones.length)
    prefs.avoidZones = data.avoid_zones as ClientPreferences['avoidZones'];
  const atmo: Record<string, string> = {};
  if (data.music_preset) atmo.music = String(data.music_preset);
  if (data.volume) atmo.volume = String(data.volume);
  if (data.light_preference) atmo.light = String(data.light_preference);
  if (data.temperature) atmo.temp = String(data.temperature);
  if (Object.keys(atmo).length) prefs.atmosphere = atmo;
  return prefs;
}

/**
 * Submit kiosk intake atomically.
 * Throws on failure — caller should catch and display error.
 */
export async function submitKioskIntake({
  clientId,
  bookingId,
  isWalkin,
  formData,
}: SubmitParams): Promise<KioskSubmissionResult> {
  const { addBooking, updateBooking } = useBookingStore.getState();
  const { addIntake } = useIntakeStore.getState();
  const { updatePreferences, addVisit } = useClientStore.getState();

  let finalBookingId = bookingId ?? '';

  // Step 1: Create booking for walk-ins
  if (isWalkin && clientId && !bookingId) {
    const booking = await addBooking({
      clientId,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      paymentStatus: 'unpaid',
      source: 'walkin',
    });
    finalBookingId = booking.id;
  }

  if (!finalBookingId) {
    throw new Error('No booking ID — cannot submit intake without a booking');
  }

  // Step 2: Create intake linked to booking
  const intake = await addIntake({
    clientId,
    bookingId: finalBookingId,
    data: formData,
    signature: (formData.signature as string) ?? '',
  });

  // Step 3: Back-link intake to booking
  await updateBooking(finalBookingId, { intakeId: intake.id });

  // Step 4: Persist client preferences + visit history
  if (clientId) {
    await updatePreferences(clientId, extractPreferences(formData));
    await addVisit(clientId, finalBookingId);
  }

  return {
    clientId,
    intakeId: intake.id,
    bookingId: finalBookingId,
  };
}
