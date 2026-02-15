import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars');
}

/**
 * Simple in-memory lock that replaces navigator.locks.request().
 * The default navigator lock causes "AbortError: signal is aborted without reason"
 * when multiple Supabase calls race for the same lock (every PostgREST
 * request calls getSession() internally).
 */
const locks = new Map<string, Promise<unknown>>();

async function simpleLock<R>(name: string, _acquireTimeout: number, fn: () => Promise<R>): Promise<R> {
  // Wait for any existing lock with the same name
  while (locks.has(name)) {
    await locks.get(name);
  }
  const promise = fn();
  locks.set(name, promise.finally(() => locks.delete(name)));
  return promise;
}

export const supabase = createClient(url, key, {
  auth: {
    detectSessionInUrl: false,
    lock: simpleLock,
  },
});
