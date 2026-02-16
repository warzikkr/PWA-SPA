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
      console.warn(`[Auth] getByAuthUid attempt ${i + 1}/${retries + 1} failed:`, err);
      if (i < retries) await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    }
  }
  return undefined;
}

/** Resolve loading state from a session event. */
async function resolveSession(
  session: { user: { id: string } } | null,
  source: string,
): Promise<void> {
  if (!session?.user) {
    console.info(`[Auth] ${source}: no session`);
    useAuthStore.setState({ currentUser: null, loading: false });
    return;
  }
  console.info(`[Auth] ${source}: fetching profile…`);
  const appUser = await fetchAppUser(session.user.id);
  console.info(`[Auth] ${source}: profile ${appUser ? 'OK' : 'NOT found'}`);
  useAuthStore.setState({ currentUser: appUser ?? null, loading: false });
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

      const appUser = await fetchAppUser(authUser.id);
      if (!appUser) return { success: false, error: 'User profile not found' };
      if (!appUser.enabled) {
        await supabase.auth.signOut();
        return { success: false, error: 'Account disabled' };
      }

      set({ currentUser: appUser, loading: false });
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
 * Single auth listener — handles ALL events including initial session.
 *
 * We do NOT call getSession() separately because it can hang
 * when waiting for the internal initializePromise/lock chain.
 * Instead, both INITIAL_SESSION and SIGNED_IN resolve the loading state.
 */
let initialResolved = false;

supabase.auth.onAuthStateChange(async (event, session) => {
  console.info(`[Auth] event: ${event}, hasUser=${!!session?.user}`);

  if (event === 'INITIAL_SESSION') {
    initialResolved = true;
    await resolveSession(session, 'INITIAL_SESSION');
    return;
  }

  if (event === 'SIGNED_IN') {
    // If INITIAL_SESSION was missed (race condition), treat SIGNED_IN as initial
    if (!initialResolved && useAuthStore.getState().loading) {
      initialResolved = true;
      await resolveSession(session, 'SIGNED_IN (as initial)');
      return;
    }
    // Normal SIGNED_IN (e.g. after login)
    if (session?.user) {
      const appUser = await fetchAppUser(session.user.id);
      if (appUser) {
        useAuthStore.setState({ currentUser: appUser, loading: false });
      }
    }
    return;
  }

  if (event === 'TOKEN_REFRESHED') {
    if (session?.user) {
      const appUser = await fetchAppUser(session.user.id);
      if (appUser) {
        useAuthStore.setState({ currentUser: appUser });
      }
    }
    return;
  }

  if (event === 'SIGNED_OUT') {
    useAuthStore.setState({ currentUser: null, loading: false });
  }
});
