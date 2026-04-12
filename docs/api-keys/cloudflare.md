# Cloudflare Setup Guide

## Overview

Cloudflare provides edge computing (Workers), static site hosting (Pages), DNS management, and CDN services.

## Step 1: Create a Cloudflare Account

1. Go to [https://dash.cloudflare.com/](https://dash.cloudflare.com/)
2. Sign up with your email or sign in with an existing provider
3. Complete the onboarding process

## Step 2: Add Your Domain (Zone)

1. In the Cloudflare dashboard, click **Add a site**
2. Enter your domain name (e.g., `yourdomain.com`)
3. Choose a plan:
   - **Free**: Basic CDN, DDoS protection, edge caching
   - **Pro/Paid**: Enhanced features, faster performance
4. Click **Add site**
5. Cloudflare will scan your existing DNS records
6. Review and confirm the records
7. Update your domain's nameservers to Cloudflare's:
   ```
   amir.ns.cloudflare.com
   lisa.ns.cloudflare.com
   ```
   (These will be provided after adding the site)

## Step 3: Get Your Account ID and Zone ID

### Account ID

1. In Cloudflare dashboard, click on your profile/account
2. Find **Account ID** on the right side of the page
3. Or go to any Workers & Pages overview - it's in the URL or sidebar

### Zone ID

1. Select your domain (zone) in Cloudflare dashboard
2. Go to **Overview**
3. Scroll to the **API** section on the right
4. Copy the **Zone ID**

```bash
# Store these for Terraform/CI
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_ZONE_ID=your-zone-id
```

## Step 4: Install and Configure Wrangler CLI

### Installation

```bash
# Install globally via npm
npm install -g wrangler

# Or use as a dev dependency in your project
npm install -D wrangler
```

### Authentication

```bash
# Authenticate with your Cloudflare account
wrangler login

# This will open a browser window for OAuth
# Approve the permissions
# Close the browser and return to terminal
```

### Verify Authentication

```bash
wrangler whoami
```

## Step 5: Create an API Token

For Terraform, CI/CD, or automation (not for local Wrangler use):

1. Go to [API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Click **Create Custom Token**
4. Configure:

| Permission | Resource           | Access |
| ---------- | ------------------ | ------ |
| Account    | Cloudflare Workers | Edit   |
| Zone       | DNS                | Edit   |
| Zone       | Zone               | Read   |

5. Set **Zone Resources** to your specific domain
6. Click **Continue to Summary**
7. Click **Create Token**
8. **Important**: Copy and save the token immediately - it won't be shown again

```bash
# Store securely
CLOUDFLARE_API_TOKEN=your-api-token-here
```

## Step 6: Set Up Cloudflare Pages

### Option A: Connect via Git (Recommended)

1. Go to **Workers & Pages** in Cloudflare dashboard
2. Click **Create application**
3. Select **Pages** → **Connect to Git**
4. Authorize your Git provider (GitHub, GitLab)
5. Select your repository
6. Configure:
   - **Project name**: Your project name
   - **Production branch**: `main` (or your choice)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist` or `apps/web/dist`
7. Add environment variables if needed
8. Click **Save and Deploy**

### Option B: Direct Upload

1. Go to **Workers & Pages** → **Create application** → **Pages** → **Direct Upload**
2. Drag and drop your built static files
3. Or use `wrangler pages deploy`:

```bash
wrangler pages deploy dist --project-name=my-app
```

## Step 7: Deploy Cloudflare Workers

### Configure wrangler.toml

Create `wrangler.toml` in your Worker project:

```toml
name = "my-worker"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[env.production]
name = "my-worker"
routes = [
  { pattern = "api.yourdomain.com", zone_name = "yourdomain.com" }
]
```

### Deploy

```bash
# Deploy to production
wrangler deploy

# Deploy to a specific environment
wrangler deploy --env staging
```

### Local Development

```bash
wrangler dev
# Starts a local dev server at http://localhost:8787
```

## Step 8: Configure DNS

### Via Cloudflare Dashboard

1. Go to **DNS** for your zone
2. Add or edit records:

| Type  | Name | Content                 | Proxy status |
| ----- | ---- | ----------------------- | ------------ |
| A     | api  | 192.0.2.1               | DNS only     |
| CNAME | www  | your-worker.workers.dev | Proxied      |
| A     | @    | 192.0.2.1               | Proxied      |

### Via Terraform (Recommended)

See `infra/terraform/` in this repo for DNS management:

```hcl
resource "cloudflare_record" "api" {
  zone_id = var.cloudflare_zone_id
  name    = "api"
  value   = "your-worker.workers.dev"
  type    = "CNAME"
  proxied = true
}
```

## Step 9: Set Up Custom Domain for Worker

1. Deploy your Worker
2. Go to **Workers & Pages** → Select your Worker
3. Click **Triggers** → **Custom Domains**
4. Click **Add Custom Domain**
5. Enter your subdomain (e.g., `api.yourdomain.com`)
6. Cloudflare will automatically create the DNS record
7. Wait for SSL certificate to provision

## Environment Variables for Workers

```bash
# In wrangler.toml for secrets
[vars]
ENVIRONMENT = "production"

# For sensitive values, use secrets
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
# Enter the value when prompted
```

## Verification Checklist

- [ ] Cloudflare account created
- [ ] Domain added and nameservers updated
- [ ] Account ID and Zone ID copied
- [ ] Wrangler CLI installed and authenticated
- [ ] API token created (for Terraform/CI)
- [ ] Pages project connected or direct upload configured
- [ ] Worker deployed (if applicable)
- [ ] DNS records configured
- [ ] Custom domain set up for Worker

## Troubleshooting

### "Could not resolve `wrangler login`"

1. Ensure you're running a modern terminal
2. Try `npx wrangler login` instead of global install
3. Check network connectivity

### DNS changes not taking effect

1. DNS changes can take up to 24-48 hours
2. Most changes propagate within minutes
3. Clear local DNS cache: `sudo dscacheutil -flushcache` (macOS)
4. Check propagation at [dnschecker.org](https://dnschecker.org)

### SSL certificate issues

1. Wait 15-30 minutes for automatic provisioning
2. Ensure your domain is active and not paused
3. Check for "SSL/TLS" in Cloudflare dashboard under your domain
4. Set SSL mode to "Full" or "Full (strict)"

### Pages build failing

1. Check build command and output directory in Pages settings
2. Verify environment variables are set correctly
3. Check build logs in Cloudflare dashboard
4. Ensure Node version compatibility

### Worker not accessible

1. Check Workers & Pages → your Worker → **Logs**
2. Verify the route is correctly configured
3. Ensure the Worker is deployed to the correct environment
4. Check for runtime errors in the logs

## Common Configurations

### Full Stack App with Pages + Workers

```
yourdomain.com          → Pages (static frontend)
api.yourdomain.com      → Worker (API endpoints)
```

### DNS Records

| Route              | Type   | Target         |
| ------------------ | ------ | -------------- |
| yourdomain.com     | Pages  | \*.pages.dev   |
| api.yourdomain.com | Worker | \*.workers.dev |

## Security Best Practices

- **Use API tokens** instead of global API keys when possible
- **Enable HTTPS** on all routes (Cloudflare provides free SSL)
- **Set appropriate cache TTLs** for static assets
- **Use Cloudflare WAF** rules for additional protection
- **Rate limit** API endpoints via Workers

## Useful Commands

```bash
# Check Wrangler version
wrangler --version

# List all Workers
wrangler deployments list

# Tail logs
wrangler tail

# Check secret values
wrangler secret list

# Delete a Worker
wrangler delete my-worker

# Preview a Worker
wrangler dev --env production
```

## Cost

- **Workers**: Free tier includes 100,000 requests/day
- **Pages**: Free for unlimited sites with some limitations
- **DNS**: Free with any plan
- **SSL**: Free
- See [Cloudflare pricing](https://www.cloudflare.com/plans/) for details

## Next Steps

- Configure [Supabase](./supabase.md) for database and auth
- Set up [PostHog](./posthog.md) for error tracking and analytics
- Set up [Resend](./resend.md) for emails
- Configure Terraform in `infra/terraform/` for infrastructure as code
