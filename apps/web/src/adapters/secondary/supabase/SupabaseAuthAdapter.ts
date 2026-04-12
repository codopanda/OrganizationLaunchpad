import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  IAuthService,
  AuthSession,
  AuthStateCallback,
  AuthEvent,
  User,
  AuthResult,
  SignUpCredentials,
  SignInCredentials,
  OAuthCredentials,
  AuthError,
} from '@/application/ports/driving/IAuthService';

export class SupabaseAuthAdapter implements IAuthService {
  constructor(private readonly supabase: SupabaseClient) {}

  async signUp(credentials: SignUpCredentials): Promise<AuthResult> {
    const { data, error } = await this.supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      ...(credentials.options && {
        options: {
          ...(credentials.options.emailRedirectTo && { emailRedirectTo: credentials.options.emailRedirectTo }),
          ...(credentials.options.data && { data: credentials.options.data }),
        },
      }),
    });

    if (error) {
      return {
        user: null,
        session: null,
        error: { message: error.message, status: error.status ?? 400, ...(error.code && { code: error.code }) },
      };
    }

    return {
      user: this.mapUser(data.user),
      session: this.mapSession(data.session),
      error: null,
    };
  }

  async signIn(credentials: SignInCredentials): Promise<AuthResult> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return {
        user: null,
        session: null,
        error: { message: error.message, status: error.status ?? 401, ...(error.code && { code: error.code }) },
      };
    }

    return {
      user: this.mapUser(data.user),
      session: this.mapSession(data.session),
      error: null,
    };
  }

  async signInWithOAuth(credentials: OAuthCredentials): Promise<AuthResult> {
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
      return {
        user: null,
        session: null,
        error: { message: error.message, status: error.status ?? 400, ...(error.code && { code: error.code }) },
      };
    }

    return {
      user: null,
      session: data.url
        ? { access_token: data.url, refresh_token: '', expires_in: 0, expires_at: 0, user: null }
        : this.mapSession(null),
      error: null,
    };
  }

  async signOut(): Promise<{ error: AuthError | null }> {
    const { error } = await this.supabase.auth.signOut();
    return {
      error: error
        ? { message: error.message, status: error.status ?? 400, ...(error.code && { code: error.code }) }
        : null,
    };
  }

  async getSession(): Promise<{ session: AuthSession | null }> {
    const { data } = await this.supabase.auth.getSession();
    return { session: this.mapSession(data.session) };
  }

  async getCurrentUser(): Promise<{ user: User | null }> {
    const { data } = await this.supabase.auth.getUser();
    return { user: this.mapUser(data.user) };
  }

  onAuthStateChange(callback: AuthStateCallback): () => void {
    const { data } = this.supabase.auth.onAuthStateChange((event, session) => {
      callback(this.mapAuthEvent(event as AuthEvent), this.mapSession(session));
    });
    return () => data.subscription.unsubscribe();
  }

  private mapUser(user: unknown): User | null {
    if (!user) return null;
    const u = user as {
      id: string;
      email: string;
      email_confirmed_at?: string;
      created_at: string;
      updated_at?: string;
      user_metadata?: Record<string, unknown>;
    };
    return {
      id: u.id,
      email: u.email,
      emailVerified: Boolean(u.email_confirmed_at),
      createdAt: u.created_at,
      updatedAt: u.updated_at ?? u.created_at,
      ...(u.user_metadata && { metadata: u.user_metadata }),
    };
  }

  private mapSession(session: unknown): AuthSession | null {
    if (!session) return null;
    const s = session as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      expires_at: number;
      user: unknown;
    };
    return {
      access_token: s.access_token,
      refresh_token: s.refresh_token,
      expires_in: s.expires_in,
      expires_at: s.expires_at,
      user: this.mapUser(s.user),
    };
  }

  private mapAuthEvent(event: string): AuthEvent {
    const eventMap: Record<string, AuthEvent> = {
      INITIAL_SESSION: 'INITIAL_SESSION',
      SIGNED_IN: 'SIGNED_IN',
      SIGNED_OUT: 'SIGNED_OUT',
      TOKEN_REFRESHED: 'TOKEN_REFRESHED',
      USER_UPDATED: 'USER_UPDATED',
    };
    return eventMap[event] ?? 'INITIAL_SESSION';
  }
}
