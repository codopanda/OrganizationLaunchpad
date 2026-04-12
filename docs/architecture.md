# Architecture Documentation

## Overview

This project uses **Hexagonal Architecture** (also known as Ports and Adapters) as its structural foundation. This pattern keeps business logic independent from external concerns like UI frameworks, database clients, and hosting infrastructure.

The core idea is simple: **your application is at the center, surrounded by ports that define how it can be used, and adapters that implement those ports with specific technologies**.

### Why Hexagonal Architecture?

- **Testability**: Business logic can be tested without involving frameworks, databases, or browsers
- **Flexibility**: Swap out Supabase for another auth provider by creating a new adapter
- **Maintainability**: Changes to vendor SDKs don't ripple through business logic
- **Clarity**: Dependencies make explicit what depends on what

---

## Folder Structure

```
apps/web/src/
├── domain/           # Framework-free business logic
├── application/      # Use cases and port interfaces
├── adapters/         # Secondary adapter implementations
├── ui/               # Svelte components and stores
└── lib/              # Shared utilities and API client
```

```
workers/api/src/
└── index.ts          # Thin HTTP entrypoint (adapter)
```

```
infra/terraform/
├── main.tf          # Cloudflare DNS configuration
├── variables.tf     # Input variables
└── outputs.tf       # Output values
```

---

## Domain Layer

**Location**: `apps/web/src/domain/`

The domain layer contains **pure business logic with zero dependencies on frameworks, databases, or external services**.

### What belongs in domain/

- **Entities**: Objects with identity (e.g., `User`, `Order`)
- **Value Objects**: Objects defined by their attributes (e.g., `Email`, `Money`)
- **Domain Services**: Operations that don't naturally belong to a single entity
- **Business Rules**: Invariants, validation logic, calculations

### Example: Notification Store

```typescript
// apps/web/src/ui/kitchen/notification.test.ts

type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

function createNotificationStore() {
  let notifications: Notification[] = [];

  function addNotification(type: NotificationType, title: string, message: string): void {
    notifications = [{
      id: Math.random().toString(36).substring(2, 9),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
    }, ...notifications];
  }

  function getUnreadCount(): number {
    return notifications.filter((n) => !n.read).length;
  }

  return { addNotification, getUnreadCount };
}
```

This store contains **no imports** from Svelte, Supabase, or any external library. It expresses domain logic that can be tested in complete isolation.

---

## Application Layer

**Location**: `apps/web/src/application/`

The application layer defines **ports** (interfaces) that represent how the application can be driven (used). It also contains use case orchestration logic.

### Ports (Driving Adapters)

Ports are interfaces that define the contract between the application core and the outside world:

```
application/
├── ports/
│   └── driving/
│       └── IAuthService.ts    # Interface for auth operations
```

### Example: IAuthService Interface

```typescript
// apps/web/src/application/ports/driving/IAuthService.ts

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  user: User | null;
}

export interface IAuthService {
  signUp(credentials: SignUpCredentials): Promise<AuthResult>;
  signIn(credentials: SignInCredentials): Promise<AuthResult>;
  signOut(): Promise<{ error: AuthError | null }>;
  getSession(): Promise<{ session: AuthSession | null }>;
  onAuthStateChange(callback: AuthStateCallback): () => void;
}
```

### Application Service (Factory)

```typescript
// apps/web/src/application/auth.ts

import { SupabaseAuthAdapter } from '@/adapters/secondary/supabase/SupabaseAuthAdapter';
import type { IAuthService } from '@/application/ports/driving/IAuthService';

let _authService: IAuthService | null = null;

export function getAuthService(): IAuthService {
  if (!_authService) {
    if (!isSupabaseConfigured) {
      throw new Error('Auth not configured...');
    }
    _authService = new SupabaseAuthAdapter(getSupabase());
  }
  return _authService;
}
```

---

## Adapters Layer

**Location**: `apps/web/src/adapters/`

Adapters implement the ports defined in the application layer. They are the **secondary (driven) adapters** that handle external concerns.

### Adapter Types

| Type | Purpose | Example |
|------|---------|---------|
| **Primary (Driving)** | Receives requests from external actors | Svelte components calling `authService.signIn()` |
| **Secondary (Driven)** | Performs operations on external systems | `SupabaseAuthAdapter` calling Supabase API |

### Example: Supabase Auth Adapter

```typescript
// apps/web/src/adapters/secondary/supabase/SupabaseAuthAdapter.ts

import type { SupabaseClient } from '@supabase/supabase-js';
import type { IAuthService } from '@/application/ports/driving/IAuthService';

export class SupabaseAuthAdapter implements IAuthService {
  constructor(private readonly supabase: SupabaseClient) {}

  async signIn(credentials: SignInCredentials): Promise<AuthResult> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return { user: null, session: null, error: { message: error.message } };
    }

    return {
      user: this.mapUser(data.user),
      session: this.mapSession(data.session),
      error: null,
    };
  }

  private mapUser(user: unknown): User | null {
    if (!user) return null;
    const u = user as { id: string; email: string; ... };
    return {
      id: u.id,
      email: u.email,
      emailVerified: Boolean(u.email_confirmed_at),
      ...
    };
  }
}
```

