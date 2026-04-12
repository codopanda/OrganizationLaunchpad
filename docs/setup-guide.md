# OrganizationLaunchpad Setup Guide

This guide walks you through setting up the MVP: GitHub → Cloudflare Pages with Supabase Auth.

---

## Prerequisites

You'll need accounts for:

- **GitHub** — for CI/CD
- **Cloudflare** — for Pages deployment
- **Supabase** — for auth + database
- **Google Cloud** — for Google OAuth (optional but recommended)

---

## Step 1: Supabase

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Name: `organization-launchpad`
3. Database Password: Generate a strong password and save it somewhere
4. Region: Choose closest to your users
5. Click **Create new project**

### 1.2 Get API Keys

1. Go to **Project Settings** → **API**
2. Copy these values into `.env.local`:

| Variable                        | Value                                             |
| ------------------------------- | ------------------------------------------------- |
| `VITE_PUBLIC_SUPABASE_URL`      | **Project URL** (e.g., `https://xxx.supabase.co`) |
| `VITE_PUBLIC_SUPABASE_ANON_KEY` | **anon public** key                               |
| `SUPABASE_SERVICE_ROLE_KEY`     | **service_role** secret key (keep this secret!)   |

### 1.3 Configure Authentication

1. Go to **Authentication** → **Providers** → **Email**
2. Enable **Enable Email**
3. Set **Confirm email**: ON
4. Set **Allow new users to sign up**: ON

### 1.4 Configure Site URL

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `http://localhost:5173` (for local dev)
3. Set **Redirect URLs**: Add your production domain later

### 1.5 Run Database Migrations

1. Install Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link your project: `supabase link --project-ref <your-project-ref>`
4. Push migrations: `supabase db push`

Or run the SQL in `supabase/migrations/` manually via the Supabase Dashboard → **SQL Editor**.

---

## Step 2: Google OAuth (Recommended)

### 2.1 Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Go to **APIs & Services** → **OAuth consent screen**
4. Select **External** → **Create**
5. App name: `OrganizationLaunchpad`
6. Add scopes: `email`, `profile`, `openid`
7. Add test users (for development)
8. Click **Save and Continue**

### 2.2 Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `OrganizationLaunchpad Web`
5. **Authorized redirect URIs**: Add `https://<your-supabase-project>.supabase.co/auth/v1/callback`
6. Click **Create**
7. Copy the **Client ID** and **Client Secret**

### 2.3 Enable in Supabase

1. Go to Supabase → **Authentication** → **Providers** → **Google**
2. Enable **Enable Sign in with Google**
3. Paste your **Client ID** and **Client Secret**
4. Click **Save**

---

## Step 3: GitHub

### 3.1 Push to GitHub

```bash
# Create a new repo on GitHub, then:
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-org/organization-launchpad.git
git push -u origin main
```

### 3.2 Add GitHub Secrets

Go to **GitHub repo** → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Secret Name                 | Value                              |
| --------------------------- | ---------------------------------- |
| `SUPABASE_URL`              | Same as `VITE_PUBLIC_SUPABASE_URL` |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key              |
| `CLOUDFLARE_API_TOKEN`      | Cloudflare API token (see Step 4)  |
| `CLOUDFLARE_ACCOUNT_ID`     | Cloudflare account ID              |

---

## Step 4: Cloudflare

### 4.1 Create Cloudflare API Token

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **My Profile** → **API Tokens**
2. Click **Create Token** → **Create Custom Token**
3. Name: `OrganizationLaunchpad`
4. Account permissions: `Cloudflare Pages: Edit`
5. Zone permissions: `Zone: Read`, `DNS: Edit` (if using Terraform)
6. Click **Create**
7. Copy the token and add it to GitHub Secrets as `CLOUDFLARE_API_TOKEN`

### 4.2 Get Cloudflare Account ID

1. Go to **Cloudflare Dashboard** → any domain → you'll see **Account ID** in the right sidebar
2. Copy it and add to GitHub Secrets as `CLOUDFLARE_ACCOUNT_ID`

### 4.3 Connect to Cloudflare Pages

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
2. Authorize GitHub access
3. Select your repo
4. Configure build:
   - **Framework preset**: None
   - **Build command**: `npm run build`
   - **Build output directory**: `apps/web/dist`
5. Click **Deploy**

### 4.4 Configure Environment Variables

In Cloudflare Pages settings → **Environment variables**, add:

| Variable                        | Value             |
| ------------------------------- | ----------------- |
| `VITE_PUBLIC_SUPABASE_URL`      | Your Supabase URL |
| `VITE_PUBLIC_SUPABASE_ANON_KEY` | Your anon key     |

### 4.5 Update Supabase Redirect URLs

1. Go to Supabase → **Authentication** → **URL Configuration**
2. Add your Cloudflare Pages URL to **Redirect URLs**

---

## Step 5: Verify Deployment

1. Push a commit to GitHub
2. Watch **GitHub Actions** for the build/deploy pipeline
3. Once complete, visit your Cloudflare Pages URL
4. Try signing up with email and Google OAuth

---

## Troubleshooting

### Auth not working in production

- Check **Redirect URLs** in Supabase include your production URL
- Ensure `VITE_PUBLIC_SUPABASE_URL` and `VITE_PUBLIC_SUPABASE_ANON_KEY` are set in Cloudflare Pages environment variables

### Build failing

- Check GitHub Actions logs for specific errors
- Ensure `npm run build` works locally
- Verify Node.js version matches (20+)

### Database migrations not running

- Run `supabase db push` locally to apply migrations
- Or run SQL files manually in Supabase SQL Editor

---

## Next Steps

Once MVP is working, the scaffold supports:

- PostHog (analytics + error tracking)
- Stripe (payments)
- Resend (transactional email)
- Tauri (desktop app packaging)

See [AGENTS.md](AGENTS.md) for AI agent instructions on extending the scaffold.
