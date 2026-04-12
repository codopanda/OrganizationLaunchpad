import {
  configureOrganizationLaunchpadAuth,
  defineOrganizationLaunchpadAuthElements,
  getOrganizationLaunchpadAuth,
} from '@shared/auth';

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const auth = configureOrganizationLaunchpadAuth({
  supabaseUrl,
  supabaseAnonKey,
  callbackPath: '/auth/callback',
  loginPath: '/login',
  signupPath: '/signup',
  postLoginPath: '/dashboard',
  postLogoutPath: '/',
});

defineOrganizationLaunchpadAuthElements();

export const isSupabaseConfigured = auth.isConfigured;

export const getAuth = getOrganizationLaunchpadAuth;
