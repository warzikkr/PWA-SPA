import { create } from 'zustand';
import type { User, UserRole } from '../types';
import { supabase } from '../lib/supabaseClient';
import { userService } from '../services/userService';

interface AuthState {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
  hasRole: (...roles: UserRole[]) => boolean;
}

/** Fetch user profile with retry. */
async function fetchAppUser(authUid: string, retries = 2): Promise<User | undefined> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await userService.getByAuthUid(authUid);
    } catch (err) {
      console.warn(`[Auth] getByAuthUid ${i + 1}/${retries + 1} failed:`, err);
      if (i < retries) await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    }
  }
  return undefined;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  currentUser: null,
  loading: true,

  login: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };

      const authUser = data.user;
      if (!authUser) return { success: false, error: 'No auth user after login' };

      // Don't call fetchAppUser here — onAuthStateChange SIGNED_IN handles it.
      // signInWithPassword internally awaits _notifyAllSubscribers, and calling
      // supabase.from() inside that chain causes circular-await on initializePromise.
      return { success: true };
    } catch (err) {
      console.error('[Auth] login error:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Login failed' };
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ currentUser: null });
  },

  isAuthenticated: () => get().currentUser !== null,

  hasRole: (...roles) => {
    const user = get().currentUser;
    if (!user) return false;
    return roles.includes(user.role);
  },
}));

// Safety timeout
setTimeout(() => {
  if (useAuthStore.getState().loading) {
    console.warn('[Auth] Timed out — forcing loading=false');
    useAuthStore.setState({ currentUser: null, loading: false });
  }
}, 15_000);

/**
 * Auth event listener.
 *
 * CRITICAL: The callback must NOT be async and must NOT await supabase
 * operations (like .from().select()). Supabase internally awaits
 * _notifyAllSubscribers → our callback → which calls getSession() →
 * which awaits initializePromise → which waits for _notifyAllSubscribers
 * to complete → CIRCULAR DEADLOCK.
 *
 * Solution: use setTimeout(0) to defer DB queries outside the event chain.
 */
supabase.auth.onAuthStateChange((event, session) => {
  console.info(`[Auth] event: ${event}, hasUser=${!!session?.user}`);

  if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    if (!session?.user) {
      console.info(`[Auth] ${event}: no session`);
      useAuthStore.setState({ currentUser: null, loading: false });
      return;
    }

    // Defer profile fetch to break circular-await chain
    setTimeout(async () => {
      console.info(`[Auth] ${event}: fetching profile…`);
      try {
        const appUser = await fetchAppUser(session.user.id);
        console.info(`[Auth] ${event}: profile ${appUser ? 'OK' : 'NOT found'}`);
        if (appUser) {
          useAuthStore.setState({ currentUser: appUser, loading: false });
        } else {
          useAuthStore.setState({ currentUser: null, loading: false });
        }
      } catch (err) {
        console.error(`[Auth] ${event}: fetchAppUser error:`, err);
        useAuthStore.setState({ currentUser: null, loading: false });
      }
    }, 0);
    return;
  }

  if (event === 'SIGNED_OUT') {
    useAuthStore.setState({ currentUser: null, loading: false });
  }
});
