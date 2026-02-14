import type { Intake } from '../types';
import { mockIntakes } from '../data/mockData';
import { getItem, setItem, uid } from './storage';

const KEY = 'intakes';

function getAll(): Intake[] {
  return getItem<Intake[]>(KEY, mockIntakes);
}

/** TODO: replace with real API calls */
export const intakeService = {
  async list(): Promise<Intake[]> {
    return getAll();
  },

  async getById(id: string): Promise<Intake | undefined> {
    return getAll().find((i) => i.id === id);
  },

  async getByBookingId(bookingId: string): Promise<Intake | undefined> {
    return getAll().find((i) => i.bookingId === bookingId);
  },

  async getByClientId(clientId: string): Promise<Intake[]> {
    return getAll().filter((i) => i.clientId === clientId);
  },

  async create(data: Omit<Intake, 'id' | 'completedAt'>): Promise<Intake> {
    const all = getAll();
    const intake: Intake = { ...data, id: uid(), completedAt: new Date().toISOString() };
    all.push(intake);
    setItem(KEY, all);
    return intake;
  },
};
