import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars');
}

/**
 * Promise-based in-tab mutex.
 * Replaces the default navigator.locks (which can cause AbortError in SW contexts)
 * while still providing proper mutual exclusion (unlike a no-op lock which
 * allows concurrent session mutations and causes corruption on refresh).
 */
const locks = new Map<string, Promise<unknown>>();

async function acquireLock<T>(
  name: string,
  _acquireTimeout: number,
  fn: () => Promise<T>,
): Promise<T> {
  const prev = locks.get(name) ?? Promise.resolve();
  const current = prev
    .catch(() => {})
    .then(() => fn());
  locks.set(name, current);
  try {
    return await current;
  } finally {
    if (locks.get(name) === current) locks.delete(name);
  }
}

export const supabase = createClient(url, key, {
  auth: {
    detectSessionInUrl: false,
    lock: acquireLock,
  },
});
