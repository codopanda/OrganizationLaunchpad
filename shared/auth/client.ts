import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  AuthConfig,
  AuthError,
  AuthEvent,
  AuthResult,
  AuthSession,
  AuthState,
  OAuthCredentials,
  SignInCredentials,
  SignUpCredentials,
  User,
} from './types';

type StateListener = (state: AuthState, event: AuthEvent) => void;

export class OrganizationLaunchpadAuth extends EventTarget {
  readonly config: Required<Pick<AuthConfig, 'callbackPath' | 'loginPath' | 'signupPath' | 'postLoginPath' | 'postLogoutPath'>> &
    Pick<AuthConfig, 'supabaseUrl' | 'supabaseAnonKey'>;

  readonly isConfigured: boolean;

  private readonly supabase: SupabaseClient | null;
  private state: AuthState = {
    isReady: false,
    isLoading: false,
    user: null,
    session: null,
  };

  private unsubscribe: (() => void) | null = null;

  constructor(config: AuthConfig) {
    super();

    this.config = {
      supabaseUrl: config.supabaseUrl,
      supabaseAnonKey: config.supabaseAnonKey,
      callbackPath: config.callbackPath ?? '/auth/callback',
      loginPath: config.loginPath ?? '/login',
      signupPath: config.signupPath ?? '/signup',
      postLoginPath: config.postLoginPath ?? '/dashboard',
      postLogoutPath: config.postLogoutPath ?? '/',
    };

    this.isConfigured = Boolean(this.config.supabaseUrl && this.config.supabaseAnonKey);
    this.supabase = this.isConfigured
      ? createClient(this.config.supabaseUrl, this.config.supabaseAnonKey)
      : null;
  }

  init(): void {
    if (!this.supabase || this.unsubscribe) {
      this.markReady();
      return;
    }

    this.setLoading(true);

    this.supabase.auth.getSession().then(({ data }) => {
      this.setState(this.mapSession(data.session), 'INITIAL_SESSION');
    }).finally(() => {
      this.setLoading(false);
      this.markReady();
    });

    const { data } = this.supabase.auth.onAuthStateChange((event, session) => {
      this.setState(this.mapSession(session), this.mapAuthEvent(event));
    });

    this.unsubscribe = () => data.subscription.unsubscribe();
  }

