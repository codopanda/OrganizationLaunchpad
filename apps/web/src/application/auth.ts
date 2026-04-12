import { auth, isSupabaseConfigured } from '@/lib/auth';

export function getAuthService() {
  if (!isSupabaseConfigured) {
    throw new Error('Auth is not configured. Set VITE_PUBLIC_SUPABASE_URL and VITE_PUBLIC_SUPABASE_ANON_KEY');
  }

  return auth;
}

export const authService = isSupabaseConfigured ? auth : null;
