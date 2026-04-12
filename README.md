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
