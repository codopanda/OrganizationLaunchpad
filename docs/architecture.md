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

## Shared Auth Layer

**Location**: `shared/auth/`

Authentication now lives in a shared framework-agnostic shell instead of app-local adapters and ports.

### What Lives Here

```
shared/auth/
├── client.ts      # Supabase-backed auth client and session state
├── elements.ts    # Portable Web Component auth UI
├── index.ts       # Public exports
└── types.ts       # Shared auth types
```

### Example: Shared Auth Bootstrap

```typescript
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
  postLoginPath: '/dashboard',
  postLogoutPath: '/',
});

defineOrganizationLaunchpadAuthElements();
```

---

## App Integration Layer

**Location**: `apps/web/src/`

The reference app consumes the shared auth shell instead of owning its own auth implementation. In other apps, this layer is where you mount the auth routes and guard protected content.

---

## UI Layer

**Location**: `apps/web/src/ui/`

The UI layer contains Svelte components that handle presentation and user interaction. Components should be **thin** and, for auth, prefer mounting the shared auth shell instead of duplicating auth UI.

### UI Folder Structure

```
ui/
├── components/       # Reusable UI components (Toast, etc.)
├── pages/           # Page-level components (LoginPage, DashboardPage)
├── stores/          # Svelte 5 runes-based state management
└── kitchen/         # Feature-specific widgets with tests
```

### Example: Login Page Using Shared Auth Element

```svelte
<!-- apps/web/src/ui/pages/LoginPage.svelte -->

<organization-launchpad-auth-form
  mode="login"
  success-path="/dashboard"
></organization-launchpad-auth-form>
```

### Store Pattern

```typescript
// apps/web/src/ui/stores/auth.svelte.ts

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

export async function signIn(email: string, password: string) {
  if (!authClient.isConfigured) return { error: { message: 'Auth not configured' } };
  state.isLoading = true;
  const result = await authClient.signIn({ email, password });
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
| UI → Shared Auth | Yes | `LoginPage` mounts `<organization-launchpad-auth-form>` |
| Application → Domain | Yes | Use cases use domain entities |
| Shared Auth → Supabase | Yes | `shared/auth/client.ts` talks to Supabase |
| Domain → Anywhere | No | Domain is pure, no external imports |

---

## Example: Authentication Flow

Here's how sign-in works in the current repo:

1. `/login` renders the shared auth Web Component
2. The component calls `shared/auth/client.ts`
3. The shared client talks to Supabase Auth
4. Session state updates the app-local auth store
5. Protected pages use the auth guard or redirect behavior to require login

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
