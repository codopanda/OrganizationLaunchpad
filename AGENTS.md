# AGENTS.md — AI Agent Instructions

This document helps AI agents understand and work with OrganizationLaunchpad.

## Project Overview

**What it is:** A production shell for AI-generated apps. Users clone this repo, drop in their frontend, and get auth, analytics, and deployment pre-wired.

**Auth model:** Multiple apps can share one Supabase project. User identity is shared through the same `auth.users` records, but browser sessions are app/domain-specific, so each app may require its own login.

**Portable auth shell:** Shared auth code belongs in `shared/auth`, not inside any individual app. Example apps should consume that shell rather than owning auth UI and session logic directly.

**The flow:**

1. User clones the repo
2. Drops/creates their app in `apps/`
3. Connects Supabase + Cloudflare
4. Pushes to GitHub → auto-deploys to Cloudflare Pages

---

## Core Concepts

### Monorepo Structure

```
apps/              # User apps (drop-ins)
  └── web/         # Default web app
      ├── src/
      │   ├── domain/       # Business logic (framework-free)
      │   ├── application/  # Use cases, ports (interfaces)
      │   ├── adapters/     # Vendor implementations
      │   └── ui/           # Svelte components
      └── src-tauri/        # Optional desktop shell
supabase/
  ├── functions/            # Edge Functions (backend logic)
  └── migrations/           # Auth schema, RLS policies
infra/terraform/            # Cloudflare DNS
```

### Adapter Pattern

Adapters connect domain logic to vendor services. They must be **framework-agnostic**.

```
src/
  application/
    ports/                  # Interfaces (what we need)
      auth.ts              # "I need authentication"
      analytics.ts         # "I need event tracking"
    use-cases/
      login.ts             # "Check credentials"
  adapters/
    supabase/
      auth-adapter.ts      # Implements auth port using Supabase
    posthog/
      analytics-adapter.ts # Implements analytics port using PostHog
```

**Why:** If we swap PostHog for Mixpanel, only the adapter changes. No app code touches vendor SDKs directly.

### Environment Variables

Two types of vars:

**Build-time (VITE\_\*)** — needed at frontend build:

- `VITE_PUBLIC_SUPABASE_URL`
- `VITE_PUBLIC_SUPABASE_ANON_KEY`
- `VITE_POSTHOG_API_KEY`
- `VITE_POSTHOG_HOST`

**Runtime (secrets)** — used by Edge Functions:

- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `STRIPE_SECRET_KEY`
- `CLOUDFLARE_API_TOKEN`

### Authentication Flow

Supabase Auth handles user management:

1. User signs up → Supabase creates `auth.users` entry
2. Profile record created in `public.profiles` (linked by `auth.users.id`)
3. Each app authenticates against the same Supabase project, but keeps its own session on its own origin
4. Row Level Security (RLS) enforces: "users only see their own data"
5. Frontend uses `supabase.auth` client (from adapter) — never vendor SDK directly

### Multi-App Data Model

When several apps share the same Supabase backend:

- Shared user data should be keyed by `auth.users.id`
- App-specific data should include an `app_id`, `site_id`, or equivalent scope column
- Do not assume logging into one domain logs the user into another domain
- Keep RLS policies explicit about whether data is shared across apps or scoped to a single app

### Deployment Flow

```
git push → GitHub Actions →
  npm run build →
  deploy to Cloudflare Pages →
  Supabase Edge Functions updated
```

---

## How To...

### Add a new app to `apps/`

1. Create `apps/<new-app>/`
2. Point it at the shared Supabase project unless the app truly needs isolation
3. Follow the adapter pattern (see above)
4. Reuse the same auth flow, but assume users may need to sign in separately on that app's domain
5. Add migration if you need new database tables
6. Update `.github/workflows/deploy.yml` if needed

### Wire up a new service

1. Create `src/application/ports/<service>.ts` (the interface)
2. Create `src/adapters/<vendor>/<service>.ts` (the implementation)
3. Document required env vars in `.env.example`
4. Add setup instructions in `docs/api-keys/<service>.md`

### Set up authentication for a new app

1. Ensure the app points at the shared Supabase URL and anon key
2. Initialize the shared auth shell from `shared/auth`
3. Mount shared `/login`, `/signup`, and `/auth/callback` routes or equivalent screens
4. Use sign-in flows locally within the app; do not assume session sharing across domains
5. Protect app routes/components according to that app's requirements
6. If the app needs shared user data, key tables by `auth.users.id`

### Configure analytics

1. Initialize PostHog in `src/adapters/posthog/client.ts`
2. Use `analyticsPort.track(event, properties)` to record events
3. Events flow to PostHog dashboard

### Add database tables

1. Create migration in `supabase/migrations/<timestamp>_<name>.sql`
2. Decide whether the table is shared across apps or app-specific
3. Define RLS policies for row-level security
4. Run `supabase db push` or push to GitHub to apply

### Deploy to Cloudflare Pages

1. Connect repo to Cloudflare Pages (GitHub integration)
2. Set build command: `npm run build`
3. Set output directory: `apps/web/dist`
4. Add environment variables in Cloudflare dashboard

---

## Key Files

| File                   | Purpose                           |
| ---------------------- | --------------------------------- |
| `AGENTS.md`            | This file — AI agent instructions |
| `.env.example`         | Environment variable template     |
| `supabase/config.toml` | Supabase local config             |
| `infra/terraform/`     | Cloudflare infrastructure         |
| `.github/workflows/`   | CI/CD pipeline                    |
| `apps/web/src-tauri/`  | Tauri desktop config              |

---

## Common Patterns

### Making an API call from Edge Function

```typescript
// supabase/functions/<name>/index.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  const { data } = await supabase.from('profiles').select();
  return Response.json(data);
});
```

### Using auth in frontend

```typescript
// In your use case (framework-agnostic)
import { authPort } from '../../adapters/supabase/auth';

async function login(email: string, password: string) {
  const session = await authPort.signIn(email, password);
  if (session) {
    // redirect or update UI
  }
}
```

### Tracking analytics

```typescript
// In your component or use case
import { analyticsPort } from '../../adapters/posthog/analytics';

analyticsPort.track('button_clicked', {
  button: 'signup',
  source: 'landing_page',
});
```

---

## Working with GitHub Actions

The CI pipeline:

1. Runs on every push
2. Builds the frontend (`npm run build -w web`)
3. Runs tests (`npm run test -w web`)
4. Deploys to Cloudflare Pages on success to `main` branch

Environment variables needed in GitHub Secrets:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

---

## Troubleshooting

**App not building:** Check that `apps/<name>/package.json` has correct workspace reference and that all env vars are set.

**Auth not working:** Verify Supabase URL and anon key are correct in `.env.local`. Confirm the app's domain is configured in Supabase redirect/auth settings, and check RLS policies allow the operation.

**Users can log into one app but not another:** This is expected unless both apps are correctly configured against the same Supabase project and each app has its own valid auth redirect URLs.

**Deploy failing:** Check Cloudflare Pages build settings match the npm scripts. Ensure `apps/web/dist` exists after build.

---

## Principles for AI Agents

1. **Preserve adapter pattern** — don't call vendor SDKs directly from app code
2. **Keep domain framework-free** — business logic has no imports from ui/ or adapters/
3. **One concern per file** — use cases handle business logic, adapters handle vendor integration
4. **Model shared identity explicitly** — shared tables use `auth.users.id`; app-specific tables include explicit app scoping
5. **Document changes** — if you modify infrastructure, update the relevant doc in `docs/`
6. **Test before deploy** — always run `npm run build` and `npm run test` before suggesting deployment
