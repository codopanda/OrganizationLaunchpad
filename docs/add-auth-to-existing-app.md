# Add Auth To An Existing App

This repo now exposes a shared auth shell in `shared/auth` so login does not need to live inside a specific example app.

Read [setup-guide.md](./setup-guide.md) first to verify the reference app works before attaching auth to your own app.

If you are creating a brand-new app rather than adapting an existing one, start from `templates/vanilla-auth-app` instead.

## What You Reuse

- `shared/auth/client.ts` for Supabase auth client and session state
- `shared/auth/elements.ts` for portable login/signup/callback/guard UI via Web Components
- `apps/web/src/lib/auth.ts` as the reference bootstrap

## Minimal Integration Contract

For an arbitrary frontend app, the lowest-friction path is:

1. Set `VITE_PUBLIC_SUPABASE_URL` and `VITE_PUBLIC_SUPABASE_ANON_KEY`
2. Configure shared auth once at app startup
3. Register the shared auth custom elements
4. Expose three auth routes:
   - `/login`
   - `/signup`
   - `/auth/callback`
5. Wrap protected app content with the auth guard or redirect unauthenticated users to `/login`

## Reference Bootstrap

```ts
import {
  configureOrganizationLaunchpadAuth,
  defineOrganizationLaunchpadAuthElements,
} from '../shared/auth';

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

## Suggested Agent Prompt

Use something this specific when asking an agent to wire auth into an imported app:

```text
Attach OrganizationLaunchpad shared auth to this app.
Keep the existing app UI intact.
Add /login, /signup, and /auth/callback routes.
Protect only the authenticated area and redirect unauthenticated users to /login.
Use shared/auth for session handling and the portable auth elements for the auth screens.
```

## Reference UI Mounting

```html
<organization-launchpad-auth-form mode="login" success-path="/dashboard"></organization-launchpad-auth-form>
<organization-launchpad-auth-form mode="signup" success-path="/dashboard"></organization-launchpad-auth-form>
<organization-launchpad-auth-callback success-path="/dashboard" fallback-path="/login"></organization-launchpad-auth-callback>

<organization-launchpad-auth-guard heading="App Access" message="Sign in to continue.">
  <!-- protected app UI -->
</organization-launchpad-auth-guard>
```

## Why This Is Non-Intrusive

- The app keeps its own framework, routes, and business logic
- Auth state and Supabase session handling live in one shared place
- The app can adopt the shared UI as-is or later replace it with framework-native screens
- The protected/public boundary is explicit and small

## Current Limitation

The shared auth UI is framework-neutral through Web Components, but route wiring is still app-specific. Each app needs a minimal router or route switch that renders the auth screens.
