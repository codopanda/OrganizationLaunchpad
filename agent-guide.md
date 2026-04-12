# OrganizationLaunchpad — Agent Guide

Help a non-technical user own and deploy their web app using OrganizationLaunchpad.

## Step 1 — Check GitHub Setup

Ask the user:

> "Do you already have a GitHub account?"

- **Yes** → confirm they can push to GitHub (ask them to visit `github.com` and log in)
- **No** → help them create one at `https://github.com/signup`, then come back

## Step 2 — Clone the Repo

Once GitHub is confirmed, run:

```bash
git clone https://github.com/codopanda/OrganizationLaunchpad.git .
```

Warn the user first:

> "This will copy the launchpad template into your current folder. Your existing files will remain — we'll add to them, not overwrite anything important."

If the folder is not empty, ask them to confirm before proceeding.

## Step 3 — Choose Your Path

Ask the user:

> "Which best describes what you want?"

- **Test the reference app first** — verify the repo works before attaching your own app
- **Attach auth to my existing app** — you have a frontend already and want to add auth with minimal changes

---

## Path A: Test the Reference App First

### 3A.1 — Run Supabase Setup

#### Create a Supabase Project

1. Open `https://supabase.com` → **New Project**
2. Name: `organization-launchpad`
3. Database Password: Generate and save securely
4. Region: Choose closest to your users
5. Click **Create new project** — wait ~60 seconds

#### Get API Keys

1. Go to **Project Settings** → **API**
2. Copy into `.env.local`:
   | Variable | Value |
   |---|---|
   | `VITE_PUBLIC_SUPABASE_URL` | Project URL |
   | `VITE_PUBLIC_SUPABASE_ANON_KEY` | anon public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role key (keep secret!) |

#### Configure Authentication

1. Go to **Authentication** → **Providers** → **Email**
2. Enable **Enable Email**, **Confirm email**: ON, **Allow new users to sign up**: ON

#### Configure Site URL

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `http://localhost:5173`
3. Add **Redirect URLs**:
   ```
   http://localhost:5173/login
   http://localhost:5173/signup
   http://localhost:5173/dashboard
   http://localhost:5173/auth/callback
   ```

#### Run Database Migrations

```bash
npm install -g supabase
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

Current migrations: `0001_initial_schema.sql`, `0002_profiles_trigger.sql`, `0004_storage_buckets.sql`

### 3A.2 — Set Up Google OAuth (Recommended)

#### Create a Google Cloud Project

1. Open `https://console.cloud.google.com`
2. Create a new project (or use existing)
3. Go to **APIs & Services** → **OAuth consent screen**
4. Select **External** → **Create**
5. App name: `OrganizationLaunchpad`
6. Add scopes: `email`, `profile`, `openid`
7. Add test users (for development)
8. Click **Save and Continue**

#### Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `OrganizationLaunchpad Web`
5. **Authorized redirect URIs**: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
6. Click **Create** and copy the **Client ID** and **Client Secret**

#### Enable in Supabase

1. Go to Supabase → **Authentication** → **Providers** → **Google**
2. Enable **Sign in with Google** and paste the Client ID + Secret

### 3A.3 — Local Verification

```bash
npm install
npm run dev:web
```

Verify: `/`, `/login`, `/signup`, `/dashboard`

- **Without Supabase config:** public pages render, dashboard shows auth guard
- **With Supabase config:** email/password and OAuth work, protected content visible after login

### 3A.4 — Push to GitHub

```bash
git init && git add . && git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-org/organization-launchpad.git
git push -u origin main
```

Add these to **GitHub repo Settings → Secrets and variables → Actions**:

| Secret                     | Value                               |
| -------------------------- | ----------------------------------- |
| `CLOUDFLARE_API_TOKEN`     | Cloudflare API token                |
| `CLOUDFLARE_ACCOUNT_ID`    | Cloudflare account ID               |
| `SUPABASE_ACCESS_TOKEN`    | Supabase personal access token      |
| `SUPABASE_DB_URL`          | Postgres connection string          |
| `SUPABASE_PROJECT_REF`     | GitHub Actions variable             |
| `VITE_PUBLIC_SUPABASE_URL` | GitHub Actions variable             |
| `SUPABASE_ANON_KEY`        | GitHub secret                       |
| `STRIPE_SECRET_KEY`        | Only if using Stripe edge functions |

### 3A.5 — Cloudflare Setup

#### Create a Cloudflare API Token

1. Open `https://dash.cloudflare.com` → **My Profile** → **API Tokens**
2. Click **Create Token** → **Create Custom Token**
3. Name: `OrganizationLaunchpad`
4. Account permissions: `Cloudflare Pages: Edit`
5. Zone permissions: `Zone: Read`, `DNS: Edit` (if using Terraform)
6. Click **Create** and copy the token

#### Get Cloudflare Account ID

1. Go to **Cloudflare Dashboard** → any domain → **Account ID** in right sidebar

#### Connect to Cloudflare Pages

1. Go to `https://dash.cloudflare.com` → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
2. Authorize GitHub access
3. Select your repo
4. Configure:
   - **Framework preset**: None
   - **Build command**: `npm run build:web`
   - **Build output directory**: `apps/web/dist`
5. Click **Deploy**

#### Add Environment Variables in Cloudflare Pages

| Variable                        | Value             |
| ------------------------------- | ----------------- |
| `VITE_PUBLIC_SUPABASE_URL`      | Your Supabase URL |
| `VITE_PUBLIC_SUPABASE_ANON_KEY` | Your anon key     |

#### Update Supabase Redirect URLs

Add your Cloudflare Pages URL to **Authentication → URL Configuration → Redirect URLs**.

### 3A.6 — Verify Deployment

1. Push a commit to GitHub
2. Watch **GitHub Actions** for the build/deploy pipeline
3. Once complete, visit your Cloudflare Pages URL
4. Test sign-up with email and Google OAuth
5. Confirm callback returns to `/auth/callback` and lands on `/dashboard`

---

## Path B: Attach Auth to Your Existing App

### 3B.1 — Complete Supabase Setup

Follow [Path A.1](#3a1--run-supabase-setup) above.

### 3B.2 — Read the Integration Guide

Open `docs/add-auth-to-existing-app.md` and follow the steps to mount the shared auth shell in your app.

### 3B.3 — Verify Locally

Test `/login`, `/signup`, and `/auth/callback` in your app before deploying.

### 3B.4 — Deploy

Follow [Path A.4](#3a4--push-to-github) and [Path A.5](#3a5--cloudflare-setup) above.

---

## Troubleshooting

**App not building:** Check that `apps/<name>/package.json` has correct workspace reference and that all env vars are set.

**Auth not working:** Verify Supabase URL and anon key are correct in `.env.local`. Confirm the app's domain is configured in Supabase redirect/auth settings, and check RLS policies allow the operation.

**Users can log into one app but not another:** This is expected unless both apps are correctly configured against the same Supabase project and each app has its own valid auth redirect URLs.

**Deploy failing:** Check Cloudflare Pages build settings match the npm scripts. Ensure `apps/web/dist` exists after build.

**Database migrations not running:** Run `supabase db push` locally, or run the migration files manually in Supabase SQL Editor.
