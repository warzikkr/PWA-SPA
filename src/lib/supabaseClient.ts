import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars');
}

/**
 * Queue-based in-memory lock — replaces navigator.locks which throws
 * "AbortError: signal is aborted without reason" in Supabase v2.x.
 *
 * Unlike the previous simpleLock, this uses promise chaining (no TOCTOU race):
 * each caller awaits the previous one's completion before running.
 */
const lockQueues = new Map<string, Promise<void>>();

async function queueLock<R>(
  name: string,
  _acquireTimeout: number,
  fn: () => Promise<R>,
): Promise<R> {
  const prev = lockQueues.get(name) ?? Promise.resolve();

  let releaseLock!: () => void;
  const gate = new Promise<void>((r) => { releaseLock = r; });
  lockQueues.set(name, gate);

  // Wait for previous holder to finish
  await prev;

  try {
    return await fn();
  } finally {
    releaseLock();
    // Clean up only if we're still the tail of the queue
    if (lockQueues.get(name) === gate) {
      lockQueues.delete(name);
    }
  }
}

export const supabase = createClient(url, key, {
  auth: {
    detectSessionInUrl: false,
    lock: queueLock,
  },
});
