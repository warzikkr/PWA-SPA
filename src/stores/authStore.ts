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

/** Fetch user profile with retry (covers transient network / token-refresh races). */
async function fetchAppUser(authUid: string, retries = 2): Promise<User | undefined> {
  for (let i = 0; i <= retries; i++) {
    try {
      const user = await userService.getByAuthUid(authUid);
      if (i > 0) console.info(`[Auth] getByAuthUid succeeded on attempt ${i + 1}`);
      return user;
    } catch (err) {
      console.warn(`[Auth] getByAuthUid attempt ${i + 1}/${retries + 1} failed:`, err);
      if (i < retries) await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    }
  }
  console.error('[Auth] getByAuthUid exhausted all retries');
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

/**
 * Explicitly restore session on startup via getSession().
 * Does NOT rely on INITIAL_SESSION event timing (which can be missed
 * if the listener is registered after the event fires).
 */
async function initAuth() {
  console.info('[Auth] initAuth: calling getSession()…');
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('[Auth] initAuth: getSession error:', error.message);
      useAuthStore.setState({ currentUser: null, loading: false });
      return;
    }
    if (!session?.user) {
      console.info('[Auth] initAuth: no session');
      useAuthStore.setState({ currentUser: null, loading: false });
      return;
    }
    console.info('[Auth] initAuth: session found, fetching profile…');
    const appUser = await fetchAppUser(session.user.id);
    console.info(`[Auth] initAuth: profile ${appUser ? 'OK (' + appUser.role + ')' : 'NOT found'}`);
    useAuthStore.setState({ currentUser: appUser ?? null, loading: false });
  } catch (err) {
    console.error('[Auth] initAuth error:', err);
    useAuthStore.setState({ currentUser: null, loading: false });
  }
}

initAuth();

// Safety timeout — if initAuth somehow hangs
setTimeout(() => {
  if (useAuthStore.getState().loading) {
    console.warn('[Auth] Timed out — forcing loading=false');
    useAuthStore.setState({ currentUser: null, loading: false });
  }
}, 15_000);

/**
 * Listen for subsequent auth events (sign-in, sign-out, token refresh).
 * Initial session is handled by initAuth() above.
 */
supabase.auth.onAuthStateChange(async (event, session) => {
  console.info(`[Auth] event: ${event}`);

  // Skip INITIAL_SESSION — already handled by initAuth()
  if (event === 'INITIAL_SESSION') return;

  if (event === 'SIGNED_OUT') {
    useAuthStore.setState({ currentUser: null, loading: false });
    return;
  }

  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    if (!session?.user) return;
    const appUser = await fetchAppUser(session.user.id);
    if (appUser) {
      useAuthStore.setState({ currentUser: appUser, loading: false });
    }
  }
});
