export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  user: User | null;
}

export interface AuthError {
  message: string;
  status?: number;
  code?: string;
}

export interface AuthResult {
  user: User | null;
  session: AuthSession | null;
  error: AuthError | null;
}

export type AuthEvent =
  | 'INITIAL_SESSION'
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED';

export interface SignUpCredentials {
  email: string;
  password: string;
  options?: {
    emailRedirectTo?: string;
    data?: Record<string, unknown>;
  };
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface OAuthCredentials {
  provider: 'google';
  options?: {
    redirectTo?: string;
    scopes?: string;
  };
}

export interface AuthState {
  isReady: boolean;
  isLoading: boolean;
  user: User | null;
  session: AuthSession | null;
}

export interface AuthConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  callbackPath?: string;
  loginPath?: string;
  signupPath?: string;
  postLoginPath?: string;
  postLogoutPath?: string;
}
