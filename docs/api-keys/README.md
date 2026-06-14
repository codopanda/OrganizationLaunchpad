# API Keys and Credentials

> **MVP Status:** Supabase, Cloudflare, and Google OAuth are configured in the MVP. PostHog, Stripe, Every.org, Resend, and Terraform are documented but coming soon.

---

Use this directory to document every external service the scaffold supports.

## MVP Services (Available Now)

| Service      | Purpose                         | Doc                                  |
| ------------ | ------------------------------- | ------------------------------------ |
| Supabase     | Auth, Postgres, storage         | [supabase.md](./supabase.md)         |
| Cloudflare   | DNS, Pages, Workers, API tokens | [cloudflare.md](./cloudflare.md)     |
| Google OAuth | SSO via Supabase                | [google-oauth.md](./google-oauth.md) |

## Coming Soon

| Service   | Purpose                          | Doc                              |
| --------- | -------------------------------- | -------------------------------- |
| PostHog   | Analytics + error tracking       | [posthog.md](./posthog.md)       |
| Stripe    | Payments + subscriptions         | [stripe.md](./stripe.md)         |
| Every.org | Donation-focused payment options | [every-org.md](./every-org.md)   |
| Resend    | Transactional email              | [resend.md](./resend.md)         |
| Terraform | Cloudflare DNS automation        | [terraform.md](./terraform.md)   |

---

## Environment Variable Map

| Variable                        | Where          | Purpose                                      |
| ------------------------------- | -------------- | -------------------------------------------- |
| `VITE_PUBLIC_SUPABASE_URL`      | `apps/web`     | Supabase project URL.                        |
| `VITE_PUBLIC_SUPABASE_ANON_KEY` | `apps/web`     | Supabase anonymous (public) key for browser. |
| `VITE_POSTHOG_API_KEY`          | `apps/web`     | PostHog API key (V3+).                       |
| `VITE_POSTHOG_HOST`             | `apps/web`     | PostHog instance URL (V3+).                  |
| `CLOUDFLARE_API_TOKEN`          | CI / Terraform | DNS and Pages API access.                    |
| `CLOUDFLARE_ACCOUNT_ID`         | CI             | Cloudflare account identifier.               |

**Never** put the Supabase **service role** key in frontend env vars. Use it only in Edge Functions or CI secrets.

---

## Documentation Template

When adding a new service doc, use this structure:

```md
## Service Name

Purpose:

Console URL:

How to get the key:

Environment variables:

Ownership:

Rotation notes:
```

For payment providers, also include the provider-specific integration template when available. Every.org has a copyable app setup template in [every-org.md](./every-org.md).

This documentation is intentionally part of the scaffold because operational setup is one of the main things vibecoded apps usually omit.
