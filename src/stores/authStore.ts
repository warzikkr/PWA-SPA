import { create } from 'zustand';
import type { User, UserRole } from '../types';
import { supabase } from '../lib/supabaseClient';
import { userService } from '../services/userService';

interface AuthState {
  currentUser: User | null;
  loading: boolean;
  /** Sign in via Supabase Auth, then fetch app user profile */
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  /** Restore session on app load */
  restoreSession: () => Promise<void>;
  isAuthenticated: () => boolean;
  hasRole: (...roles: UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  currentUser: null,
  loading: true,

  login: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return { success: false, error: 'No auth user after login' };

    const appUser = await userService.getByAuthUid(authUser.id);
    if (!appUser) return { success: false, error: 'User profile not found' };
    if (!appUser.enabled) {
      await supabase.auth.signOut();
      return { success: false, error: 'Account disabled' };
    }

    set({ currentUser: appUser });
    return { success: true };
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ currentUser: null });
  },

  restoreSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      set({ currentUser: null, loading: false });
      return;
    }
    try {
      const appUser = await userService.getByAuthUid(session.user.id);
      set({ currentUser: appUser ?? null, loading: false });
    } catch {
      set({ currentUser: null, loading: false });
    }
  },

  isAuthenticated: () => get().currentUser !== null,

  hasRole: (...roles) => {
    const user = get().currentUser;
    if (!user) return false;
    return roles.includes(user.role);
  },
}));

/** Listen for Supabase auth state changes (token refresh, sign out from another tab) */
supabase.auth.onAuthStateChange(async (event) => {
  if (event === 'SIGNED_OUT') {
    useAuthStore.setState({ currentUser: null });
  }
  if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const appUser = await userService.getByAuthUid(authUser.id);
      if (appUser) {
        useAuthStore.setState({ currentUser: appUser });
      }
    }
  }
});