This adapter:
- **Implements** `IAuthService`
- **Depends on** Supabase client
- **Maps** vendor-specific types to application types
- **Contains no business logic** - only translation and delegation

---

## UI Layer

**Location**: `apps/web/src/ui/`

The UI layer contains Svelte components that handle presentation and user interaction. Components should be **thin** - they delegate to application services and handle rendering only.

### UI Folder Structure

```
ui/
├── components/       # Reusable UI components (LoginForm, Toast, etc.)
├── pages/           # Page-level components (LoginPage, DashboardPage)
├── stores/          # Svelte 5 runes-based state management
└── kitchen/         # Feature-specific widgets with tests
```

### Example: Login Form Using Application Service

```svelte
<!-- apps/web/src/ui/components/LoginForm.svelte -->

<script lang="ts">
  import { authService } from '@/application/auth';

  let email = $state('');
  let password = $state('');

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!authService) return;

    const result = await authService.signIn({ email, password });

    if (result.error) {
      error = result.error.message;
      return;
    }

    onSuccess?.();
  }
</script>

<form onsubmit={handleSubmit}>
  <input type="email" bind:value={email} />
  <input type="password" bind:value={password} />
  <button type="submit">Sign In</button>
</form>
```

### Store Pattern

```typescript
// apps/web/src/ui/stores/auth.svelte.ts

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

export async function signIn(email: string, password: string) {
  if (!authService) return { error: { message: 'Auth not configured' } };
  state.isLoading = true;
  const result = await authService.signIn({ email, password });
  state.isLoading = false;
  return result;
}
```

---

## Dependency Rule

**Dependencies MUST point inward**. Outer layers depend on inner layers, never the reverse.

```
         ┌─────────────────────────────────────────┐
         │                  UI                      │
         │            (Svelte Components)            │
         └──────────────────┬────────────────────────┘
                          depends on
         ┌──────────────────┴────────────────────────┐
         │              Application                   │
         │         (Ports / Use Cases)               │
         └──────────────────┬────────────────────────┘
                          defines
         ┌──────────────────┴────────────────────────┐
         │                Domain                     │
         │        (Pure Business Logic)              │
         └───────────────────────────────────────────┘

         Adapters implement ports (point toward domain)
         UI depends on application (point toward domain)
```

### Dependency Direction Diagram

```
    ┌──────────────────────────────────────────────────────────┐
    │                                                          │
    │   ┌─────────┐         ┌─────────────┐         ┌───────┐  │
    │   │    UI   │────────▶│ Application │────────▶│ Domain│  │
    │   └─────────┘         └─────────────┘         └───────┘  │
    │                            ▲                           ▲  │
    │                            │                           │  │
    │   ┌─────────────┐          │ defines                   │  │
    │   │  Adapters   │──────────┘                           │  │
    │   │ (Secondary) │                                      │  │
    │   └─────────────┘                                      │  │
    │                            implements                  │  │
    │                                                          │
    └──────────────────────────────────────────────────────────┘
```

### This Means

| Direction | Allowed | Example |
|-----------|--------|---------|
| UI → Application | Yes | `LoginForm` calls `authService.signIn()` |
| Application → Domain | Yes | Use cases use domain entities |
| Application → Adapters | No | Application defines ports, adapters implement them |
| Domain → Anywhere | No | Domain is pure, no external imports |

---

## Example: Authentication Flow

Here's how a sign-in request flows through all layers:

### 1. UI Layer (User Action)

```svelte
<!-- apps/web/src/ui/components/LoginForm.svelte -->

const result = await authService.signIn({ email, password });
```

### 2. Application Port (Interface)

```typescript
// apps/web/src/application/ports/driving/IAuthService.ts

export interface IAuthService {
  signIn(credentials: SignInCredentials): Promise<AuthResult>;
}
```

### 3. Application Service (Factory)

```typescript
// apps/web/src/application/auth.ts

export const authService = isSupabaseConfigured
  ? getAuthService()
  : null;  // Returns SupabaseAuthAdapter implementation
```

### 4. Secondary Adapter (Supabase Implementation)

```typescript
// apps/web/src/adapters/secondary/supabase/SupabaseAuthAdapter.ts

export class SupabaseAuthAdapter implements IAuthService {
  async signIn(credentials: SignInCredentials): Promise<AuthResult> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
    // Map vendor response to application types
    return { user: this.mapUser(data.user), session: this.mapSession(data.session), error: null };
  }
}
```

