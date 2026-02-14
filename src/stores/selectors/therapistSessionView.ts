import type { Client, ClientPreferences } from '../../types';

/**
 * Restricted client view for therapists.
 * Omits all contact fields: email, phone, contactMethod, contactValue, marketingSource.
 * Enforced at the data layer — therapist UI components must use this type.
 */
export interface TherapistClientView {
  fullName: string;
  tags: string[];
  preferences?: ClientPreferences;
  notes?: string;
}

/** Strip contact information from a Client, returning only therapist-safe fields */
export function getTherapistClientView(client: Client): TherapistClientView {
  return {
    fullName: client.fullName,
    tags: client.tags,
    preferences: client.preferences,
    notes: client.notes,
  };
}
