import {
  configureOrganizationLaunchpadAuth,
  defineOrganizationLaunchpadAuthElements,
} from '@shared/auth';

export const auth = configureOrganizationLaunchpadAuth({
  supabaseUrl: import.meta.env.VITE_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY ?? '',
  callbackPath: '/auth/callback',
  loginPath: '/login',
  signupPath: '/signup',
  postLoginPath: '/app',
  postLogoutPath: '/',
});

defineOrganizationLaunchpadAuthElements();
