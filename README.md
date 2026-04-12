# OrganizationLaunchpad

Turn AI-generated "vibecoded" apps into production-ready SaaS. Bring your frontend, add auth with minimal intervention, and get a deployable shell around it.

---

## Quick Start

Open your favorite agent (Cursor, Claude, Codex etc), and give it this prompt:

(Note it's always a good idea to read through random markdown files you give your agent to make sure it's not doing anything malicious)

> Read and follow this guide: https://raw.githubusercontent.com/codopanda/OrganizationLaunchpad/refs/heads/main/agent-guide.md

## What You Get

- Email/password + Google OAuth via Supabase
- GitHub Actions CI/CD
- Cloudflare Pages or Vercel deployment
- Supabase Database with Row Level Security (RLS)
- A shared auth shell you can attach to any existing app
- A framework-neutral starter for new apps that should use shared login/register by default

**Stack:** GitHub, Cloudflare Pages/Vercel, Supabase (Auth + Database)

## New App Path

If you are starting a new app, do not copy `apps/web`.

Use the framework-neutral starter in `templates/vanilla-auth-app`:

```bash
npm run new:app -- my-new-app
npm install
npm run dev -w my-new-app
```

That starter uses plain TypeScript and the shared auth Web Components, so the login/register/callback flow is not tied to Svelte or to the reference app.

## Setup

- [docs/setup-guide.md](docs/setup-guide.md)
- [docs/add-auth-to-existing-app.md](docs/add-auth-to-existing-app.md)

## Roadmap

### MVP

Get people to be able to create vibecoded apps through GitHub, and have them auto deployed to Cloudflare Pages.

Core stack:

- GitHub
- Cloudflare Pages
- Supabase

### V1: Lovable Export

Get people to be able to go from their Lovable app to this repo.

- instructions on how to copy code from Lovable to local
- bring the app into this repo
- push to GitHub
- auto deploy to Cloudflare Pages

### V2: Better Login

Get people to be able to create users for their apps through Supabase login and Cloudflare Pages.

Additional service:

- Google Cloud for Google Auth

Focus:

- Supabase auth setup
- email/password login
- Google OAuth
- shared login/register flow for deployed apps

### V3: Additional Features

- PostHog
- Stripe
- Resend
