# AGENTS.md — AI Agent Instructions

This document helps AI agents understand and work with OrganizationLaunchpad.

> **New to this repo?** If you haven't set up Supabase, Cloudflare, or deployed yet,
> follow the [Agent Guide](agent-guide.md) first.

---

## Project Overview

**What it is:** A production shell for AI-generated apps. Users clone this repo, drop in their frontend, and get auth, analytics, and deployment pre-wired.

**Auth model:** Multiple apps can share one Supabase project. User identity is shared through the same `auth.users` records, but browser sessions are app/domain-specific, so each app may require its own login.

**Portable auth shell:** Shared auth code belongs in `shared/auth`, not inside any individual app. Example apps should consume that shell rather than owning auth UI and session logic directly.

**Beta test target:** `apps/web` is the reference app used for first external testing. Imported apps should be integrated locally first, then promoted into CI/deploy once verified.

**The flow:**

1. User clones the repo
2. Drops/creates their app in `apps/`
3. Connects Supabase + Cloudflare
4. Pushes to GitHub → auto-deploys to Cloudflare Pages

---

## Monorepo Structure

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
shared/
  └── auth/                 # Portable auth shell (Web Components + client)
infra/terraform/            # Cloudflare DNS
```

---

## Core Concepts

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

### Select technologies for a new app

When the user asks to create, import, or scaffold an app and has not already chosen a stack, prompt them interactively before writing code. Use the closest available interactive mechanism:

- If the client supports structured prompts or quick-pick style input, ask the user to select from options.
- Otherwise, ask a concise numbered question in chat and wait for the answer.

Collect only the decisions that affect the initial scaffold:

1. App type: static site, Svelte app, React app, full-stack app, or desktop-enabled app
2. Frontend framework: default to the existing repo stack (`Svelte + Vite`) unless the user chooses otherwise
3. Styling approach: existing app styles, Tailwind, plain CSS, or another specified design system
4. Backend/data needs: Supabase-only, Cloudflare Worker/API routes, external API integration, or none
5. Auth requirement: shared auth shell, public-only app, or custom auth adapter
6. Payment provider, if payments are needed: Stripe, Every.org (`https://www.every.org/signup?redirectUrl=%2Fdeveloper&title=Sign+up`), another provider, or none
7. Deployment target: Cloudflare Pages static deploy, Pages with Functions/Workers, or local-only prototype

Keep the prompt lightweight, similar to a CLI project generator: show recommended defaults, allow "use defaults", and do not ask about choices that are already implied by the user's request. After the user selects technologies, summarize the chosen stack in the implementation plan and make the scaffold match those choices.

### Add a new app to `apps/`

1. Run the interactive technology selection step above if the stack is not already explicit
2. Create `apps/<new-app>/`
3. Point it at the shared Supabase project unless the app truly needs isolation
4. Follow the adapter pattern (see above)
5. Reuse the same auth flow, but assume users may need to sign in separately on that app's domain
6. Add migration if you need new database tables
7. Update `.github/workflows/deploy.yml` if needed

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
| `agent-guide.md`       | User-facing setup walkthrough     |
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

## Architecture Patterns

### Domain Layer

Business rules and domain models go in framework-free modules. The domain layer should not depend on:

- Svelte, Cloudflare Worker runtime APIs, Supabase client libraries, Tauri APIs, or Terraform concerns

Domain code should express: entities, value objects, use-case rules, invariants, and domain services.

### Application Layer

The application layer coordinates use cases and defines ports for:

- user repositories, session/auth services, billing providers, notification services, file storage, external API clients

Application code depends on ports, not providers.

### Adapters

Adapters implement the ports defined in the application layer. Examples:

- Supabase adapter for auth and persistence
- PostHog adapter for analytics
- Resend adapter for transactional email
- Stripe adapter for payments
- Every.org adapter or redirect flow for donation-focused payments

Adapters are the only place vendor-specific code belongs.

### Workers

Workers stay thin — they mostly:

1. Parse the request
2. Authenticate it
3. Call an application use case
4. Translate the result into an HTTP response

Do not let Workers become the place where all business logic accumulates.

### Decision Rules

- Prefer simple ports over leaking SDK types throughout the codebase
- Prefer static generation and edge-friendly deployment models
- Prefer one clear responsibility per adapter
- Prefer explicit environment variable contracts
- Prefer composition over hidden framework magic

### What to Avoid

- Business logic inside Svelte components
- Business logic inside Cloudflare request handlers
- Direct vendor SDK calls scattered across the app
- Coupling core application flow to Supabase table shapes
- Mixing deployment concerns with domain rules

### Definition of Done for New Apps

A new app is in good shape when:

- Frontend can be built as static assets
- Core use cases can be reasoned about without framework knowledge
- Worker handlers are thin
- Supabase is isolated behind clear boundaries where practical
- Infrastructure assumptions are documented and reproducible
- Required API keys and setup steps are documented in `docs/api-keys/`

---

## Principles for AI Agents

1. **Preserve adapter pattern** — don't call vendor SDKs directly from app code
2. **Keep domain framework-free** — business logic has no imports from ui/ or adapters/
3. **One concern per file** — use cases handle business logic, adapters handle vendor integration
4. **Model shared identity explicitly** — shared tables use `auth.users.id`; app-specific tables include explicit app scoping
5. **Document changes** — if you modify infrastructure, update the relevant doc in `docs/`
6. **Test before deploy** — always run `npm run build` and `npm run test` before suggesting deployment
