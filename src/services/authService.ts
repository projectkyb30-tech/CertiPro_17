
import { supabase } from './supabase';
import { UserProfile } from '../types';
import { Capacitor } from '@capacitor/core';
import { fetchWithRetry } from '../utils/fetchUtils';

const apiBase = import.meta.env.VITE_API_URL || '/api';

export const getStoredAccessToken = (): string | null => {
  try {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (!key.startsWith('sb-') || !key.endsWith('auth-token')) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        const token =
          parsed?.access_token ||
          parsed?.currentSession?.access_token ||
          parsed?.session?.access_token;
        if (typeof token === 'string' && token.length > 0) {
          return token;
        }
      } catch {
        // ignore JSON parse errors and continue
      }
    }
  } catch {
    // Access to localStorage might fail in some environments
    return null;
  }
  return null;
};

export const authService = {
  /**
   * Log in with email and password
   */
  async login(email: string, password: string): Promise<UserProfile> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('No user data returned');

    const role = data.user.app_metadata?.role || data.user.user_metadata?.role;
    return this.getUserProfile(data.user.id, data.user.email!, role);
  },

  /**
   * Register a new user
   * Note: The 'profiles' table entry is created automatically via a Supabase Trigger.
   */
  async register(email: string, password: string, fullName: string = ''): Promise<UserProfile> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error('No user data returned');

    const role = data.user.app_metadata?.role || data.user.user_metadata?.role;

    // The trigger might take a few ms to create the profile. 
    // We try to fetch it, or return a temporary optimistic object.
    try {
      // Small delay to allow trigger to fire (optional but helpful)
      await new Promise(r => setTimeout(r, 500));
      return await this.getUserProfile(data.user.id, email, role);
    } catch {
      // Fallback if fetch fails immediately (optimistic response)
      return {
        id: data.user.id,
        fullName: fullName,
        email: email,
        streak: 0,
        xp: 0,
        lessonsCompletedToday: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        role: role === 'admin' ? 'admin' : 'user',
      };
    }
  },

  /**
   * Verify email with OTP code
   */
  async verifyOtp(email: string, token: string): Promise<UserProfile> {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup'
    });

    if (error) throw error;
    if (!data.user) throw new Error('OTP_VERIFICATION_FAILED');

    const role = data.user.app_metadata?.role || data.user.user_metadata?.role;
    return this.getUserProfile(data.user.id, email, role);
  },

  /**
   * Resend OTP code
   */
  async resendOtp(email: string): Promise<void> {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });
    if (error) throw error;
  },

  // Method to login with Google using a fixed redirect URL for Vercel
  async loginWithGoogle(): Promise<void> {
    const isNative = Capacitor.isNativePlatform();
    const redirectTo = isNative
      ? 'com.certipro.app://auth/callback'
      : `${window.location.origin}/auth/callback`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true, // We handle the redirect manually to ensure it works on all platforms
      },
    });

    if (error) throw error;

    if (data?.url) {
      // Open the browser for OAuth
      window.location.assign(data.url);
    }
  },

  async loginWithApple(): Promise<void> {
    const isNative = Capacitor.isNativePlatform();
    const redirectTo = isNative
      ? 'com.certipro.app://auth/callback'
      : `${window.location.origin}/auth/callback`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;

    if (data?.url) {
      window.location.assign(data.url);
    }
  },

  async logout(): Promise<void> {
    try {
      // First try normal global signout
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: unknown) {
      // Suppress network abort errors which happen if we redirect too fast
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isNetworkAbort = errorMessage.includes('network') || errorMessage.includes('aborted') || errorMessage.includes('Failed to fetch');

      if (!isNetworkAbort) {
        console.warn('Global logout failed, clearing local session anyway:', error);
      }

      // Fallback: Clear all localStorage items related to Supabase
      // Note: Supabase default key is usually 'sb-<projectId>-auth-token'
      // We clear all known Supabase-like keys to be safe
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      });
    }
  },

  /**
   * Send password reset email
   */
  async resetPasswordForEmail(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
  },


  async getCurrentUser(): Promise<UserProfile | null> {
    const token = getStoredAccessToken();
    if (!token) return null;

    const response = await fetchWithRetry(`${apiBase}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        return null;
      }
      const result = await response.json().catch(() => null);
      const message = result?.error || 'Failed to fetch current user';
      throw new Error(message);
    }

    const payload = await response.json();
    return payload.data as UserProfile;
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Map frontend camelCase to backend snake_case
    const dbUpdates: Record<string, unknown> = {};
    if (updates.fullName) dbUpdates.full_name = updates.fullName;
    if (updates.email) dbUpdates.email = updates.email;
    if (updates.phone) dbUpdates.phone = updates.phone;
    if (updates.bio) dbUpdates.bio = updates.bio;
    if (updates.birthDate) dbUpdates.birth_date = updates.birthDate;
    if (updates.streak !== undefined) dbUpdates.streak = updates.streak;
    if (updates.xp !== undefined) dbUpdates.xp = updates.xp;
    if (updates.lessonsCompletedToday !== undefined) dbUpdates.lessons_completed_today = updates.lessonsCompletedToday;
    if (updates.avatarUrl) dbUpdates.avatar_url = updates.avatarUrl;

    // Always update updated_at
    dbUpdates.updated_at = new Date().toISOString();

    // Ensure ID and Email are present for UPSERT (in case profile doesn't exist yet)
    dbUpdates.id = user.id;
    if (!dbUpdates.email) {
      dbUpdates.email = user.email;
    }

    // console.log('Sending upsert to Supabase:', dbUpdates);

    // Use upsert instead of update to handle cases where the profile row might be missing
    const { data, error } = await supabase
      .from('profiles')
      .upsert(dbUpdates)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return this.mapProfileToUser(data);
  },

  // Helper to fetch profile
  async getUserProfile(userId: string, email: string, role?: string): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.warn('Profile not found in DB, using temporary session profile.');
      // Return a temporary object derived from auth data ONLY. 
      // Do NOT attempt to insert into DB (violates RLS).
      const now = new Date().toISOString();
      return {
        id: userId,
        email: email,
        fullName: email.split('@')[0],
        streak: 0,
        xp: 0,
        lessonsCompletedToday: 0,
        createdAt: now,
        updatedAt: now,
        // Default values for other fields
        bio: null,
        avatarUrl: null,
        phone: null,
        birthDate: null,
        role: role === 'admin' ? 'admin' : 'user',
      };
    }

    return this.mapProfileToUser(data, role);
  },

  // Mapper: DB (snake_case) -> App (CamelCase)
  mapProfileToUser(dbProfile: any, authRole?: string): UserProfile {
    return {
      id: dbProfile.id,
      fullName: dbProfile.full_name || dbProfile.email?.split('@')[0] || 'User',
      email: dbProfile.email || '',
      phone: dbProfile.phone,
      bio: dbProfile.bio,
      birthDate: dbProfile.birth_date,
      streak: dbProfile.streak || 0,
      xp: dbProfile.xp || 0,
      lessonsCompletedToday: dbProfile.lessons_completed_today || 0,
      avatarUrl: dbProfile.avatar_url,
      createdAt: dbProfile.created_at || new Date().toISOString(),
      updatedAt: dbProfile.updated_at || new Date().toISOString(),
      role: authRole === 'admin' ? 'admin' : 'user',
    };
  }
};