### Flow Diagram

```
User clicks "Sign In"
        │
        ▼
┌───────────────────┐
│  LoginForm.svelte │  (UI Layer)
│  authService.si.. │  ◀── Interface reference
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ IAuthService      │  (Application Layer - Port)
│ .signIn()         │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ SupabaseAuth      │  (Adapters Layer - Secondary Adapter)
│ Adapter           │
│ .signIn()         │
└───────────────────┘
        │
        ▼
   Supabase API
```

---

## Testing Strategy

Tests are structured to verify each layer in isolation.

### Domain Layer Tests

**Purpose**: Verify business logic is correct
**Tool**: Vitest
**Location**: `src/**/*.test.ts`
**Approach**: Pure unit tests with no mocks needed

```typescript
// apps/web/src/ui/kitchen/notification.test.ts

describe('Notification State Management', () => {
  let store: NotificationStore;

  beforeEach(() => {
    store = createNotificationStore();
  });

  it('should add a notification to the beginning of the list', () => {
    store.addNotification('info', 'Test Title', 'Test message');
    expect(store.notifications.length).toBe(1);
    expect(store.notifications[0]!.title).toBe('Test Title');
  });

  it('should count only unread notifications', () => {
    store.addNotification('info', 'Unread 1', 'Message');
    store.addNotification('info', 'Unread 2', 'Message');
    expect(store.getUnreadCount()).toBe(2);
  });
});
```

### Application Layer Tests

**Purpose**: Verify use case orchestration and port contracts
**Tool**: Vitest with mocked adapters
**Location**: `src/**/*.test.ts`
**Approach**: Test the application service with in-memory or mock adapters

```typescript
// Example: Testing with a mock adapter
import { MockAuthAdapter } from '@/test/mocks/MockAuthAdapter';

const mockAdapter = new MockAuthAdapter();
mockAdapter.setupSignInSuccess({ user: { id: '1', email: 'test@example.com' } });

const service = getAuthService(mockAdapter);
const result = await service.signIn({ email: 'test@example.com', password: 'password' });

expect(result.user?.email).toBe('test@example.com');
```

### Adapter Layer Tests

**Purpose**: Verify adapter correctly translates to/from vendor types
**Tool**: Vitest (may use MSW for HTTP mocking)
**Approach**: Test mapping functions and integration with vendor SDKs

### UI Layer Tests

**Purpose**: Verify components render correctly and call services
**Tool**: Vitest + Svelte Testing Library
**Location**: `src/ui/**/*.test.ts`

```typescript
// apps/web/src/ui/kitchen/alarm.test.ts

describe('Alarm Timer Logic', () => {
  function formatTime(totalSeconds: number): string {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  it('should format seconds under 60 correctly', () => {
    expect(formatTime(30)).toBe('00:30');
    expect(formatTime(59)).toBe('00:59');
  });
});
```

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run e2e tests
npm run test:e2e
```

### Vitest Configuration

```typescript
// apps/web/vitest.config.ts

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/domain/**', 'src/application/**', 'src/adapters/**', 'src/lib/**'],
      exclude: ['src/**/*.d.ts', 'src/test/**', 'src/main.ts'],
    },
  },
});
```

---

## Infrastructure

### Cloudflare Workers

Workers remain **thin** - they parse requests, handle CORS, and delegate to application services:

```typescript
// workers/api/src/index.ts

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(env, request) });
    }

    const url = new URL(request.url);
    if (request.method === 'GET' && url.pathname === '/health') {
      return jsonResponse(env, request, { ok: true, service: 'api' });
    }

    return jsonResponse(env, request, { error: 'not_found' }, 404);
  },
};
```

### Terraform

Infrastructure is code in `infra/terraform/`:

```hcl
# infra/terraform/main.tf

resource "cloudflare_record" "subdomain" {
  for_each = var.subdomain_targets

  zone_id  = var.cloudflare_zone_id
  name     = each.key
  type     = each.value.type
  content  = each.value.content
  proxied  = lookup(each.value, "proxied", true)
}
```

### Supabase

Database schema and migrations live in `supabase/migrations/`:

```sql
-- supabase/migrations/0001_initial_schema.sql

CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Summary

| Layer | Location | Purpose | Dependencies |
|-------|----------|---------|--------------|
| **Domain** | `apps/web/src/domain/` | Pure business logic | None |
| **Application** | `apps/web/src/application/` | Use cases, ports | Domain |
| **Adapters** | `apps/web/src/adapters/` | Secondary implementations | Application, Domain |
| **UI** | `apps/web/src/ui/` | Svelte components | Application |

The architecture enforces that:
- Domain has **zero** external dependencies
- Dependencies always point **inward** toward the domain
- Ports define contracts, adapters provide implementations
- UI components remain thin and delegate to application services
