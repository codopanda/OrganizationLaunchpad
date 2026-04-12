# Google OAuth Setup via Supabase

## Overview

This guide configures Google OAuth authentication through Supabase, allowing users to sign in with their Google accounts.

## Prerequisites

- A Google account
- A Supabase project (see [supabase.md](./supabase.md))

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Enter project details:
   - **Project name**: e.g., `myapp-auth`
   - **Location**: Organization or No organization
4. Click **Create**
5. Wait for project to be created, then select it

## Step 2: Enable Google OAuth

1. In Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for **Google+ API** or **G Suite**
3. Click on it and click **Enable**

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (for production with external users)
3. Click **Create**
4. Fill in required fields:
   - **App name**: Your app name
   - **User support email**: Your support email
   - **Developer contact**: Your email
5. Click **Save and Continue**
6. On **Scopes** page, click **Add or Remove Scopes**
7. Select:
   - `../auth/userinfo.email` - See your primary Google Account email
   - `../auth/userinfo.profile` - See your personal info, including any personal info you've made publicly visible
8. Click **Save and Continue**
9. On **Test users** page, add your Google account for testing
10. Click **Save and Continue**
11. Review your summary and click **Back to Dashboard**

## Step 4: Get OAuth Client ID and Secret

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. For **Application type**, select **Web application**
4. Enter name: e.g., `Supabase OAuth`
5. Under **Authorized redirect URIs**, click **Add URI** and enter:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
   Replace `<your-project-ref>` with your Supabase project reference ID.
6. Click **Create**
7. Copy the **Client ID** and **Client Secret**

## Step 5: Configure Google Provider in Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Authentication** → **Providers**
3. Click on **Google**
4. Toggle **Enable Google** to ON
5. Enter:
   - **Client ID**: Your Google OAuth Client ID
   - **Client Secret**: Your Google OAuth Client Secret
6. Click **Save**

## Step 6: Add Redirect URLs in Both Google and Supabase

### Google Cloud Console Redirect URIs

1. In Google Cloud Console → **Credentials**
2. Click on your OAuth client
3. Add all redirect URIs your app will use:

```
https://<your-project-ref>.supabase.co/auth/v1/callback
https://yourdomain.com/auth/callback
http://localhost:5173/auth/callback
http://localhost:3000/auth/callback
```

### Supabase Redirect URLs

1. In Supabase → **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:

```
https://<your-project-ref>.supabase.co/auth/v1/callback
https://yourdomain.com/auth/callback
http://localhost:5173
http://localhost:5173/auth/callback
http://localhost:3000
http://localhost:3000/auth/callback
```

> **Tip**: The redirect URL format for Supabase is typically `<SITE_URL>/auth/callback`. Ensure this matches exactly what you set in Supabase's URL Configuration.

## Step 7: Test the Integration

### Test Locally

1. Start your application locally
2. Navigate to your login page
3. Click "Sign in with Google"
4. Complete the Google OAuth flow
5. Verify you're redirected back to your app and logged in

### Verify in Supabase

1. Go to **Authentication** → **Users**
2. You should see the user who just signed up
3. Click on the user to see their details and provider info

## Troubleshooting

### "redirect_uri_mismatch" error

1. This means the redirect URI in Google doesn't match what Supabase expects
2. Double-check the URI in Google Cloud Console matches exactly:
   - Format: `https://<project-ref>.supabase.co/auth/v1/callback`
   - No trailing slashes
   - Correct project reference (check in Supabase → Settings → API)

### Google OAuth not appearing in login page

1. Ensure the Google provider is enabled in Supabase
2. Verify Client ID and Secret are entered correctly
3. Check browser console for errors

### Consent screen "unverified app" warning

1. For production, you'll need to verify your app with Google
2. During development/testing, add test users in the OAuth consent screen settings
3. Test users can bypass the verification warning

### CORS errors

1. Ensure your domain is allowed in Supabase's redirect URLs
2. For local development, ensure localhost URLs are added
3. Check that your Site URL in Supabase is configured correctly

## Security Notes

- **Client Secret** must never be exposed to the browser
- Store it as a server-side secret or Supabase Edge Function secret
- The Client ID is public and safe for browser use
- Always use HTTPS for OAuth redirects in production

## Environment Variables

```bash
# Supabase (browser-safe)
VITE_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
VITE_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Google OAuth (server-side or Supabase secrets)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

## Next Steps

- [Resend](./resend.md) for transactional emails
- [Cloudflare](./cloudflare.md) for hosting
