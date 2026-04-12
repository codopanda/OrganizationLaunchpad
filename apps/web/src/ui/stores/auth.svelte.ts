import { auth as authClient } from '@/lib/auth';
import type { User, AuthSession } from '@shared/auth';

interface AuthState {
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

let state = $state<AuthState>({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
});

let unsubscribe: (() => void) | null = null;

function setAuth(session: AuthSession | null) {
  state.session = session;
  state.user = session?.user ?? null;
  state.isAuthenticated = session?.user !== null;
  state.isLoading = false;
}

export function initAuth() {
  if (unsubscribe) return;
  if (!authClient.isConfigured) {
    state.isLoading = false;
    return;
  }

  authClient.getSession().then(({ session }) => {
    setAuth(session);
  });

  unsubscribe = authClient.onAuthStateChange((_event, session) => {
    setAuth(session);
  });
}

export function destroyAuth() {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
}

export const auth = {
  get user() {
    return state.user;
  },
  get session() {
    return state.session;
  },
  get isAuthenticated() {
    return state.isAuthenticated;
  },
  get isLoading() {
    return state.isLoading;
  },
};

export async function signIn(email: string, password: string) {
  if (!authClient.isConfigured) return { error: { message: 'Auth not configured' } };
  state.isLoading = true;
  const result = await authClient.signIn({ email, password });
  state.isLoading = false;
  return result;
}

export async function signUp(email: string, password: string, options?: { emailRedirectTo?: string; data?: Record<string, unknown> }) {
  if (!authClient.isConfigured) return { error: { message: 'Auth not configured' } };
  state.isLoading = true;
  const result = await authClient.signUp({ email, password, options: options ?? {} });
  state.isLoading = false;
  return result;
}

export async function signOut() {
  if (!authClient.isConfigured) return { error: { message: 'Auth not configured' } };
  state.isLoading = true;
  const result = await authClient.signOut();
  state.isLoading = false;
  return result;
}

export async function signInWithGoogle(redirectTo?: string) {
  if (!authClient.isConfigured) return { error: { message: 'Auth not configured' } };
  return authClient.signInWithOAuth({
    provider: 'google',
    options: redirectTo ? { redirectTo } : {},
  });
}
