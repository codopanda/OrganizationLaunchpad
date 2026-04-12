# Supabase Setup Guide

## Overview

Supabase provides authentication, Postgres database with Row Level Security, storage, edge functions, and realtime capabilities.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Enter project details:
   - **Name**: e.g., `myapp-production`
   - **Database Password**: Generate a strong password and store it in your password manager
   - **Region**: Choose the region closest to your users
   - **Pricing Plan**: Select appropriate tier
4. Click **Create new project**
5. Wait for the project to be provisioned (2-3 minutes)

## Step 2: Get API Keys

1. In your project dashboard, go to **Project Settings** (gear icon)
2. Click **API**
3. You'll find three important values:

| Key                 | Environment Variable            | Purpose                         |
| ------------------- | ------------------------------- | ------------------------------- |
| Project URL         | `VITE_PUBLIC_SUPABASE_URL`      | Your Supabase instance endpoint |
| anon public key     | `VITE_PUBLIC_SUPABASE_ANON_KEY` | Safe for browser use            |
| service_role secret | `SUPABASE_SERVICE_ROLE_KEY`     | **Never expose to browser**     |

```bash
# Example values (replace with yours)
VITE_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
VITE_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 3: Enable Email/Password Authentication

1. Go to **Authentication** in the left sidebar
2. Click **Providers**
3. Click **Email**
4. Ensure **Enable Email** is toggled ON
5. Configure:
   - **Confirm email**: ON (recommended for production)
   - **Allow new users to sign up**: ON (until you have invite-only system)
6. Click **Save**

## Step 4: Configure Site URL and Redirect URLs

1. In **Authentication** → **URL Configuration**
2. Set the following:

| Setting       | Value                                  | Notes                          |
| ------------- | -------------------------------------- | ------------------------------ |
| Site URL      | `https://yourdomain.com`               | Your production domain         |
| Redirect URLs | `https://yourdomain.com/auth/callback` | Add all possible callback URLs |

### Local Development Redirect URLs

Add these for local development:

```
http://localhost:5173
http://localhost:5173/auth/callback
http://localhost:3000
http://localhost:3000/auth/callback
```

### Production Redirect URLs

Add your production domains:

```
https://yourdomain.com
https://yourdomain.com/auth/callback
https://www.yourdomain.com
https://www.yourdomain.com/auth/callback
```

> **Tip**: For OAuth providers (Google, GitHub), you'll add redirect URLs there too. Keep this list updated as you add new domains.

## Step 5: Run Database Migrations

### Option A: Using Supabase CLI (Recommended)

1. Install the Supabase CLI:

```bash
npm install -g supabase
```

2. Link to your remote project:

```bash
supabase link --project-ref <your-project-ref>
```

Your project ref is the random string in your Project URL (e.g., `xxxxx` in `https://xxxxx.supabase.co`).

3. Push migrations:

```bash
supabase db push
```

### Option B: Manual SQL via Dashboard

1. Go to **SQL Editor** in the Supabase dashboard
2. Create a new query
3. Paste your migration SQL
4. Click **Run**

### Option C: Local Development

```bash
# Start local Supabase stack
supabase start

# Apply migrations from this repo
supabase db push

# When done, stop the local stack
supabase stop
```

## Environment Variables Setup

Create a `.env` file for your frontend (`apps/web`):

```bash
# apps/web/.env
VITE_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
VITE_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

For backend/workers, use environment secrets (never commit these):

```bash
# For Workers/adapters
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Verification Checklist

- [ ] Project created successfully
- [ ] API keys copied and stored securely
- [ ] Email/password auth enabled
- [ ] Site URL configured
- [ ] Redirect URLs added (including localhost for development)
- [ ] Migrations applied
- [ ] Test authentication flow works

## Troubleshooting

### "Redirect URL mismatch" error

1. Double-check the redirect URLs in Authentication → URL Configuration
2. Ensure the URL in your app exactly matches (including trailing slashes)
3. For local dev, ensure `http://localhost:5173` is in the list

### JWT verification failing

1. Ensure you're using the correct anon key for the browser
2. Check that your system clock is accurate (JWTs are time-sensitive)
3. Verify the Supabase URL in your app matches exactly

### Migration errors

1. Check the error message for specific syntax issues
2. Ensure you're connected to the correct project
3. Some migrations may need to run in order (check for dependencies)

## Security Notes

- **Never expose `SUPABASE_SERVICE_ROLE_KEY`** to the browser or commit it to version control
- **Always use Row Level Security (RLS)** on your tables
- **Enable 2FA** on your Supabase account
- **Rotate keys** immediately if compromised

## Next Steps

After Supabase is configured, set up:

- [Google OAuth](./google-oauth.md) for social login
- [Resend](./resend.md) for transactional emails
- [PostHog](./posthog.md) for error tracking and analytics
- [Cloudflare](./cloudflare.md) for hosting
