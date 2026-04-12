# Resend Email Setup

> **Coming in V3** — This service is documented but not yet wired in the MVP.

---

## Overview

Resend is a modern email API designed for developers, perfect for sending transactional emails like welcome emails, password resets, and notifications.

## Step 1: Create a Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up with GitHub or create an account with email
3. Complete the onboarding process

## Step 2: Add a Domain (Production) or Use Test Domain

### Option A: Use Test Domain (Quick Start)

1. After signing up, Resend provides a test domain: `resend.dev`
2. You can send emails to any recipient without verification
3. The sender will be: `onboarding@resend.dev` or similar
4. **Limitation**: Recipients may see these as spam; best for development only

### Option B: Add Your Domain (Production)

1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Click **Add Domain**
5. Resend will provide DNS records to add

## Step 3: Configure DNS Records

Add the following DNS records to your domain registrar (Cloudflare, Route53, etc.):

### SPF Record

| Type | Name | Value                               |
| ---- | ---- | ----------------------------------- |
| TXT  | @    | `v=spf1 include:spf.resend.io ~all` |

### DKIM Record

| Type | Name                | Value                                  |
| ---- | ------------------- | -------------------------------------- |
| TXT  | `resend._domainkey` | (Copy the value from Resend dashboard) |

### MX Record (if using Resend for inbound emails)

| Type | Name | Priority | Value           |
| ---- | ---- | -------- | --------------- |
| MX   | @    | 10       | `mx1.resend.io` |

### Verification

1. In Resend dashboard, click **Verify** next to your domain
2. DNS propagation may take up to 24-48 hours (usually几分钟)
3. Check status in Resend dashboard - all checks should be green

## Step 4: Get Your API Key

1. Go to [https://resend.com/api-keys](https://resend.com/api-keys)
2. Click **Create API Key**
3. Enter a name (e.g., `production-key`, `development-key`)
4. Select permissions:
   - **Full Access**: For production
   - **Restricted**: For specific permissions
5. Click **Create**
6. **Important**: Copy the API key immediately - it won't be shown again

```bash
# Your API key format
re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Step 5: Install and Configure

### Install Resend SDK

```bash
npm install resend
```

### Basic Usage Example

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendWelcomeEmail(to: string, name: string) {
  await resend.emails.send({
    from: 'Your App <noreply@yourdomain.com>',
    to: [to],
    subject: 'Welcome to Your App!',
    html: `
      <h1>Welcome, ${name}!</h1>
      <p>Thanks for joining Your App.</p>
    `,
  });
}

async function sendPasswordReset(to: string, resetToken: string) {
  await resend.emails.send({
    from: 'Your App <noreply@yourdomain.com>',
    to: [to],
    subject: 'Reset Your Password',
    html: `
      <p>Click the link below to reset your password:</p>
      <a href="https://yourdomain.com/reset-password?token=${resetToken}">
        Reset Password
      </a>
    `,
  });
}
```

## DNS Verification Commands

Verify your DNS records are properly configured:

```bash
# Check SPF record
dig TXT yourdomain.com +short

# Check DKIM record
dig TXT resend._domainkey.yourdomain.com +short

# Check MX record
dig MX yourdomain.com +short
```

## Troubleshooting

### Emails not sending

1. Verify domain status shows "Verified" in Resend dashboard
2. Check DNS records have propagated (use `dig` commands above)
3. Ensure API key is correct and active
4. Check for errors in Resend dashboard under "Logs"

### Emails going to spam

1. Ensure SPF, DKIM, and DMARC are properly configured
2. Warm up your domain by gradually increasing email volume
3. Use a custom domain, not the test `resend.dev` domain
4. Monitor deliverability in Resend dashboard

### DNS records not propagating

1. DNS can take up to 24-48 hours for full propagation
2. Most changes take effect within minutes to a few hours
3. Use a DNS checking tool like [dnschecker.org](https://dnschecker.org)
4. Check with your registrar for their typical propagation time

### "Domain not verified" error

1. Wait for DNS propagation
2. Double-check TXT record values match exactly what Resend provides
3. Ensure no trailing spaces in the record value
4. Remove duplicate records if any exist

## Environment Variables

```bash
# Development
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Production - store securely, never commit
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Security Notes

- **API Key** must never be exposed to the browser or committed to version control
- Use environment secrets in Cloudflare Workers, CI/CD, and server environments
- Rotate API keys immediately if compromised
- Use separate keys for development and production

## Testing

### Send a Test Email

```bash
curl -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "onboarding@resend.dev",
    "to": ["your-email@example.com"],
    "subject": "Test Email",
    "html": "<h1>Hello World</h1>"
  }'
```

### Email Deliverability Dashboard

Resend provides logs and analytics:

- Open the [Resend dashboard](https://resend.com/emails)
- Check delivery status, open rates, and bounce rates
- View detailed logs for each email

## Integration with Supabase

Resend is used by Supabase Auth to send transactional emails (confirmations, password resets, magic links).

### Configure in Supabase Dashboard

1. Go to **Supabase Dashboard** → **Authentication** → **Providers** → **Email**
2. Scroll to **Custom SMTP**
3. Enable Custom SMTP and enter:
   - **SMTP Host**: `smtp.resend.com`
   - **SMTP Port**: `587`
   - **SMTP User**: `resend`
   - **SMTP Password**: Your `RESEND_API_KEY`
   - **Sender Name**: Your app name
   - **Sender Email**: `noreply@yourdomain.com`

4. Click **Save**

This replaces Supabase's default email sending with your Resend account, giving you full control over email deliverability.

### Environment Variables

```bash
# Local development
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# GitHub Actions (for Edge Functions, not Auth)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### GitHub Actions Setup

For `deploy.yml` workflow, `RESEND_API_KEY` is set as a Supabase Edge Function secret (not Cloudflare Pages env var):

```bash
supabase secrets set RESEND_API_KEY=${{ secrets.RESEND_API_KEY }}
```

## Cost

- Free tier: 100 emails/day
- Paid plans start at $20/month for more volume
- Check [Resend pricing](https://resend.com/pricing) for details

## Next Steps

- [Cloudflare](./cloudflare.md) for hosting your application
- [PostHog](./posthog.md) for error tracking and analytics
- Configure email templates in Supabase for auth emails
