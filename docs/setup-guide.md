# Setup Guide

Use this guide when you want to test OrganizationLaunchpad yourself or hand it to another tester.

## Choose Your Path

1. Test the reference app in `apps/web`
2. Create a brand-new app from the framework-neutral starter
3. Attach auth to an existing app

## Shared Supabase Setup

1. Create a Supabase project
2. Copy these values into `.env.local`:
   - `VITE_PUBLIC_SUPABASE_URL`
   - `VITE_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Enable Email auth in Supabase
4. Add these redirect URLs:

```text
http://localhost:5173/login
http://localhost:5173/signup
http://localhost:5173/dashboard
http://localhost:5173/auth/callback
```

5. Run migrations:

```bash
npm install -g supabase
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

Canonical migration baseline:

- `0001_initial_schema.sql`
- `0002_profiles_trigger.sql`
- `0004_storage_buckets.sql`

## Google OAuth With Supabase

Use this when you want the shared login UI to support “Continue with Google”.

1. Open Google Cloud Console and create or select a project
2. Go to **APIs & Services** → **OAuth consent screen**
3. Create an **External** consent screen
4. Set the app name, support email, and developer contact email
5. Add scopes for:
   - `email`
   - `profile`
   - `openid`
6. Add your own Google account as a test user while developing
7. Go to **APIs & Services** → **Credentials**
8. Create an **OAuth client ID**
9. Choose **Web application**
10. Add this redirect URI:

```text
https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
```

11. Copy the Google **Client ID** and **Client Secret**
12. Open your Supabase project
13. Go to **Authentication** → **Providers** → **Google**
14. Enable the Google provider
15. Paste the Google **Client ID** and **Client Secret**
16. Save the provider settings
17. Go to **Authentication** → **URL Configuration**
18. Make sure your app URLs are listed under **Redirect URLs**, for example:

```text
http://localhost:5173/auth/callback
http://localhost:5173/login
http://localhost:5173/signup
http://localhost:5173/dashboard
```

19. Test the flow from your app’s `/login` page

For more detail, see [docs/api-keys/google-oauth.md](./api-keys/google-oauth.md).

## Path A: Test The Reference App

```bash
npm install
npm run dev:web
```

Verify:

- `/`
- `/login`
- `/signup`
- `/dashboard`
- `/auth/callback`

## Path B: Create A New App

Create a new app from the framework-neutral starter:

```bash
npm run new:app -- my-new-app
npm install
npm run dev -w my-new-app
```

This starter comes from `templates/vanilla-auth-app` and uses plain TypeScript plus the shared auth Web Components in `shared/auth`.

Default routes:

- `/`
- `/login`
- `/signup`
- `/auth/callback`
- `/app`

## Path C: Attach Auth To An Existing App

Read [add-auth-to-existing-app.md](./add-auth-to-existing-app.md).

That path is for existing frontends where you want to preserve the current UI and only add the shared auth shell.

## Deploy Later

For deployment details, use:

- [docs/deployment.md](./deployment.md)
- [agent-guide.md](../agent-guide.md)
