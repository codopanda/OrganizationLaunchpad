import { isSupabaseConfigured, getSupabase } from '@/lib/supabase';
import { SupabaseAuthAdapter } from '@/adapters/secondary/supabase/SupabaseAuthAdapter';
import type { IAuthService } from '@/application/ports/driving/IAuthService';

let _authService: IAuthService | null = null;

export function getAuthService(): IAuthService {
  if (!_authService) {
    if (!isSupabaseConfigured) {
      throw new Error('Auth is not configured. Set VITE_PUBLIC_SUPABASE_URL and VITE_PUBLIC_SUPABASE_ANON_KEY');
    }
    _authService = new SupabaseAuthAdapter(getSupabase());
  }
  return _authService;
}

export const authService = isSupabaseConfigured ? getAuthService() : null;
