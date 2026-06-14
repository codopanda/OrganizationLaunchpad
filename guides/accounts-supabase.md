# Accounts — Supabase

You are setting up Supabase for user authentication and a database. Follow every step in order. Open URLs directly if your environment supports it.

---

## 1. Create a Supabase Account

Open `https://supabase.com`

Click **Start your project** in the top right.

The page shows sign-up options. Tell the user:

> "I've opened Supabase. Sign up with GitHub for the fastest setup, or use email if you prefer."

Wait for them to sign up or log in.

---

## 2. Create a New Project

After logging in, the Supabase dashboard shows your organizations and projects.

Click **New project**.

Fill in:

| Field | Value |
|---|---|
| **Name** | Your app name (e.g. `my-app`) |
| **Database Password** | Click **Generate a password** — copy this and save it somewhere safe |
| **Region** | Choose the region closest to your users |
| **Pricing Plan** | Free tier is fine to start |

Click **Create new project**.

Wait 60–90 seconds while the project provisions. The page will show a loading spinner.

---

## 3. Copy Your API Keys

Once the project is ready, you land on the project home page.

Click **Project Settings** in the left sidebar (the gear icon at the bottom).

Click **API** in the settings menu.

You will see:

| What you see | Variable name | Where it goes |
|---|---|---|
| **Project URL** | `VITE_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL` | Deploy platform + `.env.local` |
| **anon public** key | `VITE_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Deploy platform + `.env.local` |
| **service_role** key | `SUPABASE_SERVICE_ROLE_KEY` | Deploy platform only (never expose to browser) |

Click the **copy icon** next to each value and paste them into your deploy platform's environment variables now (Vercel or Cloudflare — you set these up earlier).

Also add them to `.env.local` in your project root for local development:

```
VITE_PUBLIC_SUPABASE_URL=https://your-ref.supabase.co
VITE_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

> Never commit `.env.local` to git. Check that `.env.local` is listed in `.gitignore`.

---

## 4. Enable Email Authentication

In the left sidebar, click **Authentication**.

Click **Providers**.

Click **Email** in the providers list.

Make sure these are set:

| Setting | Value |
|---|---|
| **Enable Email provider** | On |
| **Confirm email** | On (users must verify their email before logging in) |
| **Allow new users to sign up** | On |

Click **Save**.

---

## 5. Set Redirect URLs

Still in **Authentication**, click **URL Configuration**.

Set **Site URL** to your deployed app URL (from the deploy step), for example:
`https://my-app.vercel.app`

Under **Redirect URLs**, add:

```
https://your-app-url.com/auth/callback
https://your-app-url.com
http://localhost:3000/auth/callback
http://localhost:3000
http://localhost:5173/auth/callback
http://localhost:5173
```

Replace `your-app-url.com` with the URL from your deploy platform. Add all of them — Supabase checks that the callback URL exactly matches one of these.

Click **Save**.

---

## 6. Set Up Google OAuth (Optional)

Ask the user:

> "Do you want users to be able to sign in with Google? This takes about 5 minutes."

If yes, continue. If no, skip to Step 7.

### 6a. Create a Google Cloud Project

Open `https://console.cloud.google.com`

If this is the user's first time, Google will prompt them to create a project. 

Click **Select a project** at the top → **New Project**.

| Field | Value |
|---|---|
| **Project name** | Your app name |

Click **Create**.

### 6b. Configure the OAuth Consent Screen

In the left sidebar, click **APIs & Services** → **OAuth consent screen**.

Select **External** → click **Create**.

Fill in:

| Field | Value |
|---|---|
| **App name** | Your app name |
| **User support email** | The user's email |
| **Developer contact information** | The user's email |

Click **Save and Continue** through the Scopes and Test Users screens without changing anything.

Click **Back to Dashboard**.

### 6c. Create OAuth Credentials

In the left sidebar, click **APIs & Services** → **Credentials**.

Click **Create Credentials** → **OAuth client ID**.

| Field | Value |
|---|---|
| **Application type** | Web application |
| **Name** | Your app name |
| **Authorized redirect URIs** | `https://your-ref.supabase.co/auth/v1/callback` |

To find your Supabase redirect URI: go back to Supabase → **Authentication** → **Providers** → **Google** — the URI is shown there.

Click **Create**.

A popup shows your **Client ID** and **Client Secret**. Copy both.

### 6d. Enable Google in Supabase

Back in Supabase, go to **Authentication** → **Providers** → **Google**.

Toggle **Enable Sign in with Google** to On.

Paste the **Client ID** and **Client Secret** from Google.

Click **Save**.

---

## 7. Install the Supabase Client

In the user's project directory, run:

```bash
npm install @supabase/supabase-js
```

Create a Supabase client file. Find the right location based on the user's framework:
- Next.js: `lib/supabase.ts` or `utils/supabase/client.ts`
- Vite/SvelteKit: `src/lib/supabase.ts`
- Other: `src/supabase.ts`

Write this to that file:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL 
  ?? process.env.NEXT_PUBLIC_SUPABASE_URL 
  ?? ''
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY 
  ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
  ?? ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

Adjust the env var names to match the user's framework (Vite uses `import.meta.env`, Next.js uses `process.env`).

---

## 8. Verify

Confirm with the user that they can:
- See their project in `https://supabase.com/dashboard`
- See the API keys in Project Settings → API
- See the environment variables set in their deploy platform

Tell them: "Supabase is ready. Any user who signs up through your app will appear in Authentication → Users in the Supabase dashboard."
