# Deploy — Vercel

You are setting up Vercel hosting for the user's app. Follow every step in order. Open URLs directly if your environment supports it.

---

## 1. Create a Vercel Account

Open `https://vercel.com/signup`

The page shows sign-up options. Tell the user:

> "I've opened Vercel's sign-up page. You can sign up with GitHub, GitLab, Bitbucket, or email. GitHub is recommended because it makes connecting your repo easier."

Wait for the user to sign up or log in. Ask them to confirm when they are on the Vercel dashboard.

---

## 2. Connect Your Repository

From the Vercel dashboard, click **Add New…** → **Project**

The page shows "Import Git Repository". 

If the user's repo is not listed:
- Click **Adjust GitHub App Permissions**
- On GitHub, find the repository and grant Vercel access
- Return to Vercel and refresh the list

Once the repo appears, click **Import** next to it.

---

## 3. Configure the Build

Vercel will show a configuration screen. Set:

| Field | Value |
|---|---|
| **Framework Preset** | Auto-detected (confirm it matches: Next.js, Vite, SvelteKit, etc.) |
| **Root Directory** | Leave blank unless your app is in a subfolder (e.g. `apps/web`) |
| **Build Command** | Leave as default unless your `package.json` uses a custom script |
| **Output Directory** | Leave as default |

If the app is inside a monorepo subfolder like `apps/web`:
- Click **Edit** next to Root Directory
- Type the subfolder path, e.g. `apps/web`

---

## 4. Add Environment Variables

Before clicking Deploy, click **Environment Variables** to expand that section.

Add these placeholders now — you will fill in real values as each service is set up:

| Name | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | (fill in after Supabase step) | or `VITE_PUBLIC_SUPABASE_URL` for Vite |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (fill in after Supabase step) | or `VITE_PUBLIC_SUPABASE_ANON_KEY` |
| `SUPABASE_SERVICE_ROLE_KEY` | (fill in after Supabase step) | mark as **Sensitive** |
| `STRIPE_PUBLISHABLE_KEY` | (fill in after Stripe step) | |
| `STRIPE_SECRET_KEY` | (fill in after Stripe step) | mark as **Sensitive** |
| `STRIPE_WEBHOOK_SECRET` | (fill in after Stripe step) | mark as **Sensitive** |
| `RESEND_API_KEY` | (fill in after Resend step) | mark as **Sensitive** |
| `NEXT_PUBLIC_POSTHOG_KEY` | (fill in after PostHog step) | or `VITE_PUBLIC_POSTHOG_KEY` |
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://us.i.posthog.com` | or `VITE_PUBLIC_POSTHOG_HOST` |

Only add the variables for services the user has chosen. Skip the rest.

To mark a variable as sensitive: after typing the value, click the **lock icon** or check **Sensitive** if shown.

---

## 5. Deploy

Click **Deploy**.

Vercel will show a build log. Wait for it to finish — usually 1–3 minutes.

When it completes, Vercel shows a preview URL like `your-app-abc123.vercel.app`. Click **Visit** to confirm the site loads.

Tell the user: "Your app is live at [URL]. We'll come back here to fill in environment variables as we set up each service."

---

## 6. Note Your Deployment URL

Record the URL Vercel assigned. You will need it when configuring:
- Supabase redirect URLs (auth callbacks)
- Stripe webhook endpoints
- Resend sending domain verification

---

## How to Update Environment Variables Later

Every time a new service is set up, return here to paste the new keys:

1. Go to `https://vercel.com/dashboard`
2. Click your project
3. Click **Settings** → **Environment Variables**
4. Click **Add** or edit the existing placeholder
5. After saving, go to **Deployments** → click the three-dot menu on the latest deployment → **Redeploy**

The redeployment picks up the new variables.
