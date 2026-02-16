import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars');
}

/**
 * Reentrant flag-based lock.
 *
 * navigator.locks causes hangs: getSession() waits for initializePromise
 * which waits for the lock callback, creating a circular-await deadlock.
 *
 * This lock:
 * - Supports reentrancy (nested calls pass through → no deadlock)
 * - Never hangs (no dependency on browser lock API)
 * - Provides single-chain mutual exclusion (sufficient for single-tab SPA)
 */
let locked = false;

async function reentrantLock<T>(
  _name: string,
  _acquireTimeout: number,
  fn: () => Promise<T>,
): Promise<T> {
  if (locked) return fn();
  locked = true;
  try {
    return await fn();
  } finally {
    locked = false;
  }
}

export const supabase = createClient(url, key, {
  auth: {
    detectSessionInUrl: false,
    lock: reentrantLock,
  },
});
