# OrganizationLaunchpad — Agent Guide

You are helping a user add production services to their existing web app. Follow this guide exactly.

## What You Can Do With URLs

If your environment supports browser automation (Playwright, browser MCP, etc.):
- Navigate to URLs directly — do not ask the user to open them
- Click buttons and links by their visible label
- Take a screenshot after each major step so the user can confirm the right page is open
- If login, MFA, CAPTCHA, or a billing screen blocks you, stop and ask the user to complete that step, then resume

If you cannot open URLs:
- Give the user the exact URL to open
- Tell them exactly what they will see and what to click
- Wait for them to confirm before moving on

---

## Step 1 — Understand the User's Project

Before anything else, read the user's project:

1. Look for `package.json`, `vite.config.*`, `next.config.*`, or similar to identify the framework
2. Look for an existing `.env`, `.env.local`, or `.env.example` to understand what is already configured
3. Look for a `src/` or `app/` entry point so you know where code changes will go

Tell the user what you found: "I can see you're using [framework]. You have [X env vars] already configured."

---

## Step 2 — Choose Services

Ask the user:

> "Which services would you like to add? Tell me any combination of these:"
>
> - **Deploy** — Put your app on the internet (Vercel or Cloudflare Pages)
> - **Accounts** — User login and a database (Supabase)
> - **Payments** — Accept money from users (Stripe or Every.org)
> - **Email** — Send verification and transactional emails (Resend)
> - **Analytics** — Track how users use your app (PostHog)

Wait for the user's answer before continuing.

---

## Step 3 — Follow the Guides in Order

Services depend on each other. Always follow this order regardless of what the user picked:

```
1. Deploy (Vercel or Cloudflare) — all other keys go here
2. Accounts (Supabase)           — keys go into deploy platform
3. Payments (Stripe or Every.org) — keys or provider settings go into deploy platform
4. Email (Resend)                — SMTP settings go into Supabase; API key into deploy platform
5. Analytics (PostHog)           — project key goes into deploy platform
```

If the user did not pick a service, skip its guide. If they picked Email but not Accounts, warn them:

> "Resend needs to be configured inside Supabase. I'll need to set up Supabase first — is that okay?"

### Deploy

If the user wants to deploy, ask:

> "Which hosting platform would you prefer?"
> - **Vercel** — easiest for most frameworks, great Next.js support
> - **Cloudflare Pages** — fast global CDN, good for static sites and Vite apps

Then fetch and follow the matching guide:
- Vercel → `https://raw.githubusercontent.com/codopanda/OrganizationLaunchpad/main/guides/deploy-vercel.md`
- Cloudflare → `https://raw.githubusercontent.com/codopanda/OrganizationLaunchpad/main/guides/deploy-cloudflare.md`

### Accounts

Fetch and follow:
`https://raw.githubusercontent.com/codopanda/OrganizationLaunchpad/main/guides/accounts-supabase.md`

After finishing, paste the Supabase keys into the deploy platform:
- `NEXT_PUBLIC_SUPABASE_URL` / `VITE_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `VITE_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (mark as secret / do not expose to browser)

### Payments

Ask which payment provider the user wants:

- **Stripe** — subscriptions, checkout, billing portal, and webhooks
- **Every.org** — donation-focused payment flows; start at `https://www.every.org/signup?redirectUrl=%2Fdeveloper&title=Sign+up`

For Stripe, fetch and follow:
`https://raw.githubusercontent.com/codopanda/OrganizationLaunchpad/main/guides/payments-stripe.md`

After finishing, paste into the deploy platform:
- `STRIPE_PUBLISHABLE_KEY` (public — safe for frontend)
- `STRIPE_SECRET_KEY` (secret — server only)
- `STRIPE_WEBHOOK_SECRET` (secret — server only)

For Every.org, open the developer signup URL above, have the user complete any account/login steps, and document the selected integration details in `docs/api-keys/every-org.md` or the app-specific setup notes before wiring code.

### Email

Fetch and follow:
`https://raw.githubusercontent.com/codopanda/OrganizationLaunchpad/main/guides/email-resend.md`

After finishing:
- Paste `RESEND_API_KEY` into the deploy platform (secret)
- Paste the SMTP credentials into **Supabase → Authentication → Providers → Email → Custom SMTP** (the guide covers this)

### Analytics

Fetch and follow:
`https://raw.githubusercontent.com/codopanda/OrganizationLaunchpad/main/guides/analytics-posthog.md`

After finishing, paste into the deploy platform:
- `NEXT_PUBLIC_POSTHOG_KEY` / `VITE_PUBLIC_POSTHOG_KEY` (public — safe for frontend)
- `NEXT_PUBLIC_POSTHOG_HOST` / `VITE_PUBLIC_POSTHOG_HOST` (set to `https://us.i.posthog.com`)

---

## Step 4 — Verify Everything

After all chosen services are set up:

1. Trigger a new deploy on the platform (push a commit, or click **Redeploy**)
2. Visit the live URL
3. Test each service that was configured:
   - **Accounts** — sign up with a new email address, confirm the email arrives, log in
   - **Payments** — run a provider-specific test checkout or donation flow; for Stripe, use card number `4242 4242 4242 4242`
   - **Email** — confirm the verification or welcome email arrived
   - **Analytics** — open PostHog and confirm an event appears within 30 seconds
4. Tell the user what passed and what to check if something did not work