  destroy(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  getState(): AuthState {
    return { ...this.state };
  }

  onAuthStateChange(callback: (event: AuthEvent, session: AuthSession | null) => void): () => void {
    return this.subscribe((state, event) => {
      callback(event, state.session);
    });
  }

  subscribe(listener: StateListener): () => void {
    const wrapped = (event: Event) => {
      const detail = (event as CustomEvent<{ state: AuthState; event: AuthEvent }>).detail;
      listener(detail.state, detail.event);
    };

    this.addEventListener('change', wrapped as EventListener);
    listener(this.getState(), 'INITIAL_SESSION');

    return () => this.removeEventListener('change', wrapped as EventListener);
  }

  async signUp(credentials: SignUpCredentials): Promise<AuthResult> {
    if (!this.supabase) {
      return this.notConfigured();
    }

    this.setLoading(true);

    try {
      const { data, error } = await this.supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        ...(credentials.options && {
          options: {
            ...(credentials.options.emailRedirectTo && {
              emailRedirectTo: credentials.options.emailRedirectTo,
            }),
            ...(credentials.options.data && { data: credentials.options.data }),
          },
        }),
      });

      if (error) {
        return { user: null, session: null, error: this.mapError(error, 400) };
      }

      return {
        user: this.mapUser(data.user),
        session: this.mapSession(data.session),
        error: null,
      };
    } finally {
      this.setLoading(false);
    }
  }

  async signIn(credentials: SignInCredentials): Promise<AuthResult> {
    if (!this.supabase) {
      return this.notConfigured();
    }

    this.setLoading(true);

    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return { user: null, session: null, error: this.mapError(error, 401) };
      }

      return {
        user: this.mapUser(data.user),
        session: this.mapSession(data.session),
        error: null,
      };
    } finally {
      this.setLoading(false);
    }
  }

  async signInWithOAuth(credentials: OAuthCredentials): Promise<AuthResult> {
    if (!this.supabase) {
      return this.notConfigured();
    }

    this.setLoading(true);

    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: credentials.provider,
        ...(credentials.options && {
          options: {
            ...(credentials.options.redirectTo && { redirectTo: credentials.options.redirectTo }),
            ...(credentials.options.scopes && { scopes: credentials.options.scopes }),
          },
        }),
      });

      if (error) {
        return { user: null, session: null, error: this.mapError(error, 400) };
      }

      return {
        user: null,
        session: data.url
          ? {
              access_token: data.url,
              refresh_token: '',
              expires_in: 0,
              expires_at: 0,
              user: null,
            }
          : null,
        error: null,
      };
    } finally {
      this.setLoading(false);
    }
  }

  async signOut(): Promise<{ error: AuthError | null }> {
    if (!this.supabase) {
      return { error: this.notConfigured().error };
    }

    this.setLoading(true);

    try {
      const { error } = await this.supabase.auth.signOut();
      return { error: error ? this.mapError(error, 400) : null };
    } finally {
      this.setLoading(false);
    }
  }

  async getSession(): Promise<{ session: AuthSession | null }> {
    if (!this.supabase) {
      return { session: null };
    }

    const { data } = await this.supabase.auth.getSession();
    return { session: this.mapSession(data.session) };
  }

  async getCurrentUser(): Promise<{ user: User | null }> {
    if (!this.supabase) {
      return { user: null };
    }

    const { data } = await this.supabase.auth.getUser();
    return { user: this.mapUser(data.user) };
  }

  getCallbackUrl(): string {
    return new URL(this.config.callbackPath, window.location.origin).toString();
  }

  async finalizeAuthCallback(successPath = this.config.postLoginPath): Promise<{ error: string | null }> {
    const params = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const error = params.get('error_description') ?? params.get('error') ?? hash.get('error_description') ?? hash.get('error');

    if (error) {
      this.clearAuthUrlArtifacts();
      return { error };
    }

    const existing = await this.getSession();
    if (existing.session?.user) {
      this.clearAuthUrlArtifacts();
      this.navigate(successPath);
      return { error: null };
    }

    return await new Promise((resolve) => {
      const timeout = window.setTimeout(() => {
        unsubscribe();
        resolve({ error: 'Authentication callback timed out.' });
      }, 5000);

      const unsubscribe = this.subscribe((state, event) => {
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') && state.user) {
          window.clearTimeout(timeout);
          unsubscribe();
          this.clearAuthUrlArtifacts();
          this.navigate(successPath);
          resolve({ error: null });
        }
      });
    });
  }

  navigate(path: string): void {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  private clearAuthUrlArtifacts(): void {
    window.history.replaceState({}, '', window.location.pathname);
  }

  private notConfigured(): AuthResult {
    return {
      user: null,
      session: null,
      error: { message: 'Auth is not configured. Set VITE_PUBLIC_SUPABASE_URL and VITE_PUBLIC_SUPABASE_ANON_KEY.' },
    };
  }

  private markReady(): void {
    if (!this.state.isReady) {
      this.state = { ...this.state, isReady: true };
      this.emit('INITIAL_SESSION');
    }
  }

  private setLoading(isLoading: boolean): void {
    this.state = { ...this.state, isLoading };
    this.emit('INITIAL_SESSION');
  }

  private setState(session: AuthSession | null, event: AuthEvent): void {
    this.state = {
      isReady: true,
      isLoading: false,
      session,
      user: session?.user ?? null,
    };
    this.emit(event);
  }

  private emit(event: AuthEvent): void {
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: {
          state: this.getState(),
          event,
        },
      }),
    );
  }

  private mapUser(user: unknown): User | null {
    if (!user) return null;

    const parsed = user as {
      id: string;
      email: string;
      email_confirmed_at?: string;
      created_at: string;
      updated_at?: string;
      user_metadata?: Record<string, unknown>;
    };

    return {
      id: parsed.id,
      email: parsed.email,
      emailVerified: Boolean(parsed.email_confirmed_at),
      createdAt: parsed.created_at,
      updatedAt: parsed.updated_at ?? parsed.created_at,
      ...(parsed.user_metadata && { metadata: parsed.user_metadata }),
    };
  }

  private mapSession(session: unknown): AuthSession | null {
    if (!session) return null;

    const parsed = session as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      expires_at: number;
      user: unknown;
    };

    return {
      access_token: parsed.access_token,
      refresh_token: parsed.refresh_token,
      expires_in: parsed.expires_in,
      expires_at: parsed.expires_at,
      user: this.mapUser(parsed.user),
    };
  }

  private mapError(
    error: { message: string; status?: number | undefined; code?: string | undefined },
    fallbackStatus: number,
  ): AuthError {
    return {
      message: error.message,
      status: error.status ?? fallbackStatus,
      ...(error.code && { code: error.code }),
    };
  }

  private mapAuthEvent(event: string): AuthEvent {
    if (
      event === 'INITIAL_SESSION' ||
      event === 'SIGNED_IN' ||
      event === 'SIGNED_OUT' ||
      event === 'TOKEN_REFRESHED' ||
      event === 'USER_UPDATED'
    ) {
      return event;
    }

    return 'INITIAL_SESSION';
  }
}

let defaultAuth: OrganizationLaunchpadAuth | null = null;

export function configureOrganizationLaunchpadAuth(config: AuthConfig): OrganizationLaunchpadAuth {
  defaultAuth = new OrganizationLaunchpadAuth(config);
  defaultAuth.init();
  return defaultAuth;
}

export function getOrganizationLaunchpadAuth(): OrganizationLaunchpadAuth {
  if (!defaultAuth) {
    throw new Error('OrganizationLaunchpad auth has not been configured.');
  }

  return defaultAuth;
}
