import type { Client, Booking, Intake, TherapistNote, User } from '../types';

const today = new Date().toISOString().split('T')[0];

export const mockClients: Client[] = [
  {
    id: 'cl_1',
    fullName: 'Sarah Johnson',
    email: 'sarah@example.com',
    contactMethod: 'whatsapp',
    contactValue: '+1234567890',
    marketingSource: 'instagram',
    consentPromotions: true,
    consentPrivacy: true,
    tags: ['vip', 'regular'],
    createdAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'cl_2',
    fullName: 'Michael Chen',
    email: 'michael@example.com',
    contactMethod: 'phone',
    contactValue: '+1987654321',
    marketingSource: 'google_maps',
    consentPromotions: false,
    consentPrivacy: true,
    tags: ['prefer_soft'],
    createdAt: '2026-02-01T14:00:00Z',
  },
  {
    id: 'cl_3',
    fullName: 'Emma Wilson',
    email: 'emma@example.com',
    contactMethod: 'email',
    contactValue: 'emma@example.com',
    marketingSource: 'friend',
    consentPromotions: true,
    consentPrivacy: true,
    tags: ['pregnancy'],
    createdAt: '2026-02-10T09:00:00Z',
  },
];

export const mockBookings: Booking[] = [
  {
    id: 'bk_1',
    clientId: 'cl_1',
    therapistId: 'th_1',
    roomId: 'room_1',
    intakeId: 'in_1',
    status: 'assigned',
    date: today,
    startTime: '10:00',
    endTime: '11:00',
    paymentStatus: 'unpaid',
    createdAt: '2026-02-14T08:00:00Z',
    source: 'booking',
  },
  {
    id: 'bk_2',
    clientId: 'cl_2',
    therapistId: 'th_2',
    roomId: 'room_2',
    status: 'pending',
    date: today,
    startTime: '11:30',
    endTime: '13:00',
    paymentStatus: 'unpaid',
    createdAt: '2026-02-14T08:30:00Z',
    source: 'booking',
  },
  {
    id: 'bk_3',
    clientId: 'cl_3',
    status: 'pending',
    date: today,
    paymentStatus: 'unpaid',
    createdAt: '2026-02-14T09:00:00Z',
    source: 'walkin',
  },
];

export const mockIntakes: Intake[] = [
  {
    id: 'in_1',
    clientId: 'cl_1',
    bookingId: 'bk_1',
    data: {
      duration: '60',
      goal: ['relax'],
      pressure: 'medium',
      deep_tissue: false,
      focus_zones: ['shoulders', 'upper_back'],
      music_preset: 'piano',
      volume: 'low',
      light_preference: 'dim',
      temperature: 'warm',
      pregnancy: 'no',
      consent: true,
    },
    completedAt: '2026-02-14T09:45:00Z',
  },
];

export const mockUsers: User[] = [
  { id: 'usr_admin', fullName: 'Admin', username: 'admin', password: 'admin', role: 'admin', enabled: true },
  { id: 'usr_rec', fullName: 'Front Desk', username: 'reception', password: 'reception', role: 'reception', enabled: true },
  { id: 'usr_th1', fullName: 'Anna K.', username: 'anna', password: 'anna', role: 'therapist', therapistId: 'th_1', enabled: true },
  { id: 'usr_th2', fullName: 'Maria S.', username: 'maria', password: 'maria', role: 'therapist', therapistId: 'th_2', enabled: true },
];

export const mockTherapistNotes: TherapistNote[] = [
  {
    id: 'tn_1',
    bookingId: 'bk_1',
    therapistId: 'th_1',
    therapistName: 'Anna K.',
    text: 'Client prefers extra focus on shoulders. Used jojoba oil.',
    createdAt: '2026-02-14T11:00:00Z',
  },
];
