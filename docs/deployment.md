# Deployment Guide

This guide walks you through deploying the OrganizationLaunchpad scaffold to production. Follow each section in order.

---

## 1. Prerequisites

### Required Accounts

| Service    | Sign Up                                                  | Purpose                        |
| ---------- | -------------------------------------------------------- | ------------------------------ |
| Cloudflare | [dash.cloudflare.com](https://dash.cloudflare.com)       | Pages (hosting), DNS           |
| Supabase   | [supabase.com/dashboard](https://supabase.com/dashboard) | Auth, Database, Edge Functions |
| GitHub     | [github.com](https://github.com)                         | CI/CD, Repository              |

### Required Tools

```bash
# Node.js 20+
node --version  # >= 20.0.0

# Supabase CLI
npm install -g supabase

# Terraform >= 1.5.0 (for DNS)
terraform --version

# Git
git --version
```

### Local Setup

```bash
# Clone the repository
git clone https://github.com/your-org/organization-launchpad.git
cd organization-launchpad

# Install dependencies
npm install
```

### Get Required API Keys

Before deploying, gather these credentials (see `docs/api-keys/` for detailed setup):

1. **Supabase**: Project URL, anon key, service role key
2. **Cloudflare**: Account ID, Zone ID, API Token

---

## 2. Frontend (Cloudflare Pages)

### Option A: Connect via GitHub (Recommended)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**

2. Authorize GitHub and select your repository

3. Configure the project:
   - **Project name**: `web`
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`

4. Add environment variables in Pages settings:

   ```
   NODE_VERSION: 20
   ```

5. Click **Save and Deploy**

### Option B: Manual Deploy

```bash
# Build the frontend
npm run build:web

# Deploy to Cloudflare Pages
npx wrangler pages deploy apps/web/dist --project-name=web
```

### Verify Deployment

1. Cloudflare will provide a `.pages.dev` URL
2. Visit the URL to confirm the site loads
3. Note this URL for DNS and Terraform configuration

### Troubleshooting

| Issue            | Solution                                          |
| ---------------- | ------------------------------------------------- |
| Build fails      | Check Node version matches `20` in Pages settings |
| 404 on assets    | Verify build output directory is `dist`           |
| Missing env vars | Add `VITE_PUBLIC_*` variables in Pages settings   |

---

## 3. Supabase Edge Functions

Supabase Edge Functions handle server-side logic (webhooks, cross-service orchestration). The database handles most CRUD via RLS.

### Deploy Edge Functions

```bash
# Install Supabase CLI if not already
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy all functions in supabase/functions/
supabase functions deploy
```

### Set Environment Variables

```bash
# Set secrets for edge functions
supabase secrets set RESEND_API_KEY=re_your-key
supabase secrets set STRIPE_SECRET_KEY=sk_live_your-key
```

### Health Check Function

A health check function is included at `supabase/functions/health/`. Access it at:

```
https://your-project.supabase.co/functions/v1/health
```

### Custom Domains for Edge Functions

Edge Functions run on `*.supabase.co` by default. For custom domains, consider:

1. Cloudflare proxy to `your-project.supabase.co`
2. Or use Cloudflare Workers as a proxy

---

## 4. Database (Supabase)

### Create a Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New Project**
2. Set **Name**: `yourapp-production`
3. Set **Database Password**: Generate and store securely
4. Select **Region**: Closest to your users
5. Wait for provisioning (2-3 minutes)

### Get API Keys

1. Go to **Project Settings** → **API**
2. Copy:
   - **Project URL** → `VITE_PUBLIC_SUPABASE_URL`
   - **anon public key** → `VITE_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY` (keep private)

### Configure Authentication

1. **Authentication** → **Providers** → **Email**
2. Enable **Enable Email**
3. Set **Confirm email**: ON
4. Set **Allow new users to sign up**: ON (until invite-only)

### Configure Site URL

1. **Authentication** → **URL Configuration**
2. Set:
   - **Site URL**: `https://yourdomain.com`
   - **Redirect URLs**:
     ```
     https://yourdomain.com
     https://yourdomain.com/auth/callback
     https://www.yourdomain.com
     https://www.yourdomain.com/auth/callback
     http://localhost:5173
     http://localhost:5173/auth/callback
     ```

### Run Database Migrations

```bash
# Link to your remote project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### Verify Setup

```bash
# Test database connection
supabase db check
```

### Troubleshooting

| Issue                  | Solution                                            |
| ---------------------- | --------------------------------------------------- |
| Redirect URL mismatch  | Add exact URL to Authentication → URL Configuration |
| JWT verification fails | Ensure anon key matches your Supabase project       |
| Migration fails        | Check migration SQL syntax; run in order            |

---

## 5. DNS (Terraform)

### Install Terraform

```bash
# macOS
brew install terraform

# Verify
terraform --version  # >= 1.5.0
```

### Configure Variables

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
    content = "your-app.pages.dev"  # From Cloudflare Pages
    proxied = true
  }
}
```

### Get Cloudflare Credentials

1. **Zone ID**: Cloudflare Dashboard → Your domain → Overview → API section
2. **API Token**: Profile → API Tokens → Create Custom Token with:
   - Account: Workers:Edit
   - Zone: DNS:Edit
   - Zone: Zone:Read

### Apply DNS Configuration

```bash
# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Apply (type 'yes' when prompted)
terraform apply
```

### Verify DNS Records

```bash
# List created records
terraform output record_ids

# Or check in Cloudflare Dashboard → DNS
```

### Troubleshooting

| Issue                 | Solution                                       |
| --------------------- | ---------------------------------------------- |
| `zone_id` not found   | Verify zone is added to Cloudflare dashboard   |
| Token permissions     | Ensure API token has DNS:Edit permission       |
| Record already exists | `terraform apply` will update existing records |

---

## 6. Environment Variables

### Frontend (`apps/web`)

Set in Cloudflare Pages → Settings → Environment Variables:

| Variable                        | Value                          | Notes                  |
| ------------------------------- | ------------------------------ | ---------------------- |
| `VITE_PUBLIC_SUPABASE_URL`      | `https://your-ref.supabase.co` | From Supabase settings |
| `VITE_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...`                       | Public anon key        |
| `NODE_VERSION`                  | `20`                           | Required for build     |

### Local Development

```bash
# .env.local
VITE_PUBLIC_SUPABASE_URL=https://your-ref.supabase.co
VITE_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 7. CI/CD

### Included GitHub Actions Workflows

The repo includes three workflow files in `.github/workflows/`:

| Workflow        | Purpose                                       | Trigger                            |
| --------------- | --------------------------------------------- | ---------------------------------- |
| `ci.yml`        | Lint, type check, test, build                 | Every push/PR                      |
| `deploy.yml`    | Deploy frontend + edge functions + migrations | Push to main, manual               |
| `terraform.yml` | Apply DNS changes via Terraform               | Push to main (infra/ only), manual |

### Required GitHub Secrets

In GitHub → Settings → Secrets and Variables → Actions:

**Secrets (private):**

| Secret                  | Value                          | Used By                                     |
| ----------------------- | ------------------------------ | ------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | Cloudflare API token           | Pages, Terraform                            |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID          | Pages                                       |
| `SUPABASE_ACCESS_TOKEN` | Supabase personal access token | Edge Functions, Migrations                  |
| `SUPABASE_ANON_KEY`     | Supabase anon key              | Pages env vars (frontend)                   |
| `SUPABASE_DB_URL`       | Database connection string     | Migrations                                  |
| `RESEND_API_KEY`        | Resend API key                 | **Supabase Auth SMTP** (Dashboard, not CLI) |
| `STRIPE_SECRET_KEY`     | Stripe secret key              | **Supabase Edge Function secrets**          |

**Variables (can be public):**

| Variable                        | Value                                          |
| ------------------------------- | ---------------------------------------------- |
| `VITE_PUBLIC_SUPABASE_URL`      | `https://your-ref.supabase.co`                 |
| `SUPABASE_PROJECT_REF`          | Your Supabase project ref                      |
| `CLOUDFLARE_PAGES_PROJECT_NAME` | Cloudflare Pages project name (default: `web`) |

### Get Supabase Access Token

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → Account → Access Tokens
2. Create a new personal access token
3. Add to GitHub Secrets as `SUPABASE_ACCESS_TOKEN`

### Get Supabase Database URL

1. Go to Supabase Dashboard → Project Settings → Connection String
2. Copy the `DATABASE_URL` (URI format)
3. Add to GitHub Secrets as `SUPABASE_DB_URL`

### Workflow Details

**`deploy.yml`** performs these steps in parallel/sequence:

1. **Deploy Frontend** - Builds and deploys to Cloudflare Pages
2. **Deploy Edge Functions** - Links Supabase project, sets Stripe secret, deploys functions
3. **Deploy DB Migrations** - Pushes database migrations (main branch only)
4. **Update Pages Settings** - Updates environment variables in Cloudflare Pages

**Note**: `RESEND_API_KEY` is configured manually in **Supabase Dashboard → Authentication → Providers → Email → Custom SMTP** for sending auth emails (confirmations, password resets). This is not set via CLI.

**`terraform.yml`**:

1. Runs `terraform init` and `terraform fmt -check`
2. Runs `terraform plan` on every push
3. Runs `terraform apply` on push to main (auto-approved)

---

## 8. Domain Setup

### Domain Requirements

1. Register a domain (or use existing) with:
   - Cloudflare as the nameserver
   - DNS managed via Terraform (already configured)

### Update Cloudflare Nameservers

1. Get Cloudflare nameservers from dashboard:
   - Usually: `amir.ns.cloudflare.com`, `lisa.ns.cloudflare.com`
2. Update at your domain registrar:
   - Go to domain settings → Nameservers
   - Replace with Cloudflare nameservers
3. Wait 24-48 hours for propagation (usually minutes)

### Verify DNS Propagation

```bash
# Check DNS records
dig yourdomain.com CNAME

# Or use an online DNS checker
# https://dnschecker.org
```

### SSL/TLS Configuration

Cloudflare automatically provisions SSL certificates. Verify settings:

1. **SSL/TLS** → **Overview**
2. Set to **Full** or **Full (strict)**

### Custom Domain for Pages

If not automatically configured:

1. **Workers & Pages** → **web** → **Custom Domains**
2. Click **Setup** next to your domain
3. Cloudflare will add the necessary DNS record

### Final Verification Checklist

- [ ] Frontend accessible at `https://yourdomain.com`
- [ ] Supabase Edge Functions accessible
- [ ] SSL certificate active (green lock in browser)
- [ ] DNS propagating correctly
- [ ] Supabase authentication working
- [ ] CI/CD pipeline green

---

## Quick Reference

### Common Commands

```bash
# Build frontend
npm run build:web

# Deploy Supabase Edge Functions
supabase functions deploy

# Terraform DNS
cd infra/terraform && terraform apply

# Run migrations
supabase link --project-ref your-ref && supabase db push

# Set Supabase secrets
supabase secrets set SECRET_NAME=value
```

### Key URLs

| Service              | URL                                                        |
| -------------------- | ---------------------------------------------------------- |
| Cloudflare Dashboard | https://dash.cloudflare.com                                |
| Supabase Dashboard   | https://supabase.com/dashboard                             |
| GitHub Actions       | https://github.com/your-org/organization-launchpad/actions |

### File Locations

| Component      | Path                   |
| -------------- | ---------------------- |
| Frontend       | `apps/web/`            |
| Edge Functions | `supabase/functions/`  |
| Terraform      | `infra/terraform/`     |
| Migrations     | `supabase/migrations/` |
| API Keys Docs  | `docs/api-keys/`       |
