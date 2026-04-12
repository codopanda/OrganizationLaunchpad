# API keys and credentials

Use this directory to document every external service an app depends on. Below is the full set used by the Scaifold scaffold itself.

| Service    | Purpose                                            | Doc                              |
| ---------- | -------------------------------------------------- | -------------------------------- |
| Cloudflare | DNS, Workers, Pages, API tokens                    | [cloudflare.md](./cloudflare.md) |
| Supabase   | Auth, Postgres, storage                            | [supabase.md](./supabase.md)     |
| PostHog    | Error tracking, analytics, session replay          | [posthog.md](./posthog.md)       |
| Terraform  | Same Cloudflare token + zone id for DNS automation | [terraform.md](./terraform.md)   |

Tauri desktop builds do not require a separate cloud API key; you need the Rust toolchain locally. See the root README.

## Environment variable map

| Variable                        | Where                  | Purpose                                                                      |
| ------------------------------- | ---------------------- | ---------------------------------------------------------------------------- |
| `VITE_PUBLIC_API_URL`           | `apps/web`             | Base URL for the Worker (`/health`).                                         |
| `VITE_PUBLIC_SUPABASE_URL`      | `apps/web`             | Supabase project URL.                                                        |
| `VITE_PUBLIC_SUPABASE_ANON_KEY` | `apps/web`             | Supabase anonymous (public) key for browser clients.                         |
| `VITE_POSTHOG_API_KEY`          | `apps/web`             | PostHog API key for frontend.                                                |
| `VITE_POSTHOG_HOST`             | `apps/web`             | PostHog instance URL.                                                        |
| `CORS_ORIGIN`                   | Worker (`workers/api`) | Allowed browser origin in production (set via Wrangler secret or dashboard). |
| `CLOUDFLARE_API_TOKEN`          | Terraform / CI         | DNS and zone APIs as scoped below.                                           |
| `CLOUDFLARE_ZONE_ID`            | Terraform              | Target zone for DNS records.                                                 |

**Never** put the Supabase **service role** key in frontend env vars. Use it only in trusted server or Worker code.

## Template per service

```md
## Service name

Purpose:

Console URL:

How to get the key:

Environment variables:

Ownership:

Rotation notes:
```

This documentation is intentionally part of the scaffold because operational setup is one of the main things vibecoded apps usually omit.
