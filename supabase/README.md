# Supabase

Store Supabase-related project setup here.

## Included in this repo

- `migrations/` — starter `profiles` table with RLS policies tied to `auth.users`.
- `config.toml` — minimal Supabase CLI stub; install the [CLI](https://supabase.com/docs/guides/cli) and run `supabase link` / `supabase db push` as needed.

Examples:

- schema and migrations
- auth configuration notes
- row-level security policies
- seed data
- local development instructions

Supabase should handle user account setup and backend data concerns, but application business logic should remain outside Supabase-specific code where possible.

Credential onboarding: `docs/api-keys/supabase.md`.

