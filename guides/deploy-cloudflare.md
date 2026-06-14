# Deploy — Cloudflare Pages

You are setting up Cloudflare Pages hosting for the user's app. Follow every step in order. Open URLs directly if your environment supports it.

---

## 1. Create a Cloudflare Account

Open `https://dash.cloudflare.com/sign-up`

The page shows sign-up fields for email and password. Tell the user:

> "I've opened the Cloudflare sign-up page. Create an account with your email, or log in if you already have one."

Wait for the user to sign up or log in. Ask them to confirm when they are on the Cloudflare dashboard.

---

## 2. Create a Pages Project

From the Cloudflare dashboard left sidebar, click **Workers & Pages**

Click **Create application** → **Pages** tab → **Connect to Git**

---

## 3. Connect Your Repository

Cloudflare will ask you to authorize GitHub or GitLab.

Click **Connect GitHub** (or GitLab).

A GitHub authorization popup opens. Click **Authorize Cloudflare Pages**.

Back on Cloudflare, your repositories appear. Find the user's repo in the list and click **Begin setup**.

---

## 4. Configure the Build

Cloudflare shows a build configuration screen. Set:

| Field | Value |
|---|---|
| **Project name** | A short name for the project (e.g. `my-app`) |
| **Production branch** | `main` (or whatever the user's primary branch is) |
| **Framework preset** | Select the matching framework from the dropdown (Next.js, SvelteKit, Vite, etc.) |
| **Build command** | Auto-filled — confirm it matches your `package.json` build script |
| **Build output directory** | Auto-filled — confirm it is `dist`, `.next`, `.svelte-kit/output`, etc. |

If the app is inside a monorepo subfolder like `apps/web`:
- Set **Root directory** to `apps/web`

---

## 5. Add Environment Variables

Scroll down to the **Environment variables (advanced)** section and expand it.

Add these placeholders now — you will fill in real values as each service is set up:

| Variable name | Value | Notes |
|---|---|---|
| `VITE_PUBLIC_SUPABASE_URL` | (fill in after Supabase step) | or `NEXT_PUBLIC_SUPABASE_URL` |
| `VITE_PUBLIC_SUPABASE_ANON_KEY` | (fill in after Supabase step) | or `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `SUPABASE_SERVICE_ROLE_KEY` | (fill in after Supabase step) | **Encrypt** this one |
| `STRIPE_PUBLISHABLE_KEY` | (fill in after Stripe step) | |
| `STRIPE_SECRET_KEY` | (fill in after Stripe step) | **Encrypt** this one |
| `STRIPE_WEBHOOK_SECRET` | (fill in after Stripe step) | **Encrypt** this one |
| `RESEND_API_KEY` | (fill in after Resend step) | **Encrypt** this one |
| `VITE_PUBLIC_POSTHOG_KEY` | (fill in after PostHog step) | or `NEXT_PUBLIC_POSTHOG_KEY` |
| `VITE_PUBLIC_POSTHOG_HOST` | `https://us.i.posthog.com` | or `NEXT_PUBLIC_POSTHOG_HOST` |

Only add variables for services the user has chosen.

To encrypt a variable: after typing the value, click **Encrypt** next to it.

---

## 6. Deploy

Click **Save and Deploy**.

Cloudflare shows a build log. Wait for it to finish — usually 1–3 minutes.

When complete, Cloudflare shows a `.pages.dev` URL like `my-app.pages.dev`. Click it to confirm the site loads.

Tell the user: "Your app is live at [URL]. We'll come back here to fill in environment variables as we set up each service."

---

## 7. Note Your Deployment URL

Record the `.pages.dev` URL. You will need it when configuring:
- Supabase redirect URLs (auth callbacks)
- Stripe webhook endpoints
- Resend sending domain verification

---

## How to Update Environment Variables Later

Every time a new service is set up, return here to paste the new keys:

1. Go to `https://dash.cloudflare.com`
2. Click **Workers & Pages** → click your project
3. Click **Settings** → **Environment variables** → **Add variable** or edit the existing placeholder
4. After saving, go to **Deployments** → click **Retry deployment** on the latest deployment

The retry picks up the new variables.
