import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars');
}

export const supabase = createClient(url, key, {
  auth: {
    detectSessionInUrl: false,
    // No-op lock: avoids both AbortError (navigator.locks) and deadlock
    // (recursive lock acquisition during Supabase internal init).
    // Trade-off: multi-tab token refresh may race — rare and recoverable.
    lock: async (_name, _acquireTimeout, fn) => fn(),
  },
});
