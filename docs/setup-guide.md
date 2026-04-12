# Scaifold Setup Guide

This guide walks you through setting up Scaifold from scratch - all manual configurations needed across every service.

---

## Overview

Setting up Scaifold requires configuring these services:

| Service        | What You Need to Do                                       |
| -------------- | --------------------------------------------------------- |
| **Supabase**   | Create project, configure auth, run migrations            |
| **GitHub**     | Add secrets for CI/CD                                     |
| **Cloudflare** | Create Pages project, configure DNS                       |
| **Resend**     | Create API key, configure SMTP in Supabase                |
| **Stripe**     | Create API keys (optional, for payments)                  |
| **PostHog**    | Create project (optional, for error tracking + analytics) |

---

## Step 1: Supabase

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Name: `your-app`
3. Database Password: Generate a strong password and store it securely
4. Region: Choose closest to your users
5. Click **Create new project**

### 1.2 Get API Keys

1. Go to **Project Settings** → **API**
2. Copy these values:

| Variable                        | Where to Find               |
| ------------------------------- | --------------------------- |
| `VITE_PUBLIC_SUPABASE_URL`      | **Project URL** field       |
| `VITE_PUBLIC_SUPABASE_ANON_KEY` | **anon public** key         |
| `SUPABASE_SERVICE_ROLE_KEY`     | **service_role** secret key |

### 1.3 Configure Authentication

1. Go to **Authentication** → **Providers** → **Email**
2. Enable **Enable Email**
3. Set **Confirm email**: ON
4. Set **Allow new users to sign up**: ON

### 1.4 Configure Site URL

1. Go to **Authentication** → **URL Configuration**
2. Set:
   - **Site URL**: `https://yourdomain.com` (or `http://localhost:5173` for local)
   - **Redirect URLs**:
     ```
     https://yourdomain.com
     https://yourdomain.com/auth/callback
     http://localhost:5173
     http://localhost:5173/auth/callback
     ```

### 1.5 Configure Resend SMTP (Auth Emails)

1. Go to **Authentication** → **Providers** → **Email**
2. Scroll to **Custom SMTP**
3. Enable Custom SMTP and enter:
   | Field | Value |
   |-------|-------|
   | **SMTP Host** | `smtp.resend.com` |
   | **SMTP Port** | `587` |
   | **SMTP User** | `resend` |
   | **SMTP Password** | Your Resend API key |
   | **Sender Name** | Your app name |
   | **Sender Email** | `noreply@yourdomain.com` |
4. Click **Save**

### 1.6 Configure Google OAuth (Optional)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project or select existing
3. **APIs & Services** → **Library** → Search and enable **Google+ API**
4. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**
5. Application type: **Web application**
6. Authorized redirect URIs: `https://your-project-ref.supabase.co/auth/v1/callback`
7. Copy **Client ID** and **Client Secret**

Back in Supabase:

1. **Authentication** → **Providers** → **Google**
2. Enable Google
3. Paste **Client ID** and **Client Secret**
4. Click **Save**

### 1.7 Run Database Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

The migrations create:

- `profiles` table (linked to auth.users)
- `feedback` table
- RLS policies for user data isolation
- `avatars` storage bucket

---

## Step 2: Resend

### 2.1 Create a Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up with GitHub
3. Complete onboarding

### 2.2 Add Your Domain (Production)

1. **Domains** → **Add Domain**
2. Enter `yourdomain.com`
3. Add the DNS records Resend provides:

| Type | Name                | Value                               |
| ---- | ------------------- | ----------------------------------- |
| TXT  | @                   | `v=spf1 include:spf.resend.io ~all` |
| TXT  | `resend._domainkey` | (from Resend dashboard)             |

4. Click **Verify**

### 2.3 Get API Key

1. **API Keys** → **Create API Key**
2. Name: `production`
3. Permissions: **Full Access**
4. Click **Create** and copy the key immediately

Format: `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 2.4 Already Done: Configure in Supabase

You already configured Resend in Supabase Dashboard (Step 1.5 above).

---

## Step 3: Cloudflare

### 3.1 Create Pages Project

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
3. Connect your GitHub repo
4. Configure:
   - **Project name**: `web`
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Add environment variable: `NODE_VERSION`: `20`
6. Click **Save and Deploy**

### 3.2 Get Credentials

From the Cloudflare dashboard:

| Credential              | Where to Find                              |
| ----------------------- | ------------------------------------------ |
| `CLOUDFLARE_ACCOUNT_ID` | Workers & Pages → Overview → Account ID    |
| `CLOUDFLARE_API_TOKEN`  | Profile → API Tokens → Create Custom Token |

**Create API Token**:

1. **Profile** → **API Tokens** → **Create Token**
2. Use **Create Custom Token**
3. Permissions:
   - Account: Workers:Edit
   - Zone: DNS:Edit
   - Zone: Zone:Read
4. Click **Create Token**

### 3.3 Configure DNS with Terraform

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`:

