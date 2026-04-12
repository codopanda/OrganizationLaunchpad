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

export interface AuthResult {
  user: User | null;
  session: AuthSession | null;
  error: AuthError | null;
}

export interface AuthError {
  message: string;
  status?: number;
  code?: string;
}

export type AuthProvider = 'email' | 'google';

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

export type AuthEvent = 'INITIAL_SESSION' | 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED';

export type AuthStateCallback = (event: AuthEvent, session: AuthSession | null) => void;

export interface IAuthService {
  signUp(credentials: SignUpCredentials): Promise<AuthResult>;
  signIn(credentials: SignInCredentials): Promise<AuthResult>;
  signInWithOAuth(credentials: OAuthCredentials): Promise<AuthResult>;
  signOut(): Promise<{ error: AuthError | null }>;
  getSession(): Promise<{ session: AuthSession | null }>;
  getCurrentUser(): Promise<{ user: User | null }>;
  onAuthStateChange(callback: AuthStateCallback): () => void;
}
