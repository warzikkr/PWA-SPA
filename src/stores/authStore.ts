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
      return await userService.getByAuthUid(authUid);
    } catch (err) {
      console.warn(`[Auth] getByAuthUid attempt ${i + 1} failed:`, err);
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

      const appUser = await fetchAppUser(authUser.id);
      if (!appUser) return { success: false, error: 'User profile not found' };
      if (!appUser.enabled) {
        await supabase.auth.signOut();
        return { success: false, error: 'Account disabled' };
      }

      set({ currentUser: appUser });
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

// Safety timeout — if auth never resolves, force loading=false after 15s
const AUTH_TIMEOUT = 15_000;
setTimeout(() => {
  if (useAuthStore.getState().loading) {
    console.warn('[Auth] Timed out waiting for session — forcing loading=false');
    useAuthStore.setState({ currentUser: null, loading: false });
  }
}, AUTH_TIMEOUT);

/**
 * Single auth listener — handles all session lifecycle events.
 * INITIAL_SESSION fires once on startup with the restored session.
 */
supabase.auth.onAuthStateChange(async (event, session) => {
  try {
    if (event === 'INITIAL_SESSION') {
      if (!session?.user) {
        useAuthStore.setState({ currentUser: null, loading: false });
        return;
      }
      const appUser = await fetchAppUser(session.user.id);
      useAuthStore.setState({ currentUser: appUser ?? null, loading: false });
      return;
    }

    if (event === 'SIGNED_OUT') {
      useAuthStore.setState({ currentUser: null });
    }

    if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
      if (session?.user) {
        const appUser = await fetchAppUser(session.user.id);
        if (appUser) {
          useAuthStore.setState({ currentUser: appUser });
        }
      }
    }
  } catch (err) {
    console.error('[Auth] onAuthStateChange error:', err);
    if (event === 'INITIAL_SESSION') {
      useAuthStore.setState({ currentUser: null, loading: false });
    }
  }
});
