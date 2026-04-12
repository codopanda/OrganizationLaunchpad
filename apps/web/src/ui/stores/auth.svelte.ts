import { authService } from '@/application/auth';
import type { User, AuthSession } from '@/application/ports/driving/IAuthService';

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
  if (!authService) {
    state.isLoading = false;
    return;
  }

  authService.getSession().then(({ session }) => {
    setAuth(session);
  });

  unsubscribe = authService.onAuthStateChange((_event, session) => {
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
  if (!authService) return { error: { message: 'Auth not configured' } };
  state.isLoading = true;
  const result = await authService.signIn({ email, password });
  state.isLoading = false;
  return result;
}

export async function signUp(email: string, password: string, options?: { emailRedirectTo?: string; data?: Record<string, unknown> }) {
  if (!authService) return { error: { message: 'Auth not configured' } };
  state.isLoading = true;
  const result = await authService.signUp({ email, password, options: options ?? {} });
  state.isLoading = false;
  return result;
}

export async function signOut() {
  if (!authService) return { error: { message: 'Auth not configured' } };
  state.isLoading = true;
  const result = await authService.signOut();
  state.isLoading = false;
  return result;
}

export async function signInWithGoogle(redirectTo?: string) {
  if (!authService) return { error: { message: 'Auth not configured' } };
  return authService.signInWithOAuth({
    provider: 'google',
    options: redirectTo ? { redirectTo } : {},
  });
}
