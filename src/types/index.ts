/* ── Auth & RBAC ── */
export type UserRole = 'admin' | 'reception' | 'therapist';

export interface User {
  id: string;
  fullName: string;
  username: string;
  password: string; // plain text in mock — hashed in real backend
  role: UserRole;
  therapistId?: string; // links to ConfigOption therapist id
  enabled: boolean;
}

/* ── Body Map types ── */
export type BodySide = 'front' | 'back';
export type BodyHalf = 'left' | 'right';
export type BodyRegion =
  | 'head'
  | 'neck'
  | 'shoulder'
  | 'arm'
  | 'lower_arm'
  | 'hand'
  | 'upper_back'
  | 'lower_back'
  | 'glute'
  | 'thigh'
  | 'knee'
  | 'calf'
  | 'foot';

export interface BodyZoneSelection {
  side: BodySide;
  half: BodyHalf;
  region: BodyRegion;
}

/* ── Client Preferences ── */
export interface ClientPreferences {
  pressure?: string;
  oilPreference?: string;
  allergies?: string[];
  smellSensitivity?: boolean;
  focusZones?: BodyZoneSelection[];
  avoidZones?: BodyZoneSelection[];
  atmosphere?: Record<string, string>;
}

/* ── Audit ── */
export interface ClientAuditLog {
  id: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  performedBy: string; // user fullName
  performedByUserId: string;
  role: UserRole;
  timestamp: string;
}

/* ── Change Requests ── */
export type ChangeRequestType = 'delete' | 'critical_update';
export type ChangeRequestStatus = 'pending' | 'approved' | 'rejected';

export interface ClientChangeRequest {
  id: string;
  clientId: string;
  clientName: string;
  requestedByUserId: string;
  requestedByName: string;
  type: ChangeRequestType;
  description: string;
  payload: Record<string, unknown>;
  status: ChangeRequestStatus;
  createdAt: string;
  reviewedByUserId?: string;
  reviewedByName?: string;
  reviewedAt?: string;
}

/* ── Domain models ── */
export interface Client {
  id: string;
  fullName: string;
  email: string;
  contactMethod: string;
  contactValue: string;
  marketingSource: string;
  consentPromotions: boolean;
  consentPrivacy: boolean;
  tags: string[];
  createdAt: string;
  notes?: string;
  preferences?: ClientPreferences;
  visitHistory?: string[]; // booking IDs
  auditLog?: ClientAuditLog[];
}

export interface Booking {
  id: string;
  clientId: string;
  therapistId?: string;
  roomId?: string;
  intakeId?: string;
  status: string;
  date: string;
  startTime?: string;
  endTime?: string;
  paymentStatus?: 'unpaid' | 'paid';
  paymentType?: string;
  internalNote?: string;
  createdAt: string;
  source: 'booking' | 'walkin';
}

export interface Intake {
  id: string;
  clientId: string;
  bookingId?: string;
  data: Record<string, unknown>;
  completedAt: string;
  signature?: string;
}

export interface Therapist {
  id: string;
  name: string;
  enabled: boolean;
}

export interface Room {
  id: string;
  name: string;
  enabled: boolean;
}

export interface Tag {
  id: string;
  label: string;
  color: string;
  enabled: boolean;
}

export interface TherapistNote {
  id: string;
  bookingId: string;
  therapistId: string;
  therapistName?: string;
  text: string;
  createdAt: string;
}