```hcl
cloudflare_api_token = "your-cloudflare-api-token"
cloudflare_zone_id   = "your-zone-id"

subdomain_targets = {
  web = {
    type    = "CNAME"
    content = "your-app.pages.dev"
    proxied = true
  }
}
```

Apply:

```bash
terraform init
terraform apply
```

---

## Step 4: GitHub Secrets and Variables

Go to your GitHub repo → **Settings** → **Secrets and Variables** → **Actions**

### Secrets (Private)

| Secret                  | Value                                            |
| ----------------------- | ------------------------------------------------ |
| `CLOUDFLARE_API_TOKEN`  | From Cloudflare (Step 3.2)                       |
| `CLOUDFLARE_ACCOUNT_ID` | From Cloudflare (Step 3.2)                       |
| `SUPABASE_ACCESS_TOKEN` | From supabase.com → Account → Access Tokens      |
| `SUPABASE_ANON_KEY`     | `VITE_PUBLIC_SUPABASE_ANON_KEY` (safe to expose) |
| `SUPABASE_DB_URL`       | From Supabase → Settings → Connection String     |
| `STRIPE_SECRET_KEY`     | From Stripe (optional, for payments)             |

### Variables (Public)

| Variable                        | Value                                |
| ------------------------------- | ------------------------------------ |
| `VITE_PUBLIC_SUPABASE_URL`      | `https://your-ref.supabase.co`       |
| `SUPABASE_PROJECT_REF`          | Your project ref (e.g., `abc123def`) |
| `CLOUDFLARE_PAGES_PROJECT_NAME` | `web` (or your Pages project name)   |

---

## Step 5: Local Development

### 5.1 Clone and Install

```bash
git clone https://github.com/your-org/scaifold.git
cd scaifold
npm install
```

### 5.2 Create Environment File

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```bash
VITE_PUBLIC_SUPABASE_URL=https://your-ref.supabase.co
VITE_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5.3 Run Locally

```bash
npm run dev:web
```

Open [http://localhost:5173](http://localhost:5173)

---

## Step 6: Stripe (Optional)

If you need payments:

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Get **Publishable key** (→ `VITE_PUBLIC_STRIPE_KEY`)
3. Get **Secret key** (→ `STRIPE_SECRET_KEY`)
4. Configure webhooks in Supabase Edge Functions

---

## Step 7: PostHog (Optional)

1. Go to [posthog.com](https://posthog.com) → Create account
2. Create a new project (choose **Web** platform)
3. Copy your **API key** from Settings → Projects
4. Add to `apps/web/src/app.html`:

```html
<script>
  posthog.init('your-api-key', { api_host: 'https://app.posthog.com' });
</script>
```

Or use the PostHog SDK - see `docs/api-keys/posthog.md`

---

## Quick Reference: All Environment Variables

### Frontend (`apps/web/.env.local`)

| Variable                        | Example Value                |
| ------------------------------- | ---------------------------- |
| `VITE_PUBLIC_SUPABASE_URL`      | `https://abc123.supabase.co` |
| `VITE_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...`                     |

### Supabase Edge Function Secrets (via `supabase secrets set`)

| Secret              | Purpose         |
| ------------------- | --------------- |
| `STRIPE_SECRET_KEY` | Stripe payments |

### Not Set via CLI (Manual Configuration)

| Secret           | Where to Configure                                        |
| ---------------- | --------------------------------------------------------- |
| `RESEND_API_KEY` | Supabase Dashboard → Authentication → Email → Custom SMTP |

---

## Troubleshooting

### "Redirect URL mismatch" on login

Add your exact URL to **Supabase → Authentication → URL Configuration → Redirect URLs**

### "JWT verification failed"

Ensure `VITE_PUBLIC_SUPABASE_ANON_KEY` matches your Supabase project exactly

### Emails not sending

1. Verify Resend domain is **Verified** in Resend dashboard
2. Check **Supabase → Authentication → Providers → Email → Custom SMTP** is enabled

### Cloudflare Pages build failing

1. Verify `NODE_VERSION` environment variable is set to `20` in Pages settings
2. Check build command is `npm run build` and output directory is `dist`

### Terraform DNS not working

1. Verify `CLOUDFLARE_ZONE_ID` is for the correct domain
2. Ensure API token has **DNS:Edit** permission

---

## Next Steps

After setup completes:

1. **Read the Architecture** → `docs/architecture.md`
2. **Customize the Kitchen App** → `apps/web/src/ui/kitchen/`
3. **Deploy to Production** → `docs/deployment.md`
